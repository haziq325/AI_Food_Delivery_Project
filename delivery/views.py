from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
import requests
import joblib
import pandas as pd
import os

from delivery_brain import get_restaurant_node, calculate_shortest_path, calculate_shortest_path_astar, get_current_traffic_condition
from .models import MapNode, MapEdge, Restaurant, MenuItem, User, Order, OrderItem, Rider
from .serializers import MapNodeSerializer, MapEdgeSerializer, RestaurantSerializer, MenuItemSerializer, OrderSerializer, RiderSerializer


@api_view(['POST'])
def user_login(request):
    """
    Authenticate a user by email & password.
    Returns user profile including their location node so the frontend
    can automatically use it as the delivery destination.
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=400)

    try:
        user = User.objects.select_related('location').get(email__iexact=email, password=password)
        return Response({
            'success': True,
            'user': {
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'location_node_id': user.location.node_id if user.location else None,
                'location_name': user.location.name if user.location else 'Unknown',
                'favorite_ids': list(user.favorites.values_list('pk', flat=True))
            }
        })
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password.'}, status=401)

@api_view(['POST'])
def user_signup(request):
    """
    Register a new user and assign a delivery node.
    """
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    location_node_id = request.data.get('location_node_id')

    if not name or not email or not password or not location_node_id:
        return Response({'error': 'Name, email, password, and location are required.'}, status=400)

    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'Email is already registered.'}, status=400)

    try:
        location_node = MapNode.objects.get(node_id=location_node_id)
    except MapNode.DoesNotExist:
        return Response({'error': 'Invalid location selected.'}, status=400)

    user = User.objects.create(
        name=name,
        email=email,
        password=password,
        location=location_node
    )

    return Response({
        'success': True,
        'user': {
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'location_node_id': user.location.node_id if user.location else None,
            'location_name': user.location.name if user.location else 'Unknown',
        }
    }, status=201)

class MapNodeList(generics.ListCreateAPIView):
    queryset = MapNode.objects.all()
    serializer_class = MapNodeSerializer

class MapEdgeList(generics.ListAPIView):
    queryset = MapEdge.objects.all()
    serializer_class = MapEdgeSerializer

# View for your 25 Karachi Restaurants
class RestaurantListView(generics.ListAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

class MenuItemListView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    
    def get_queryset(self):
        queryset = MenuItem.objects.all()
        restaurant_id = self.request.query_params.get('restaurant')
        if restaurant_id:
            queryset = queryset.filter(restaurant_id=restaurant_id)
        return queryset

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.all().order_by('-created_at')
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

# NEW VIEW (Your Backend/Database Order API)
@api_view(['POST'])
def create_order(request):
    # 1. Grab the data sent by Mawavia's frontend
    user_id = request.data.get('user_id')
    restaurant_id = request.data.get('restaurant_id')
    menu_item_id = request.data.get('menu_item_id')
    quantity = request.data.get('quantity', 1)

    # Basic safety check to ensure we have all the data
    if not all([user_id, restaurant_id, menu_item_id]):
        return Response({"error": "Missing required fields! Need user_id, restaurant_id, and menu_item_id."}, status=400)

    # 2. Call your custom PostgreSQL Stored Procedure!
    try:
        with connection.cursor() as cursor:
            # This runs the raw SQL we injected in the migration
            cursor.execute(
                "CALL place_order(%s, %s, %s, %s);",
                [user_id, restaurant_id, menu_item_id, quantity]
            )
    except Exception as e:
        return Response({"error": f"Database error: {str(e)}"}, status=500)

    # ---------------------------------------------------------
    # 3. Trigger the n8n Webhook for the Email Automation
    # ---------------------------------------------------------
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    n8n_webhook_url = os.environ.get('N8N_WEBHOOK_URL', "https://sibyl-tetradynamous-griselda.ngrok-free.dev/webhook-test/order-placed")
    
    # NEW: Fetch the actual names from the database using the IDs!
    # (Using 'pk' is a Django trick that automatically finds the primary key, even if it's custom named)
    try:
        user_obj = User.objects.get(pk=user_id)
        rest_obj = Restaurant.objects.get(pk=restaurant_id)
        item_obj = MenuItem.objects.get(pk=menu_item_id)

        # Build a "Rich" payload so n8n has the actual text it needs
        n8n_data = {
            "customer_name": user_obj.name,
            "customer_email": user_obj.email,
            "restaurant_name": rest_obj.name,
            "item_name": item_obj.name,
            "quantity": quantity,
            "total_price": float(item_obj.price * quantity) # Calculate total for the email!
        }
    except Exception as e:
        print(f"Error fetching names for webhook: {e}")
        # Fallback to IDs if something goes wrong
        n8n_data = {
            "user_id": user_id, "restaurant_id": restaurant_id, 
            "menu_item_id": menu_item_id, "quantity": quantity
        }
    
    try:
        # Send the RICH data to n8n
        requests.post(n8n_webhook_url, json=n8n_data, timeout=3)
        print("Webhook fired to n8n successfully with names!")
    except Exception as e:
        print(f"n8n webhook failed: {e}")

    # 4. Tell the frontend the order was a success!
    return Response({"message": "Order placed successfully! Confirmation email triggered."}, status=201)

@api_view(['POST', 'GET'])
def calculate_route(request):
    # Support both GET and POST for flexibly taking inputs
    data = request.data if request.method == 'POST' else request.query_params
    
    restaurant_name = data.get('restaurant_name')
    customer_node = data.get('customer_node')
    traffic_level = data.get('traffic', 'auto')  # Feature 2: Fall back to Auto
    blocked_edges_param = data.get('blocked_edges', []) # Feature 3: Road closures

    if not restaurant_name or not customer_node:
        return Response({"error": "Missing required fields: restaurant_name and customer_node."}, status=400)

    try:
        customer_node = int(customer_node)
    except ValueError:
        return Response({"error": "customer_node must be a valid number."}, status=400)

    start_node = get_restaurant_node(restaurant_name)
    if not start_node:
        return Response({"error": f"Could not find a valid location for restaurant '{restaurant_name}'."}, status=404)

    # Format blocked edges if they exist. Expected format: [[1,2], [3,4]]
    blocked_edges = []
    if blocked_edges_param and isinstance(blocked_edges_param, list):
        for edge in blocked_edges_param:
            if isinstance(edge, list) and len(edge) == 2:
                blocked_edges.append(tuple(edge))

    algorithm = data.get('algorithm', 'dijkstra').lower()
    
    from delivery_brain import calculate_shortest_path_astar
    
    if algorithm == 'astar':
        distance, path = calculate_shortest_path_astar(start_node, customer_node, traffic_level, blocked_edges=blocked_edges)
    else:
        distance, path = calculate_shortest_path(start_node, customer_node, traffic_level, blocked_edges=blocked_edges)

    if path:
        # Based on delivery_brain.py simulation logic: 1 unit distance = 2 minutes
        estimated_time = int(distance * 2) 
        
        return Response({
            "status": "success",
            "restaurant_name": restaurant_name,
            "customer_node": customer_node,
            "traffic": traffic_level,
            "route": path,
            "distance_units": round(distance, 2),
            "estimated_delivery_time_minutes": estimated_time
        }, status=200)
    else:
        return Response({"error": "Path blocked! No route to customer."}, status=404)

from delivery.recommendations import get_content_based_recommendations

@api_view(['GET'])
def get_recommendations(request, user_id):
    try:
        user_id = int(user_id)
        recommended_restaurants = get_content_based_recommendations(user_id)
        serializer = RestaurantSerializer(recommended_restaurants, many=True)
        return Response({"status": "success", "recommendations": serializer.data}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def place_order_with_path(request):
    """
    Relational Order Flow:
    1. Authenticates against Django User model (user_id).
    2. Uses delivery_brain logic (A*) to generate a path from Restaurant to User node.
    3. Saves result into PostgreSQL Order table.
    """
    user_id = request.data.get('user_id')
    restaurant_id = request.data.get('restaurant_id')
    destination_node_id = request.data.get('destination_node')
    items_data = request.data.get('items', []) # List of {item_id, quantity}
    
    if not user_id or not restaurant_id:
        return Response({"error": "Missing user_id or restaurant_id"}, status=400)
    
    try:
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            user = User.objects.first()
            if not user:
                return Response({"error": "No users exist in the database"}, status=404)
                
        restaurant = Restaurant.objects.get(pk=restaurant_id)
        
        # Resolve Destination Node
        if destination_node_id:
            dest_node_id = int(destination_node_id)
        else:
            if not user.location:
                return Response({"error": "User location node not defined"}, status=400)
            dest_node_id = user.location.node_id
            
        if not restaurant.location_node:
            return Response({"error": "Restaurant location node not defined"}, status=400)
            
        # Generate the path using existing A* logic
        distance, path_nodes = calculate_shortest_path_astar(
            restaurant.location_node.node_id, 
            dest_node_id, 
            traffic_level='auto'
        )
        
        if not path_nodes:
             return Response({"error": "No valid path found between nodes"}, status=404)
             
        # --- AUTOMATIC RIDER ASSIGNMENT ---
        # Find nearest available rider using simple Python distance calc
        import math
        rider = None
        rest_x = restaurant.location_node.x_coordinate
        rest_y = restaurant.location_node.y_coordinate
        available_riders = Rider.objects.filter(status='Available').select_related('current_location')
        best_dist = float('inf')
        for r in available_riders:
            if r.current_location:
                d = math.sqrt((r.current_location.x_coordinate - rest_x)**2 + (r.current_location.y_coordinate - rest_y)**2)
                if d < best_dist:
                    best_dist = d
                    rider = r
        if rider:
            rider.status = 'Busy'
            rider.save()
             
        # Create the order
        order = Order.objects.create(
            user=user,
            restaurant=restaurant,
            rider=rider, # Link the assigned rider
            delivery_path=",".join(map(str, path_nodes)),
            status='Out for Delivery' if rider else 'Pending'
        )

        # Process actual items
        total_qty = 0
        order_total = 0
        
        for item_data in items_data:
            try:
                m_item = MenuItem.objects.get(pk=item_data['item_id'])
                qty = item_data['quantity']
                OrderItem.objects.create(order=order, menu_item=m_item, quantity=qty)
                order_total += m_item.price * qty
                total_qty += qty
            except MenuItem.DoesNotExist:
                continue

        # If no items provided (legacy/mock), fallback to first item
        if not items_data:
            first_item = MenuItem.objects.filter(restaurant=restaurant).first()
            if first_item:
                OrderItem.objects.create(order=order, menu_item=first_item, quantity=1)
                order_total = first_item.price
                total_qty = 1
        
        order.total_price = order_total
        order.save()
        
        # Get actual nodes for location coordinates
        dest_node = MapNode.objects.get(pk=dest_node_id)
        
        # Trigger n8n Webhook
        import os
        from dotenv import load_dotenv
        import requests
        load_dotenv()
        
        n8n_webhook_url = os.environ.get('N8N_WEBHOOK_URL', "https://sibyl-tetradynamous-griselda.ngrok-free.dev/webhook/order-placed")
        
        try:
            # Get the first item from the order for the webhook
            first_oi = OrderItem.objects.filter(order=order).first()
            item_name = first_oi.menu_item.name if first_oi else "Custom Order"
            
            n8n_data = {
                "customer_name": user.name,
                "customer_email": user.email,
                "restaurant_name": restaurant.name,
                "item_name": item_name,
                "quantity": total_qty,
                "total_price": float(order.total_price) if order.total_price else 0.0
            }
            requests.post(n8n_webhook_url, json=n8n_data, timeout=5)
            print(f"Webhook fired to n8n successfully: {item_name}")
        except Exception as e:
            print(f"n8n webhook failed: {e}")
        
        # SMART ETA: Use ML Model if available
        estimated_time = int(distance * 2) # Default fallback
        prediction_method = "Hardcoded"
        
        try:
            model_path = os.path.join(os.getcwd(), 'eta_model.pkl')
            if os.path.exists(model_path):
                model = joblib.load(model_path)
                
                # Get current traffic multiplier
                traffic_level = get_current_traffic_condition()
                multipliers = { "light": 0.8, "normal": 1.0, "heavy": 1.5, "jammed": 2.5 }
                t_mult = multipliers.get(traffic_level.lower(), 1.0)
                
                # Real Order Size from items
                order_size = total_qty 
                
                # Predict!
                features = pd.DataFrame([[distance, order_size, t_mult]], 
                                       columns=['distance', 'order_size', 'traffic_multiplier'])
                pred = model.predict(features)[0]
                estimated_time = int(pred)
                prediction_method = f"AI Model (Size: {order_size})"
        except Exception as e:
            print(f"ML Prediction failed: {e}")

        return Response({
            "status": "success",
            "order_id": order.order_id,
            "path": path_nodes,
            "distance": round(distance, 2),
            "estimated_time": estimated_time,
            "prediction_method": prediction_method,
            "customer_location": {"x": dest_node.x_coordinate, "y": dest_node.y_coordinate},
            "restaurant_location": {"x": restaurant.location_node.x_coordinate, "y": restaurant.location_node.y_coordinate}
        }, status=201)
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Restaurant.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PATCH', 'DELETE'])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
        
        if request.method == 'DELETE':
            # If a rider was assigned, free them before deleting the order
            if order.rider:
                order.rider.status = 'Available'
                order.rider.save()
            order.delete()
            return Response({"status": "success", "message": "Order deleted"})
            
        status = request.data.get('status')
        if status:
            order.status = status
            order.save()
            
            # If Delivered or Cancelled, free the rider
            if (status == 'Delivered' or status == 'Cancelled') and order.rider:
                order.rider.status = 'Available'
                order.rider.save()
                
            return Response({"status": "success", "order_id": order_id, "new_status": status})
        return Response({"error": "No status provided"}, status=400)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

@api_view(['PATCH'])
def rate_order(request, order_id):
    """
    User-facing endpoint to rate and review a delivered order.
    Trigger auto_update_restaurant_rating will handle the average calculation.
    """
    try:
        order = Order.objects.get(pk=order_id)
        
        # Only allow rating if delivered
        if order.status != 'Delivered':
            return Response({"error": "Order must be delivered before rating"}, status=400)
            
        rating = request.data.get('rating')
        review = request.data.get('review')
        
        if rating is not None:
            order.rating = int(rating)
        if review is not None:
            order.review = review
            
        order.save()
        return Response({
            "status": "success", 
            "order_id": order_id, 
            "rating": order.rating,
            "review": order.review
        })
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PATCH'])
def update_user_location(request, user_id):
    """
    Update a user's preferred delivery location node.
    """
    try:
        user = User.objects.get(pk=user_id)
        location_node_id = request.data.get('location_node_id')
        
        if not location_node_id:
            return Response({"error": "No location_node_id provided"}, status=400)
            
        location_node = MapNode.objects.get(node_id=location_node_id)
        user.location = location_node
        user.save()
        
        return Response({
            "status": "success",
            "user": {
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "location_node_id": user.location.node_id,
                "location_name": user.location.name
            }
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except MapNode.DoesNotExist:
        return Response({"error": "Invalid location node"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def get_restaurant_reviews(request, restaurant_id):
    """
    Fetch all reviews and ratings for a specific restaurant.
    """
    try:
        reviews = Order.objects.filter(
            restaurant_id=restaurant_id, 
            rating__isnull=False
        ).select_related('user').order_by('-created_at')
        
        data = []
        for r in reviews:
            data.append({
                "user_name": r.user.name,
                "rating": r.rating,
                "review": r.review,
                "created_at": r.created_at
            })
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def toggle_favorite(request, user_id):
    """
    Heart/Unheart a restaurant for a user.
    """
    restaurant_id = request.data.get('restaurant_id')
    try:
        user = User.objects.get(pk=user_id)
        restaurant = Restaurant.objects.get(pk=restaurant_id)
        
        if user.favorites.filter(pk=restaurant_id).exists():
            user.favorites.remove(restaurant)
            status = "removed"
        else:
            user.favorites.add(restaurant)
            status = "added"
            
        return Response({"status": "success", "action": status})
    except (User.DoesNotExist, Restaurant.DoesNotExist):
        return Response({"error": "User or Restaurant not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

class RiderListView(generics.ListAPIView):
    queryset = Rider.objects.all()
    serializer_class = RiderSerializer

@api_view(['POST'])
def assign_rider(request, order_id):
    rider_id = request.data.get('rider_id')
    try:
        order = Order.objects.get(pk=order_id)
        rider = Rider.objects.get(pk=rider_id)
        order.rider = rider
        order.status = 'Out for Delivery'
        order.save()
        rider.status = 'Busy'
        rider.save()
        return Response({"status": "success", "rider": rider.name})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def analytics_dashboard(request):
    from django.db.models import Sum, Count, Avg
    from django.utils import timezone
    from datetime import timedelta
    from django.db import models

    # 1. Revenue Analytics
    total_revenue = Order.objects.filter(status='Delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
    
    # Daily Revenue (Last 7 Days)
    today = timezone.now().date()
    revenue_last_7_days = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        rev = Order.objects.filter(status='Delivered', created_at__date=day).aggregate(Sum('total_price'))['total_price__sum'] or 0
        revenue_last_7_days.append({"day": day.strftime('%a'), "revenue": float(rev)})

    # 2. Restaurant Performance
    top_restaurants = Order.objects.values('restaurant__name').annotate(orders=Count('order_id')).order_by('-orders')[:5]
    restaurant_data = [{"name": r['restaurant__name'], "orders": r['orders']} for r in top_restaurants]

    # 3. Delivery Metrics
    avg_wait = Restaurant.objects.aggregate(Avg('average_delivery_time'))['average_delivery_time__avg'] or 0
    
    # 4. Fleet Status
    fleet = Rider.objects.aggregate(
        available=Count('rider_id', filter=models.Q(status='Available')), 
        busy=Count('rider_id', filter=models.Q(status='Busy'))
    )

    return Response({
        "total_revenue": float(total_revenue),
        "revenue_history": revenue_last_7_days,
        "top_restaurants": restaurant_data,
        "avg_delivery_time": round(float(avg_wait), 1),
        "fleet_status": fleet
    })
