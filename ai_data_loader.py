import requests
import json

# The local address where your Django server is running
BASE_URL = "http://127.0.0.1:8000/api/"

def get_map_data():
    print("--- Connecting to Database API ---")
    
    try:
        # 1. Fetch the Nodes (Intersections/Locations in Karachi)
        nodes_response = requests.get(f"{BASE_URL}nodes/")
        nodes = nodes_response.json()
        print(f"✅ Successfully fetched {len(nodes)} Map Nodes.")

        # 2. Fetch the Edges (Roads/Distances between points)
        edges_response = requests.get(f"{BASE_URL}edges/")
        edges = edges_response.json()
        print(f"✅ Successfully fetched {len(edges)} Map Edges.")

        # --- Data Structure for AI lead ---
        # This creates a dictionary that the AI lead can use for graph traversal
        graph = {}
        for edge in edges:
            u = edge['from_node']
            v = edge['to_node']
            dist = edge['distance']
            
            if u not in graph: graph[u] = []
            graph[u].append((v, dist))

        print("\n--- Sample Graph Structure for Pathfinding ---")
        print(json.dumps(graph, indent=2))
        return nodes, edges, graph

    except Exception as e:
        print(f"❌ Error: Make sure your Django server is running! (python manage.py runserver)")
        print(f"Details: {e}")
        return None, None, None

if __name__ == "__main__":
    nodes, edges, graph = get_map_data()