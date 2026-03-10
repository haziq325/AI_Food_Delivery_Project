import os
import django
import heapq

# SETUP DJANGO
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import MapNode, MapEdge

def get_shortest_path(start_node_id, end_node_id):
    nodes = MapNode.objects.all()
    edges = MapEdge.objects.all()

    # Build Graph from Database
    graph = {node.node_id: [] for node in nodes}
    for edge in edges:
        graph[edge.from_node.node_id].append((edge.to_node.node_id, edge.distance))

    # Dijkstra's Algorithm
    queue = [(0, start_node_id, [])]
    visited = set()
    distances = {node.node_id: float('inf') for node in nodes}
    distances[start_node_id] = 0

    while queue:
        (current_distance, current_node, path) = heapq.heappop(queue)

        if current_node in visited:
            continue

        path = path + [current_node]
        visited.add(current_node)

        if current_node == end_node_id:
            return path, current_distance

        for neighbor, weight in graph.get(current_node, []):
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(queue, (distance, neighbor, path))

    return None, float('inf')

def calculate_delivery_time(distance, speed_kmh=20):
    # Time = Distance / Speed
    time_hours = distance / speed_kmh
    time_minutes = time_hours * 60
    return round(time_minutes, 2)

if __name__ == "__main__":
    # Example: Delivery from Burger King (Node 3) to East Gate (Node 8)
    start = 3
    end = 8
    path, dist = get_shortest_path(start, end)
    
    if path:
        time = calculate_delivery_time(dist)
        print(f"✅ Route Found: {' -> '.join(map(str, path))}")
        print(f"📏 Distance: {dist} km")
        print(f"⏳ Estimated Travel Time: {time} minutes")
    else:
        print("❌ No route found.")