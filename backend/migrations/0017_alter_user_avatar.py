# Generated by Django 5.0.6 on 2024-06-12 01:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0016_alter_customer_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(default='img/AdminLTELogo.jpg', upload_to='media'),
        ),
    ]
