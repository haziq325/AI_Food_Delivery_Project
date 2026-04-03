from rest_framework.decorators import api_view
from rest_framework.response import Response
from delivery_brain import calculate_shortest_path, get_restaurant_node

@api_view(['GET'])
def get_delivery_route(request):
    # 1. Grab the data sent by the frontend URL
    restaurant_name = request.GET.get('restaurant')
    customer_node = request.GET.get('customer_node')
    traffic = request.GET.get('traffic', 'normal')

    # 2. Check if the frontend forgot to send necessary data
    if not restaurant_name or not customer_node:
        return Response({"error": "Please provide both 'restaurant' and 'customer_node'."}, status=400)

    try:
        customer_node = int(customer_node)
    except ValueError:
        return Response({"error": "'customer_node' must be a number."}, status=400)

    # 3. Use your AI Brain to find the starting node
    start_node = get_restaurant_node(restaurant_name)
    if not start_node:
        return Response({"error": f"Restaurant '{restaurant_name}' not found or has no mapped location."}, status=404)

    # 4. Calculate the path
    distance, path = calculate_shortest_path(start_node, customer_node, traffic)

    # 5. Format and return the JSON response
    if path:
        estimated_time = int(distance * 2)
        return Response({
            "status": "success",
            "restaurant": restaurant_name,
            "start_node": start_node,
            "customer_node": customer_node,
            "traffic_condition": traffic,
            "route": path,
            "distance_units": round(distance, 2),
            "estimated_time_minutes": estimated_time
        })
    else:
        return Response({"error": "No valid route found to the customer."}, status=404)