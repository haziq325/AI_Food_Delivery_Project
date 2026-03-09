from django.db import models

# Create your models here.
# 1. User Table
class User(models.Model):
    user_id = models.AutoField(primary_key=True)  
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name

# 2. Restaurant Table
class Restaurant(models.Model):
    restaurant_id = models.AutoField(primary_key=True) 
    name = models.CharField(max_length=255)
    cuisine = models.CharField(max_length=100)
    rating = models.FloatField(default=0.0)
    average_delivery_time = models.IntegerField()

    def __str__(self):
        return self.name

# 3. MenuItem Table (Weak Entity connected to Restaurant)
class MenuItem(models.Model):
    item_id = models.AutoField(primary_key=True) 
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

# 4. Order Table
class Order(models.Model):
    order_id = models.AutoField(primary_key=True) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, default="Pending")

    def __str__(self):
        return f"Order {self.order_id} by {self.user.name}"

# 5. OrderItem Table (Weak Entity connected to Order & MenuItem)
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

# 7. MapEdge Table (Weak Entity connected to MapNode twice)
class MapEdge(models.Model):
    edge_id = models.AutoField(primary_key=True) 
    from_node = models.ForeignKey(MapNode, on_delete=models.CASCADE, related_name='starts_at')
    to_node = models.ForeignKey(MapNode, on_delete=models.CASCADE, related_name='ends_at')
    distance = models.FloatField()

    def __str__(self):
        return f"{self.from_node.name} -> {self.to_node.name} ({self.distance} units)"