# Generated by Django 5.0.6 on 2024-06-11 15:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0005_category_color_size_remove_product_category_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='total_cost',
        ),
    ]
