# Generated by Django 3.0.5 on 2020-05-01 09:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tool', '0003_auto_20200501_0921'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documentlabel',
            name='startX',
            field=models.IntegerField(),
        ),
    ]
