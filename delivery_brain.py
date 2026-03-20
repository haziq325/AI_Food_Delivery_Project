import os
import sys
import django
import heapq

# --- PATH & DJANGO SETUP ---
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import Restaurant, MapNode, MapEdge

# ==========================================
# 1. SEARCH CAPABILITY
# ==========================================
def get_restaurant_node(restaurant_name):
    """Finds the starting map node based on a restaurant's name."""
    try:
        # __icontains allows us to search partial names (e.g., 'burger' finds 'Burger O'Clock')
        restaurant = Restaurant.objects.get(name__icontains=restaurant_name)
        if restaurant.location_node:
            return restaurant.location_node.node_id
        else:
            print(f"❌ '{restaurant.name}' does not have a map location assigned!")
            return None
    except Restaurant.DoesNotExist:
        print(f"❌ Could not find any restaurant matching '{restaurant_name}'.")
        return None
    except Restaurant.MultipleObjectsReturned:
        print(f"⚠️ Found multiple restaurants matching '{restaurant_name}'. Be more specific.")
        return None

# ==========================================
# 2. THE AI BRAIN: DIJKSTRA + TRAFFIC
# ==========================================
def calculate_shortest_path(start_id, end_id, traffic_level="normal"):
    """Calculates the fastest route using Dijkstra's Algorithm, factoring in traffic."""
    
    # Traffic multipliers (e.g., heavy traffic makes a 5km road feel like 7.5km)
    traffic_multipliers = {
        "light": 0.8,
        "normal": 1.0,
        "heavy": 1.5,
        "jammed": 2.5
    }
    multiplier = traffic_multipliers.get(traffic_level.lower(), 1.0)
    print(f"🚦 Traffic Conditions: {traffic_level.upper()} (Distance Multiplier: {multiplier}x)")

    # 1. Build the graph dynamically from the Database
    graph = {}
    edges = MapEdge.objects.all()
    
    for edge in edges:
        u = edge.from_node.node_id
        v = edge.to_node.node_id
        # Apply traffic delay to the physical distance
        weight = float(edge.distance) * multiplier 
        
        if u not in graph: graph[u] = {}
        if v not in graph: graph[v] = {}
        
        # Assuming our Karachi roads are two-way streets
        graph[u][v] = weight
        graph[v][u] = weight 

    # 2. Run Dijkstra's Algorithm
    queue = [(0, start_id, [])] # (current_cost, current_node, path_history)
    seen = set()
    min_distances = {start_id: 0}

    while queue:
        (cost, current_node, path) = heapq.heappop(queue)

        if current_node in seen:
            continue

        path = path + [current_node]
        seen.add(current_node)

        # If we reached the customer, return the final cost and path
        if current_node == end_id:
            return cost, path

        # Check neighbors
        for neighbor, weight in graph.get(current_node, {}).items():
            if neighbor in seen:
                continue
                
            prev_cost = min_distances.get(neighbor, float('inf'))
            next_cost = cost + weight
            
            if next_cost < prev_cost:
                min_distances[neighbor] = next_cost
                heapq.heappush(queue, (next_cost, neighbor, path))

    return float('inf'), [] # No path found

# ==========================================
# 3. RUN THE SIMULATION
# ==========================================
def simulate_delivery(restaurant_name, customer_node, traffic="normal"):
    print(f"\n{'-'*40}")
    print(f"🛵 NEW ORDER: Pick up from '{restaurant_name.upper()}'")
    print(f"{'-'*40}")
    
    start_node = get_restaurant_node(restaurant_name)
    if not start_node:
        return

    print(f"📍 LOCATION: Found at Node {start_node}.")
    print(f"🎯 DROPOFF: Customer is waiting at Node {customer_node}.")

    distance, path = calculate_shortest_path(start_node, customer_node, traffic)

    if path:
        # Time estimation logic: Let's assume 1 unit of adjusted distance takes 2 minutes to drive
        estimated_time = int(distance * 2) 
        
        print(f"\n✅ ROUTE CALCULATED!")
        print(f"🗺️  Path: {' -> '.join(map(str, path))}")
        print(f"📏 Distance (adjusted for traffic): {distance:.2f} units")
        print(f"⏱️  Estimated Delivery Time: {estimated_time} minutes")
    else:
        print("❌ Error: Path blocked! No route to customer.")

if __name__ == '__main__':
    # Let's test two different orders with different traffic conditions!
    simulate_delivery("Burger O'Clock", customer_node=14, traffic="normal")
    simulate_delivery("Javed Nihari", customer_node=4, traffic="jammed")