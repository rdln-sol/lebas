from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.http import HttpResponseRedirect
from .models import *
from .forms import *
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.core.mail import send_mail
import random
import string
from django.conf import settings

# Create your views here.

def user_is_customer(user):
    return user.user_type == 1

def user_is_employee(user):
    return user.user_type == 2

def user_is_manager(user):
    return user.user_type == 3

def index(request):
    context = {}
    if request.user.is_authenticated:
        user_cart = Shopping_Cart.objects.get_or_create(user=request.user)
        context['cart'] = user_cart
    men_products = Product.objects.filter(categories__id=1)
    women_products = Product.objects.filter(categories__id=2)
    products = Product.objects.all()
    context['products'] = products
    context['men_products'] = men_products
    context['women_products'] = women_products
    return render(request, 'index.html', context)

def product_view(request, pID):
    product = get_object_or_404(Product, id=pID)
    if request.method == 'POST':
        color = request.POST.get('color')
        size = request.POST.get('size')
        if not color or not size:
            messages.warning(request, 'لطفا رنگ و سایز را انتخاب کنید')
            return HttpResponseRedirect(reverse('product', args=(product.id,)))
        var = get_object_or_404(ProductVariant, size=size, color=color, product=product)
        if var.quantity < 1:
            messages.error(request, 'تموم شده !')
            return HttpResponseRedirect(reverse('product', args=(product.id,)))
        
        if request.user.is_authenticated:
            cart, created = Shopping_Cart.objects.get_or_create(user=request.user)
            cart_time, created = Cart_item.objects.get_or_create(cart=cart, item=var)
            cart_time.quantity += 1
            cart_time.save()
            var.quantity -= 1
            var.save()
            messages.success(request, f'لباس {var} به سبد خرید اضافه شد')
            return HttpResponseRedirect(reverse('product', args=(product.id,)))
        else:
            return redirect('login')

        
    variants = product.variants.all()
    user_cart = Shopping_Cart.objects.get_or_create(user=request.user)
    colors = {variant.color for variant in variants}
    sizes = {variant.size for variant in variants}
    comments = product.product_comments.exclude(user = request.user)
    user_comments = request.user.user_comments.all()
    return render(request, 'product_details.html', context={
        'product': product,
        'colors': colors,
        'sizes': sizes,
        'comments': comments,
        'user_comments': user_comments,
        'cart': user_cart
    })

@login_required
def comment(request, pID):
    body = request.POST.get('text')
    like_dislike = request.POST.get('like_dislike')
    product = get_object_or_404(Product, id=pID)
    user = request.user
    Comment(user=user, text=body, like_dislike=like_dislike, product=product).save()
    messages.success(request, 'نظر شما با موفقیت ثبت شد')
    return HttpResponseRedirect(reverse('product', args=(product.id,)))

@login_required
def cart(request):
    user_cart = Shopping_Cart.objects.get(user=request.user)
    total_price = user_cart.total_price()
    return render(request, 'cart.html', context={
        'cart': user_cart, 
        'total_price': total_price
    })

@login_required
def createInvoice(request):
    cart = Shopping_Cart.objects.get(user=request.user)
    total_price = cart.total_price()
    c = Customer.objects.get(user=request.user)
    Invoice.objects.get_or_create(user=c, cart=cart, amount=total_price, payment_type=2)
    invoices = Invoice.objects.filter(user=c)
    return render(request, 'dashboard.html', context={
        'invoices': invoices
    })

def kheirie(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        verification_code = ''.join(random.choices(string.digits, k=6))
        request.session['v_code'] = verification_code
        request.session['emai'] = email
        send_mail(
        subject='تایید ثبت نام',
        message=f'خیر عزیز ، ممنون از خیر شما \nکد تایید : {verification_code}',
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email]
        )

        return redirect('confirm_khayyer')
    return render(request, 'kheirie.html')

def confirm_khayyer(request):
    if request.method == 'POST':
        code = request.POST['code']
        v_code = request.session['v_code']
        if code == v_code:
            Beneficent.objects.get_or_create(email=request.session['emai'])
            return redirect('send_kheirie')
        else:
            messages.error(request, 'کد وارد شده اشتباه است')
    
    return render(request, 'confirm_user.html')

def send_kheyrie(request):
    if request.method == 'POST':
        image = request.FILES['image']
        details = request.POST['details']
        Complimentary_product(image=image, details=details).save()
        return redirect('index')
    return render(request, 'send_kheirie.html')


