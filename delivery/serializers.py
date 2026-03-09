from rest_framework import serializers
from .models import Restaurant, MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price', 'description', 'category']

class RestaurantSerializer(serializers.ModelSerializer):
    # This "source" ensures we get all items linked to the restaurant
    menu_items = MenuItemSerializer(many=True, read_only=True, source='menuitem_set')

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'rating', 'menu_items']