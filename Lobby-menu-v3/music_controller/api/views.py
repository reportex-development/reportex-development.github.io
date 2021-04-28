from django.shortcuts import render
from django.http import HttpResponse

# Create your views here. Api endpoints. Location on the webserver you are going to
def main(request):
    return HttpResponse("<h1>Hello</h1>")
