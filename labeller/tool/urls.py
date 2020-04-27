from django.urls import path

from . import views

urlpatterns = [
    path("", views.LabelTextView.as_view()),
    path("labelImage/", views.LabelImageView.as_view()),

    # AJAX calls
    path("ajax/saveLabelledText", views.save_labelled_text, name='save-labelled-text'),
]