@login_required
def increase(request, pID):
    cart_item = get_object_or_404(Cart_item, id=pID)
    if cart_item.item.quantity < 1:
        messages.error(request, 'موجودی کالا کافی نیست!')
        return redirect('cart')
    cart_item.quantity += 1
    cart_item.item.quantity -= 1
    cart_item.item.save()
    cart_item.save()
    return redirect('cart')

@login_required
def decrease(request, pID):
    cart_item = get_object_or_404(Cart_item, id=pID)
    cart_item.quantity -= 1
    cart_item.item.quantity += 1
    cart_item.item.save()
    cart_item.save()
    if cart_item.quantity == 0:
        cart_item.delete()
    return HttpResponseRedirect(reverse('cart'))

@login_required
def profile(request):
    if request.method == 'POST':
        avatar = request.FILES.get('avatar')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        phone_number = request.POST.get('phone_number')
        email = request.POST.get('email')

        request.user.avatar = avatar
        request.user.first_name = first_name
        request.user.last_name = last_name
        request.user.email = email
        request.user.save()
        user_type = request.user.user_type
        if user_type == 1:
            c = Customer.objects.get(user=request.user)
            c.phone_number = phone_number
        if user_type == 2:
            e = Employee.objects.get(user=request.user)
            e.phone_number = phone_number
        if user_type == 3:
            m = Manager.objects.get(user=request.user)
            m.phone_number = phone_number
        request.user.customer.save()
        messages.success(request, 'اطلاعات کاربری با موفقیت ویرایش شد')
    return render(request, 'profile.html')

def change_pass(request):
    curr_pass = request.POST.get('current_password')
    passw = request.POST.get('password')
    conf_pass = request.POST.get('password_confirmation')
    if request.user.password == curr_pass:
        if passw == conf_pass:
            request.user.password = passw
            request.user.save()
            messages.success(request, 'رمز کاربر با موفقیت تغییر یافت')
        else:
            messages.error(request, 'رمز جدید اشتباه است')
    else:
        messages.error(request, 'رمز وارد شده اشتباه است')
    return render(request, 'profile.html')

@login_required
@user_passes_test(user_is_customer)
def customer_dashboard(request):
    return render(request, 'customer_dashboard.html')

@login_required
@user_passes_test(user_is_employee)
def employee_dashboard(request):
    return render(request, 'employee_dashboard.html')

@login_required
@user_passes_test(user_is_manager)
def manager_dashboard(request):
    return render(request, 'manager_dashboard.html')


def register_user(request):
    if request.user.is_authenticated:
        messages.warning(request, 'قبلا وارد شده اید')
        return redirect('index')
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)

        if form.is_valid():
            user = form.save(commit=False)
            user.user_type = 1
            user.is_active = False
            user.save()
            verification_code = ''.join(random.choices(string.digits, k=6))
            request.session['v_code'] = verification_code

            send_mail(
            subject='تایید ثبت نام',
            message=f'{user.first_name} عزیز ، ممنون از ثبت نام شما \nکد تایید : {verification_code}',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email]
            )

            request.session['user_id'] = user.id
            return redirect('confirm')
    form = UserRegisterForm()
    return render(request, 'register.html', {
        'form': form
    })



def confirm_user(request):
    if request.user.is_authenticated:
        return redirect('index')
    if request.method == 'POST':
        code = request.POST['code']
        v_code = request.session['v_code']
        if code == v_code:
            user = User.objects.get(id=request.session['user_id'])
            user.is_active = True
            user.save()
            customer = Customer()
            customer.user = user
            customer.save()
            login(request, user)
            messages.success(request, 'با موفقیت وارد شدید')
            return redirect('index')
        else:
            messages.error(request, 'کد وارد شده اشتباه است')
    
    return render(request, 'confirm_user.html')

    

def login_user(request):
    if request.user.is_authenticated:
        return redirect('index')
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                if user.user_type == 1:
                    messages.success(request, f'سلام {user.get_full_name()} ! با موفقیت به حساب کاربریت وارد شدی .')
                    return redirect('index')
                elif user.user_type == 2:
                    return redirect('employee_dashboard')
                elif user.user_type == 3:
                    return redirect('manager_dashboard')
            else:
                messages.error(request, 'نام کاربری یا رمز عبور اشتباه وارد شده است')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def logout_user(request):
    logout(request)
    messages.warning(request, 'با موفقیت از حساب خود خارج شدید!')
    return redirect('index')