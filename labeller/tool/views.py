import json
import json
import os

import cv2
from django.conf import settings
from django.core import serializers
from django.db.models import F, Count, Subquery, IntegerField, OuterRef
from django.http import JsonResponse
from django.views.generic import TemplateView, DetailView, ListView

from labeller.ocr.ocr import process_image_part
from labeller.ocr.utilities import resize_coordinates
from labeller.tool.models import Document, DocumentLabel, Paragraph, TextLabel


# Create your views here.


class LabelImageView(TemplateView):
    template_name = 'image-labelling/index.html'


class LabelTextView(DetailView):
    template_name = 'text-labelling/index.html'
    model = Document

    def get_context_data(self, **kwargs):
        ctx = super(LabelTextView, self).get_context_data(**kwargs)
        paragraphs = Paragraph.objects.filter(document_id=self.object.id) \
                                      .annotate(category=F('document_label__category'))

        ctx.update({
            'paragraphs': paragraphs,
            'paragraphs_json': serializers.serialize('json', paragraphs)
        })
        return ctx


class ListDocuments(ListView):
    template_name = 'list_documents.html'
    model = Document

    context_object_name = 'documents'

    def get_context_data(self, **kwargs):
        ctx = super(ListDocuments, self).get_context_data(**kwargs)
        return ctx

    def get_queryset(self):
        text_labels_count = Document.objects.annotate(text_labels_count=Count('paragraphs__textlabels')).filter(pk=OuterRef('pk'))
        labelled_paragraphs_count = Document.objects.annotate(labelled_paragraphs_count=Count('paragraphs')).filter(pk=OuterRef('pk'))

        queryset = Document.objects.annotate(
            text_labels_count=Subquery(text_labels_count.values('text_labels_count'), output_field=IntegerField()),
            labelled_paragraphs_count=Subquery(labelled_paragraphs_count.values('labelled_paragraphs_count'), output_field=IntegerField())
        )
        return queryset


def save_labelled_text(request):
    labelled_text = request.GET.get('labelledText', None)
    document_id = request.GET.get('documentId', None)
    paragraph_id = request.GET.get('paragraphId', None)
    paragraph = Paragraph.objects.filter(id=paragraph_id).get()

    if labelled_text is not None:
        labelled_text = json.loads(labelled_text)
        for selection in labelled_text['selections']:
            dl = TextLabel(
                start_index=selection['from'],
                end_index=selection['to'],
                text=selection['text'],
                category=selection['category'],
                paragraph=paragraph
            )
            dl.save()

    return JsonResponse({
        "message": "Data was saved."
    })


def save_image_labels(request):
    labelled_image = request.GET.get('labelledImage', None)
    document_id = request.GET.get('imageId', None)

    if labelled_image is None:
        return JsonResponse({
            "message": "There was a problem with document and labels saving."
        })

    labelled_image = json.loads(labelled_image)
    doc = Document.objects.filter(id=document_id).get()

    # Read an image and convert to rgb
    image_bgr = cv2.imread(os.path.join(settings.BASE_DIR, doc.image.url.strip("/")))
    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    # Save document labels
    for selection in labelled_image['selections']:
        d = DocumentLabel(
            startX=resize_coordinates(selection['x'], doc.width_factor),
            startY=resize_coordinates(selection['y'], doc.height_factor),
            width=resize_coordinates(selection['w'], doc.width_factor),
            height=resize_coordinates(selection['h'], doc.height_factor),
            category=selection['category'],
            document=doc
        )
        d.save()

        # Here we need to run ocr and create paragraphs
        paragraph_text = process_image_part(
            img_rgb,
            x=d.startX,
            y=d.startY,
            height=d.height,
            width=d.width,
            height_multiplier=1,
            width_multiplier=1
        )
        paragraph = Paragraph(
            text=paragraph_text,
            document=doc,
            document_label=d,
        )
        paragraph.save()
    return JsonResponse({
        "message": "Your document and labels were saved."
    })


# @csrf_exempt
def save_image(request):
    # TODO: implement this:
    # https://medium.com/zeitcode/asynchronous-file-uploads-with-django-forms-b741720dc952
    image = request.FILES.get('image', None)
    print(image)
    i = Document(image=image)
    i.save()
    return JsonResponse({
        "imageId": i.id
    })
