from django.urls import path
from .views import index

"""
http://127.0.0.1:8000/api/home 

"""
urlpatterns = [
    path('', index)
]
