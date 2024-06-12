from django.urls import path
from .views import *

urlpatterns = [
    path('', index, name="index"),
    path('profile/', profile, name="profile"),
    path('products/<int:pID>/', product_view, name="product"),
    path('products/<int:pID>/comment/', comment, name="comment"),
    path('cart/', cart, name="cart"),
    path('invoice/', createInvoice, name="invoice"),
    path('kheirie/', kheirie, name="kheirie"),
    path('confirm_khayyer/', confirm_khayyer, name="confirm_khayyer"),
    path('send_kheirie/', send_kheyrie, name="send_kheirie"),
    path('products/<int:pID>/increase/', increase, name="increase"),
    path('products/<int:pID>/decrease/', decrease, name="decrease"),
    path('register/', register_user, name="register"),
    path('confirm-user/', confirm_user, name="confirm"),
    path('login/', login_user, name="login"),
    path('logout/', logout_user, name="logout")
]
    