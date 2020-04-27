from django.contrib import admin
from labeller.tool.models import Document, Paragraph, TextLabel, DocumentLabel, Category
# Register your models here.


admin.site.register(Document)
admin.site.register(Paragraph)
admin.site.register(TextLabel)
admin.site.register(DocumentLabel)
admin.site.register(Category)
