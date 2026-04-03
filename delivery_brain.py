import os
import sys
import django
import networkx as nx
from datetime import datetime
import pytz

# --- PATH & DJANGO SETUP ---
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import Restaurant, MapNode, MapEdge

# --- 🚦 WEEK 5: TRAFFIC CONSTANTS ---
TRAFFIC_MULTIPLIERS = {
    'light': 0.8,    # 20% faster than normal
    'normal': 1.0,   # Standard speed
    'moderate': 1.5, # Takes 50% longer
    'heavy': 2.5,    # Takes 150% longer (Gridlock)
    'jammed': 3.0    # Adding this to support your test at the bottom!
}

# ==========================================
# 0. BUILD THE GRAPH FROM THE DATABASE
# ==========================================
# FIX: We need to actually build 'karachi_graph' before the AI can use it!
# ==========================================
# 0. BUILD THE GRAPH FROM THE DATABASE
# ==========================================
def build_city_graph():
    G = nx.Graph()
    # Pull all edges from your database and add them to the NetworkX graph
    for edge in MapEdge.objects.all():
        # UPDATED: Using 'from_node' and 'to_node' to match your models.py
        G.add_edge(edge.from_node.node_id, edge.to_node.node_id, weight=edge.distance)
    return G

# Initialize the graph
karachi_graph = build_city_graph()


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
def get_realtime_traffic(requested_traffic):
    """
    TASK 2: RUSH HOUR LOGIC
    Checks the current time in Pakistan. If it is rush hour, it overrides 
    the requested traffic to 'heavy'.
    """
    tz = pytz.timezone('Asia/Karachi')
    karachi_time = datetime.now(tz)
    
    # Karachi Rush Hour: 5:00 PM (17:00) to 8:00 PM (20:00)
    if 17 <= karachi_time.hour < 20:
        return 'heavy' 
    
    return requested_traffic

def calculate_shortest_path(start_node, end_node, traffic_condition='normal', closed_roads=None):
    """
    Calculates the best route while handling dynamic traffic and road closures.
    closed_roads should be a list of tuples, e.g., [(5, 8), (12, 14)]
    """
    # 1. Determine actual traffic based on the clock
    actual_traffic = get_realtime_traffic(traffic_condition)
    multiplier = TRAFFIC_MULTIPLIERS.get(actual_traffic.lower(), 1.0)
    
    # 2. Create a temporary graph to avoid permanently changing the main map
    dynamic_graph = karachi_graph.copy()
    
    # 3. TASK 3: ROAD CLOSURES
    if closed_roads:
        for u, v in closed_roads:
            if dynamic_graph.has_edge(u, v):
                dynamic_graph.remove_edge(u, v)
                
    # 4. TASK 1: APPLY TRAFFIC MULTIPLIER
    for u, v, data in dynamic_graph.edges(data=True):
        base_distance = data.get('weight', 1)
        # Make the road "heavier" based on traffic
        dynamic_graph[u][v]['weight'] = base_distance * multiplier
        
    # 5. RUN DIJKSTRA
    try:
        path = nx.dijkstra_path(dynamic_graph, source=start_node, target=end_node, weight='weight')
        total_distance = nx.dijkstra_path_length(dynamic_graph, source=start_node, target=end_node, weight='weight')
        
        return total_distance, path, actual_traffic
        
    except nx.NetworkXNoPath:
        return None, None, actual_traffic


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

    # FIX: We now catch THREE variables from the function instead of two!
    distance, path, final_traffic = calculate_shortest_path(start_node, customer_node, traffic)

    if path and distance:
        estimated_time = int(distance * 2) 
        
        print(f"\n✅ ROUTE CALCULATED!")
        print(f"🚦 Traffic Conditions: {final_traffic.upper()}")
        print(f"🗺️  Path: {' -> '.join(map(str, path))}")
        print(f"📏 Distance (adjusted for traffic): {distance:.2f} units")
        print(f"⏱️  Estimated Delivery Time: {estimated_time} minutes")
    else:
        print("❌ Error: Path blocked! No route to customer.")

if __name__ == '__main__':
    # Test cases
    simulate_delivery("Burger O'Clock", customer_node=14, traffic="normal")
    simulate_delivery("Javed Nihari", customer_node=4, traffic="jammed")