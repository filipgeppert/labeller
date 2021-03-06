from django.db import models
from PIL import Image
from django.conf import settings
# Create your models here.


class DocumentLabel(models.Model):
    startX = models.IntegerField()
    startY = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
    # category = models.ManyToManyField("Category")
    # TODO: change it to what's above
    category = models.CharField(max_length=100, default="general")
    document = models.ForeignKey("Document", on_delete=models.CASCADE, related_name='documentlabels')


class TextLabel(models.Model):
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    text = models.TextField(max_length=1000)
    # category = models.ManyToManyField("Category")
    # TODO: change it to what's above
    category = models.CharField(max_length=100, default="general")
    paragraph = models.ForeignKey("Paragraph", on_delete=models.CASCADE, related_name='textlabels')

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
        self.height_factor = im.height / settings.IMAGE_HEIGHT_HTML
        self.width_factor = im.width / settings.IMAGE_WIDTH_HTML
        super(Document, self).save(*args, **kwargs)


class Paragraph(models.Model):
    text = models.TextField(max_length=10000)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='paragraphs')
    document_label = models.ForeignKey(DocumentLabel, on_delete=models.CASCADE)


class Category(models.Model):
    name = models.CharField(max_length=200)
