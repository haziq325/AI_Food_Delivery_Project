from django.urls import path
from .views import MapNodeList, RestaurantListView

urlpatterns = [
    # Existing paths like admin/ ...
    path('api/nodes/', MapNodeList.as_view(), name='node-list'),
    path('api/restaurants/', RestaurantListView.as_view(), name='restaurant-list'),
]
