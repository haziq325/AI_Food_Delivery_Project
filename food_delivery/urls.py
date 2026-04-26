from django.contrib import admin
from django.urls import path
# Import from your APP name 'delivery'
from delivery.views import MapNodeList, RestaurantListView 
from delivery import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', views.user_login, name='user-login'),
    path('api/auth/signup/', views.user_signup, name='user-signup'),
    # The AI Lead's Map Nodes
    path('api/nodes/', MapNodeList.as_view(), name='node-list'),
    path('api/edges/', views.MapEdgeList.as_view(), name='edge-list'),
    # Your 25 Karachi Restaurants
    path('api/restaurants/', RestaurantListView.as_view(), name='restaurant-list'),
    path('api/restaurants/<int:restaurant_id>/reviews/', views.get_restaurant_reviews, name='restaurant-reviews'),
    path('api/menu-items/', views.MenuItemListView.as_view(), name='menu-item-list'),

    path('api/orders/list/', views.OrderListView.as_view(), name='order-list'),
    path('api/orders/', views.create_order, name='create-order'),
    path('api/orders/placement/', views.place_order_with_path, name='order-placement'),
    path('api/orders/<int:order_id>/status/', views.update_order_status, name='update-order-status'),
    path('api/orders/<int:order_id>/rate/', views.rate_order, name='rate-order'),
    
    # New Route Calculation API linking delivery_brain
    path('api/calculate-route/', views.calculate_route, name='calculate-route'),
    
    # Content-based Recommendations API
    path('api/recommendations/<int:user_id>/', views.get_recommendations, name='get-recommendations'),
    
    # User Profile APIs
    path('api/users/<int:user_id>/location/', views.update_user_location, name='update-user-location'),
    path('api/users/<int:user_id>/favorites/', views.toggle_favorite, name='toggle-favorite'),

    # Logistics/Rider APIs
    path('api/riders/', views.RiderListView.as_view(), name='rider-list'),
    path('api/orders/<int:order_id>/assign/', views.assign_rider, name='assign-rider'),
    path('api/analytics/', views.analytics_dashboard, name='analytics-dashboard'),
]