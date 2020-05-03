from django.urls import path, include

from . import views

urlpatterns = [
    path("labelText/", include([
        path("<int:pk>", views.LabelTextView.as_view(), name='label-text'),
        path("save", views.save_labelled_text, name='save-text'),
    ])),

    path("labelImage/", include([
        path("", views.LabelImageView.as_view(), name='label-image'),
        path("save", views.save_image_labels, name='save-image'),
        path("saveImage", views.save_image, name='save-image'),
    ])),
]