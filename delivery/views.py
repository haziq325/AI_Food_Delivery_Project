from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
import requests

from delivery_brain import get_restaurant_node, calculate_shortest_path, calculate_shortest_path_astar
from .models import MapNode, MapEdge, Restaurant, MenuItem, User, Order
from .serializers import MapNodeSerializer, MapEdgeSerializer, RestaurantSerializer, MenuItemSerializer


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
    
    if not user_id or not restaurant_id:
        return Response({"error": "Missing user_id or restaurant_id"}, status=400)
    
    try:
        user = User.objects.get(pk=user_id)
        restaurant = Restaurant.objects.get(pk=restaurant_id)
        
        if not user.location or not restaurant.location_node:
            return Response({"error": "User or Restaurant location node not defined"}, status=400)
            
        # Generate the path using existing A* logic
        distance, path_nodes = calculate_shortest_path_astar(
            restaurant.location_node.node_id, 
            user.location.node_id, 
            traffic_level='auto'
        )
        
        if not path_nodes:
             return Response({"error": "No valid path found between nodes"}, status=404)
             
        # Create the order
        order = Order.objects.create(
            user=user,
            restaurant=restaurant,
            delivery_path=",".join(map(str, path_nodes)),
            status='Pending'
        )
        
        return Response({
            "status": "success",
            "order_id": order.order_id,
            "path": path_nodes,
            "distance": round(distance, 2),
            "estimated_time": int(distance * 2), # 2 mins per unit
            "customer_location": {"x": user.location.x_coordinate, "y": user.location.y_coordinate},
            "restaurant_location": {"x": restaurant.location_node.x_coordinate, "y": restaurant.location_node.y_coordinate}
        }, status=201)
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Restaurant.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)