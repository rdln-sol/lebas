from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Customer, Employee, Manager

class UserRegisterForm(UserCreationForm):
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control inp-form mb-2',
            'placeholder': 'نام...',
            'autocomplete': 'off'
        })
    )
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control inp-form mb-2',
            'placeholder': 'نام خانوادگی...',
            'autocomplete': 'off'
        })
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control inp-form mb-2',
            'id': 'exampleFormControlInput1',
            'placeholder': 'name@example.com',
            'autocomplete': 'off'
        })
    )
    password1 = forms.CharField(
        label="رمز ورود",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control inp-form',
            'id': 'inputPassword1',
            'aria-describedby': 'passwordHelpBlock'
        })
    )
    password2 = forms.CharField(
        label="تکرار رمز ورود",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control inp-form mb-3',
            'id': 'inputPassword1',
            'aria-describedby': 'passwordHelpBlock'
        })
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password1', 'password2']

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['Address', 'phone_number']

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['salary', 'w_hours', 'type', 'address', 'phone_number', 'manager']

class ManagerForm(forms.ModelForm):
    class Meta:
        model = Manager
        fields = ['address', 'phone_number']

class LoginForm(forms.Form):
    username = forms.CharField(
        label='نام کاربری',
        widget=forms.TextInput(attrs={
            'class': 'form-control inp-form mb-2',
            'placeholder': 'ایمیل'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control inp-form mb-3',
            'aria-describedby': 'passwordHelpBlock'
        })
    )