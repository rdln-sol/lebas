# Generated by Django 5.0.6 on 2024-06-10 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_remove_employee_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='Address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='phone_number',
            field=models.CharField(blank=True, max_length=11, null=True),
        ),
    ]