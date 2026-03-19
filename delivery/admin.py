from django.contrib import admin
from .models import User, Restaurant, MenuItem, MapNode, Order, OrderItem

# Register your models here so they show up on the dashboard!
admin.site.register(User)
admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(MapNode)
admin.site.register(Order)
admin.site.register(OrderItem)