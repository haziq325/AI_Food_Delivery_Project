import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
import django
import heapq
import datetime
import pytz
import time
import math
import joblib

# --- PATH & DJANGO SETUP ---
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import Restaurant, MapNode, MapEdge

# ==========================================
# 0. GLOBAL CACHE (PERFORMANCE OPTIMIZATION)
# ==========================================
_GRAPH_CACHE = None
_NODE_CACHE = None
_LAST_CACHE_UPDATE = 0
CACHE_TTL = 300  # Refresh map every 5 minutes if needed

def get_cached_graph_and_nodes():
    """Retrieves the map from memory if available, otherwise builds it from DB."""
    global _GRAPH_CACHE, _NODE_CACHE, _LAST_CACHE_UPDATE
    import networkx as nx
    import time
    
    now = time.time()
    # Only rebuild if cache is empty or expired
    if _GRAPH_CACHE is None or (now - _LAST_CACHE_UPDATE) > CACHE_TTL:
        # print("🔄 Building Map Cache from Database...")
        graph = nx.Graph()
        nodes = {n.node_id: n for n in MapNode.objects.all()}
        edges = MapEdge.objects.all()
        
        for edge in edges:
            u, v = edge.from_node.node_id, edge.to_node.node_id
            # Store distance in 'original_distance' to allow traffic multipliers to be applied fresh
            graph.add_edge(u, v, original_distance=float(edge.distance))
            
        _GRAPH_CACHE = graph
        _NODE_CACHE = nodes
        _LAST_CACHE_UPDATE = now
        # print(f"✅ Map Cache Ready: {len(nodes)} nodes, {len(edges)} edges.")
        
    return _GRAPH_CACHE.copy(), _NODE_CACHE


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
# 2. THE AI BRAIN: DIJKSTRA + TRAFFIC AUTOMATION
# ==========================================
def get_current_traffic_condition():
    """Checks the current time in Pakistan. If it is 5PM-8PM, returns 'heavy/jammed'."""
    try:
        pk_tz = pytz.timezone('Asia/Karachi')
        now = datetime.datetime.now(pk_tz).time()
        
        # 5:00 PM (17:00) to 8:00 PM (20:00)
        rush_hour_start = datetime.time(17, 0)
        rush_hour_end = datetime.time(20, 0)
        
        if rush_hour_start <= now <= rush_hour_end:
            print("🕒 Alert: Peak Rush Hour Detected in Karachi! Adapting routes.")
            return "heavy"
    except Exception as e:
        print(f"Error checking time: {e}")
    return "normal"

def calculate_shortest_path(start_id, end_id, traffic_level="auto", blocked_edges=None):
    """Calculates the fastest route using Dijkstra's Algorithm, factoring in traffic and closures."""
    
    if traffic_level == "auto":
        traffic_level = get_current_traffic_condition()

    # Traffic multipliers (e.g., heavy traffic makes a 5km road feel like 7.5km)
    traffic_multipliers = {
        "light": 0.8,
        "normal": 1.0,
        "heavy": 1.5,
        "jammed": 2.5
    }
    multiplier = traffic_multipliers.get(traffic_level.lower(), 1.0)

    import networkx as nx
    # 1. Use the Cached Graph instead of querying the DB
    graph, _ = get_cached_graph_and_nodes()
    
    # 2. Apply dynamic factors (Traffic & Blocked Edges)
    # Convert to list to avoid RuntimeError: dictionary changed size during iteration
    for u, v, data in list(graph.edges(data=True)):
        # ROAD CLOSURE CHECK
        if blocked_edges and ((u, v) in blocked_edges or (v, u) in blocked_edges):
            graph.remove_edge(u, v)
            continue
            
        # Apply traffic to the original distance
        data['weight'] = data['original_distance'] * multiplier

    # 2. Run Dijkstra's Algorithm via NetworkX
    try:
        path = nx.shortest_path(graph, source=start_id, target=end_id, weight='weight', method='dijkstra')
        cost = nx.shortest_path_length(graph, source=start_id, target=end_id, weight='weight', method='dijkstra')
        return cost, path
    except nx.NetworkXNoPath:
        return float('inf'), []
    except nx.NodeNotFound:
        return float('inf'), []

