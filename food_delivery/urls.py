from django.contrib import admin
from django.urls import path
from delivery import views  # 🚨 Put this import here, inside urls.py!

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Your Week 4 API Endpoint
    path('api/get-route/', views.get_delivery_route, name='get_delivery_route'),
]