from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
# Create your models here.
# 1. User Table
class User(models.Model):
    user_id = models.AutoField(primary_key=True)  
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    location = models.ForeignKey('MapNode', on_delete=models.SET_NULL, null=True, blank=True)
    favorites = models.ManyToManyField('Restaurant', related_name='favorited_by', blank=True)

    def __str__(self):
        return self.name

# 2. Restaurant Table
class Restaurant(models.Model):
    restaurant_id = models.AutoField(primary_key=True) 
    name = models.CharField(max_length=255)
    cuisine = models.CharField(max_length=100)
    rating = models.FloatField(default=0.0)
    average_delivery_time = models.IntegerField()
    # ADD THIS LINE:
    location_node = models.ForeignKey('MapNode', on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return self.name

# 3. MenuItem Table (Weak Entity connected to Restaurant)
class MenuItem(models.Model):
    item_id = models.AutoField(primary_key=True) 
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0.01)])

    class Meta:
        indexes = [
            models.Index(fields=['restaurant'], name='idx_menuitem_restaurant'),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(price__gt=0), name='chk_menuitem_price_positive'),
        ]

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

# 4. Order Table
class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Preparing', 'Preparing'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    order_id = models.AutoField(primary_key=True) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    rider = models.ForeignKey('Rider', on_delete=models.SET_NULL, null=True, blank=True)
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=50, default="Pending", choices=STATUS_CHOICES)
    rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(null=True, blank=True)
    delivery_path = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user'], name='idx_order_user'),
            models.Index(fields=['restaurant'], name='idx_order_restaurant'),
            models.Index(fields=['status'], name='idx_order_status'),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(rating__gte=1, rating__lte=5) | models.Q(rating__isnull=True), name='chk_order_rating_range'),
        ]

    def __str__(self):
        return f"Order {self.order_id} by {self.user.name}"

class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"

# 6. MapNode Table
class MapNode(models.Model):
    node_id = models.AutoField(primary_key=True) 
    name = models.CharField(max_length=100)
    x_coordinate = models.FloatField()
    y_coordinate = models.FloatField()

    def __str__(self):
        return self.name

# 6. Rider Table
class Rider(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Busy', 'Busy'),
        ('Offline', 'Offline'),
    ]
    rider_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    vehicle_type = models.CharField(max_length=50, default="Bike")
    current_location = models.ForeignKey(MapNode, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')

    def __str__(self):
        return f"{self.name} ({self.status})"

# 7. MapEdge Table (Weak Entity connected to MapNode twice)
class MapEdge(models.Model):
    edge_id = models.AutoField(primary_key=True) 
    from_node = models.ForeignKey(MapNode, on_delete=models.CASCADE, related_name='starts_at')
    to_node = models.ForeignKey(MapNode, on_delete=models.CASCADE, related_name='ends_at')
    distance = models.FloatField(validators=[MinValueValidator(0.01)])

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(distance__gt=0), name='chk_mapedge_distance_positive'),
        ]

    def __str__(self):
        return f"{self.from_node.name} -> {self.to_node.name} ({self.distance} units)"