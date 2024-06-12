# Generated by Django 5.0.6 on 2024-06-11 23:40

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_remove_shopping_cart_total_count_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cart_item',
            name='cart',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='backend.shopping_cart'),
        ),
    ]