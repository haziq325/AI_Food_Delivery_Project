from rest_framework import serializers
from .models import MapNode, Restaurant, MenuItem, MapEdge, User, Order, OrderItem, Rider

class MapNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapNode
        fields = '__all__'

class MapEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapEdge
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class RestaurantSerializer(serializers.ModelSerializer):
    # This grabs all the menu items linked to this restaurant
    menu_items = MenuItemSerializer(many=True, read_only=True, source='menuitem_set')
    
    class Meta:
        model = Restaurant
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    price = serializers.CharField(source='menu_item.price', read_only=True)
    class Meta:
        model = OrderItem
        fields = '__all__'

class RiderSerializer(serializers.ModelSerializer):
    location_name = serializers.SerializerMethodField()
    class Meta:
        model = Rider
        fields = '__all__'

    def get_location_name(self, obj):
        return obj.current_location.name if obj.current_location else None

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')
    user_name = serializers.CharField(source='user.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    rider_details = RiderSerializer(source='rider', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'