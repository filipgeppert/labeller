# Generated by Django 3.0.6 on 2020-05-08 10:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tool', '0003_auto_20200508_1049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='textlabel',
            name='paragraph',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='textlabels', to='tool.Paragraph'),
        ),
    ]
