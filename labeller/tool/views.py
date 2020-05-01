from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
import json
from labeller.tool.models import Document, DocumentLabel, TextLabel, Category, Paragraph
from labeller.ocr.utilities import resize_coordinates
from labeller.ocr.ocr import process_image_part
from PIL import Image
import cv2
import os
from django.conf import settings
# Create your views here.


class LabelImageView(TemplateView):
    template_name = 'image-labelling/index.html'


class LabelTextView(TemplateView):
    template_name = 'text-labelling/index.html'


def save_labelled_text(request):
    labelled_text = request.GET.get('labelledText', None)
    document_id = request.GET.get('documentId', None)
    paragraph_id = request.GET.get('paragraphId', None)

    if labelled_text is not None:
        labelled_text = json.loads(labelled_text)
    print(labelled_text)
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
        )
        paragraph.save()

    return JsonResponse({
        "message": "Your document and labels were saved."
    })


@csrf_exempt
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
