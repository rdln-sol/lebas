from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import UserManager
from django.db.utils import IntegrityError


# Create your models here.
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        (1, 'customer'),
        (2, 'employee'),
        (3, 'manager'),
    )
    user_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES)

    objects = UserManager()

    REQUIRED_FIELDS = ['email', 'user_type']

    def save(self, *args, **kwargs):
        self.username = self.email
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="customer")
    Address = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=11, null=True, blank=True)

    def __str__(self) -> str:
        return self.user.get_full_name()
    
class Category(models.Model):
    category = models.PositiveSmallIntegerField(choices=(
        (1, 'مردانه'),
        (2, 'زنانه'),
        (3, 'بچگانه'),
        (4, 'کلاه'),
        (5, 'شال'),
        (6, 'روسری'),
        (7, 'بالاپوش'),
        (8, 'شلوار'),
        (9, 'جوراب'),
    ))

    def __str__(self):
        return self.get_category_display()

class Product(models.Model):
    price = models.DecimalField(max_digits=10, decimal_places=0)
    name = models.CharField(max_length=250)
    brand = models.CharField(max_length=250)
    categories = models.ManyToManyField(Category, related_name='products')

    def __str__(self):
        return self.name
    
class Color(models.Model):
    code = models.CharField(max_length=100)
    name = models.CharField(max_length=250)

    def __str__(self):
        return self.name

class Size(models.Model):
    name = models.CharField(max_length=5)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    color = models.ForeignKey(Color, on_delete=models.CASCADE)
    size = models.ForeignKey(Size, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('product', 'color', 'size')

    def __str__(self):
        return f'{self.product.name} - {self.color.name} - {self.size.name}'

class ProductPhoto(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='photo')
    image = models.ImageField(upload_to='product_images')
    alt = models.CharField(max_length=30, null=True, blank=True)

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_comments")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_comments")
    date = models.DateField(auto_now_add=True)
    text = models.TextField()
    like_dislike = models.PositiveSmallIntegerField(choices=(
        (1, 'like'),
        (2, 'dislike'),
    ),
    null=True, blank=True)

class Shopping_Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')

    def total_price(self):
        return sum(item.item.product.price * item.quantity for item in self.items.all())

class Cart_item(models.Model):
    item = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name="related_cart")
    date = models.DateField(auto_now=True)
    quantity = models.PositiveSmallIntegerField(default=0)
    cart = models.ForeignKey(Shopping_Cart, on_delete=models.CASCADE, related_name="items")

    class Meta:
        unique_together = ('cart', 'item')

class Manager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="manager")
    address = models.TextField()
    phone_number = models.CharField(max_length=11)

    def __str__(self) -> str:
        return self.user.get_full_name()

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='employee')
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    w_hours = models.IntegerField()
    type = models.PositiveSmallIntegerField()
    address = models.TextField()
    phone_number = models.CharField(max_length=11)
    manager = models.ForeignKey(Manager, on_delete=models.SET_NULL, related_name="employee", null=True, blank=True)
    
    def __str__(self) -> str:
        return self.user.get_full_name()

class Invoice(models.Model):
    user = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="invoice")
    cart = models.OneToOneField(Shopping_Cart, on_delete=models.CASCADE, related_name="invoice")
    amount = models.CharField(max_length=100)
    payment_date = models.DateField(auto_now_add=True)
    payment_type = models.PositiveSmallIntegerField(choices=(
        (1, 'نقدی'),
        (2, 'درگاه پرداخت'),
        (3, 'درب منزل'),
    ), default=1)

class Beneficent(models.Model):
    email = models.EmailField()

class Complimentary_product(models.Model):
    image = models.ImageField(upload_to="product_images")
    details = models.TextField()