def calculate_shortest_path_astar(start_id, end_id, traffic_level="auto", blocked_edges=None):
    """Calculates the fastest route using the A* Algorithm."""
    if traffic_level == "auto":
        traffic_level = get_current_traffic_condition()

    traffic_multipliers = { "light": 0.8, "normal": 1.0, "heavy": 1.5, "jammed": 2.5 }
    multiplier = traffic_multipliers.get(traffic_level.lower(), 1.0)
    
    import networkx as nx
    # 1. Use Cached Graph and Nodes
    graph, nodes = get_cached_graph_and_nodes()
    
    if start_id not in nodes or end_id not in nodes:
         return float('inf'), []

    # 2. Apply dynamic factors
    for u, v, data in list(graph.edges(data=True)):
        if blocked_edges and ((u, v) in blocked_edges or (v, u) in blocked_edges):
            graph.remove_edge(u, v)
            continue
        data['weight'] = data['original_distance'] * multiplier

    def heuristic(u, v):
        n1 = nodes.get(u)
        n2 = nodes.get(v)
        if not n1 or not n2: return 0
        return math.sqrt((n1.x_coordinate - n2.x_coordinate)**2 + (n1.y_coordinate - n2.y_coordinate)**2)

    try:
        path = nx.astar_path(graph, source=start_id, target=end_id, heuristic=heuristic, weight='weight')
        cost = nx.astar_path_length(graph, source=start_id, target=end_id, heuristic=heuristic, weight='weight')
        return cost, path
    except nx.NetworkXNoPath:
        return float('inf'), []
    except nx.NodeNotFound:
        return float('inf'), []

def compare_algorithms(start_id, end_id, traffic_level="auto", blocked_edges=None):
    """Compares the runtime and path length of Dijkstra and A*."""
    print("\n" + "="*40)
    print(f"🏎️ COMPARING ALGORITHMS (Node {start_id} -> Node {end_id})")
    print("="*40)
    
    # 1. Dijkstra
    start_time = time.perf_counter()
    d_cost, d_path = calculate_shortest_path(start_id, end_id, traffic_level, blocked_edges)
    d_time = (time.perf_counter() - start_time) * 1000 # ms
    
    # 2. A*
    start_time = time.perf_counter()
    a_cost, a_path = calculate_shortest_path_astar(start_id, end_id, traffic_level, blocked_edges)
    a_time = (time.perf_counter() - start_time) * 1000 # ms
    
    print(f"Dijkstra Cost: {d_cost:.2f} | Execution Time: {d_time:.4f} ms")
    print(f"A*       Cost: {a_cost:.2f} | Execution Time: {a_time:.4f} ms")
    if d_path == a_path:
        print("✅ Both algorithms found the exact same optimal path!")
    else:
        print("⚠️ Algorithms found different paths of similar cost.")

# ==========================================
# 3. RUN THE SIMULATION
# ==========================================
def simulate_delivery(restaurant_name, customer_node, traffic="auto", blocked_edges=None):
    print(f"\n{'-'*40}")
    print(f"🛵 NEW ORDER: Pick up from '{restaurant_name.upper()}'")
    print(f"{'-'*40}")
    
    start_node = get_restaurant_node(restaurant_name)
    if not start_node:
        return

    print(f"📍 LOCATION: Found at Node {start_node}.")
    print(f"🎯 DROPOFF: Customer is waiting at Node {customer_node}.")

    # Use A* by default for simulations!
    distance, path = calculate_shortest_path_astar(start_node, customer_node, traffic, blocked_edges)

    if path:
        estimated_time = 0
        try:
            # ML Model Prediction
            model = joblib.load('eta_model.pkl')
            
            # Re-resolve the actual multiplier to feed into the ML model
            traffic_level_mapped = traffic if traffic != "auto" else get_current_traffic_condition()
            multipliers = { "light": 0.8, "normal": 1.0, "heavy": 1.5, "jammed": 2.5 }
            t_mult = multipliers.get(traffic_level_mapped.lower(), 1.0)
            
            # Assume a random order size for the simulation
            import random
            order_size_sim = random.randint(1, 5)
            
            # Predict
            import pandas as pd
            features_df = pd.DataFrame([[distance, order_size_sim, t_mult]], columns=['distance', 'order_size', 'traffic_multiplier'])
            pred_time = model.predict(features_df)[0]
            estimated_time = int(pred_time)
            model_info = f"🤖 ML Predicted (Size: {order_size_sim} items)"
        except Exception as e:
            # Fallback
            estimated_time = int(distance * 2) 
            model_info = "📏 Hardcoded Estimate"
        
        print(f"\n✅ ROUTE CALCULATED (Using A*)!")
        print(f"🗺️  Path: {' -> '.join(map(str, path))}")
        print(f"📏 Distance (adjusted for traffic): {distance:.2f} units")
        print(f"⏱️  Estimated Delivery Time: {estimated_time} minutes ({model_info})")
        
        # Also run the comparison behind the scenes
        compare_algorithms(start_node, customer_node, traffic, blocked_edges)
    else:
        print("❌ Error: Path blocked! No route to customer.")

if __name__ == '__main__':
    # Test 1: Let the system auto-check the Pakistan time for rush hour traffic!
    simulate_delivery("Burger O'Clock", customer_node=14, traffic="auto")

    # Test 2: The worst-case scenario! Road is completely blocked between nodes 1 and 2
    print("\n⚠️ --- INITIATING ROAD CLOSURE SIMULATION --- ⚠️")
    simulate_delivery("Javed Nihari", customer_node=8, traffic="normal", blocked_edges=[(1, 2), (2, 1), (14, 3), (3, 14)])