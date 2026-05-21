from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Filme, Realizador, Ator

class PesquisaFilmeForm(forms.Form):
    query = forms.CharField(
        label='',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search for a movie, tv show, person...',
            'style': 'border: none; background: transparent; color: black; outline: none; box-shadow: none;'
        })
    )

class RegistoForm(UserCreationForm):
    first_name = forms.CharField(label="Primeiro Nome", max_length=30, required=True)
    last_name = forms.CharField(label="Último Nome", max_length=30, required=True)
    email = forms.EmailField(label="Email", required=True)


    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "first_name", "last_name", "email")

class FilmeForm(forms.ModelForm):
    class Meta:
        model = Filme
        fields = ['titulo', 'data_lancamento', 'sinopse', 'cartaz', 'realizador', 'atores', 'generos']
        widgets = {
            'data_lancamento': forms.DateInput(attrs={'type': 'date'}),
        }


class EditarPerfilForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Nova password (deixa em branco para manter a atual)'}),
        required=False,
        label="Redefinir Password"
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
        labels = {
            'username': 'Nome de Utilizador',
            'first_name': 'Primeiro Nome',
            'last_name': 'Último Nome',
            'email': 'E-mail',
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        nova_password = self.cleaned_data.get('password')
        if nova_password:
            user.set_password(nova_password)
        if commit:
            user.save()
        return user