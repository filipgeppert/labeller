from django.db import models
from PIL import Image

# Create your models here.


class DocumentLabel(models.Model):
    startX = models.ImageField()
    startY = models.IntegerField()
    width = models.ImageField()
    height = models.ImageField()
    category = models.ManyToManyField("Category")
    document = models.OneToOneField("Document", on_delete=models.CASCADE, primary_key=True)


class TextLabel(models.Model):
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    text = models.TextField(max_length=1000)
    category = models.ManyToManyField("Category")
    paragraph = models.OneToOneField("Paragraph", on_delete=models.CASCADE)

    @property
    def length(self):
        return self.end_index - self.start_index


class Document(models.Model):
    image = models.ImageField()
    height = models.IntegerField()
    width = models.IntegerField()
    height_factor = models.FloatField(default=1.0)
    width_factor = models.FloatField(default=1.0)

    def save(self, *args, **kwargs):
        im = Image.open(self.image)
        self.height = im.height
        self.width = im.width
        super(Document, self).save(*args, **kwargs)


class Paragraph(models.Model):
    text = models.TextField(max_length=10000)
    document = models.OneToOneField(Document, on_delete=models.CASCADE, primary_key=True)


class Category(models.Model):
    name = models.CharField(max_length=200)
