from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
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
