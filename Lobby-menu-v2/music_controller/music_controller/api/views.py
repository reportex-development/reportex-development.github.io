from django.shortcuts import render
from django.http import HttpResponse

# Create your views here. Code Responsible for rendering the views.
def main(request):
    return HttpResponse("Hello")