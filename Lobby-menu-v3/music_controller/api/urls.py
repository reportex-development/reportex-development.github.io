from django.urls import path
from .views import RoomView

"""
http://127.0.0.1:8000/api/home 

"""

urlpatterns = [
    path('home', RoomView().as_view()),
]