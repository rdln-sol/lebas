# Generated by Django 5.0.6 on 2024-06-11 16:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_remove_product_total_cost'),
    ]

    operations = [
        migrations.AddField(
            model_name='color',
            name='code',
            field=models.CharField(default='1', max_length=100),
            preserve_default=False,
        ),
    ]