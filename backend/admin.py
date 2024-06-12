from django.contrib import admin
from .models import Product, Color, Size, ProductVariant, Category, ProductPhoto, Shopping_Cart, Cart_item, User, Complimentary_product, Beneficent

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductPhotoInline(admin.TabularInline):
    model = ProductPhoto
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline, ProductPhotoInline]
    list_display = ('name', 'brand', 'price',)
    search_fields = ('name', 'brand',)
    list_filter = ('categories',)

admin.site.register(Product, ProductAdmin)
admin.site.register(Color)
admin.site.register(Size)
admin.site.register(ProductVariant)
admin.site.register(Category)
admin.site.register(ProductPhoto)
admin.site.register(Shopping_Cart)
admin.site.register(Cart_item)
admin.site.register(User)
admin.site.register(Complimentary_product)
admin.site.register(Beneficent)