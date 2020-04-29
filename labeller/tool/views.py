from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
import json
from labeller.tool.models import Document, DocumentLabel, TextLabel, Category, Paragraph

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
    imageId = request.GET.get('imageId', None)

    if labelled_image is not None:
        labelled_image = json.loads(labelled_image)

    return JsonResponse({
        "message": "Data was saved."
    })


@csrf_exempt
def save_image(request):
    image = request.FILES.get('image', None)
    print(image)
    i = Document(image=image)
    i.save()
    return JsonResponse({
        "message": "Data was saved."
    })