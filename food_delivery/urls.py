from django.contrib import admin
from django.urls import path
# Import from your APP name 'delivery'
from delivery.views import MapNodeList, RestaurantListView 
from delivery import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # The AI Lead's Map Nodes
    path('api/nodes/', MapNodeList.as_view(), name='node-list'),
    # Your 25 Karachi Restaurants
    path('api/restaurants/', RestaurantListView.as_view(), name='restaurant-list'),

    path('api/orders/', views.create_order, name='create-order'),
    
    # New Route Calculation API linking delivery_brain
    path('api/calculate-route/', views.calculate_route, name='calculate-route'),
]