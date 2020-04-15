from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView

# Create your views here.


class LabelImageView(TemplateView):
    template_name = 'image-labelling/index.html'


class LabelTextView(TemplateView):
    template_name = 'text-labelling/index.html'

