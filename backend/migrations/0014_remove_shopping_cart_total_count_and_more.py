# Generated by Django 5.0.6 on 2024-06-11 22:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_alter_cart_item_item'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shopping_cart',
            name='total_count',
        ),
        migrations.RemoveField(
            model_name='shopping_cart',
            name='total_price',
        ),
    ]
