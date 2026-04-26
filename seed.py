import os
import sys
import django
import json

# --- PATH FIXER ---
# This ensures Python finds your 'food_delivery' folder
sys.path.append(os.getcwd())

# --- DJANGO SETUP ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

# --- IMPORTS ---
from delivery.models import User, Restaurant, MenuItem, MapNode, MapEdge
from map_data import MapNode as node_list, MapEdge as edge_list

def seed_database_from_json():
    print("Clearing old data...")
    User.objects.all().delete()
    Restaurant.objects.all().delete()
    MenuItem.objects.all().delete()
    MapNode.objects.all().delete()
    MapEdge.objects.all().delete()

    # --- 1. SEED MAP NODES & EDGES ---
    print("Creating Map Nodes (Intersections)...")
    created_nodes = {}
    for item in node_list:
        node = MapNode.objects.create(
            node_id=item['node_id'],     
            name=item['name'],
            x_coordinate=item['x_coordinate'],
            y_coordinate=item['y_coordinate'] 
        )
        created_nodes[item['node_id']] = node 

    print("Creating Map Edges (Roads)...")
    for item in edge_list:
        MapEdge.objects.create(
            edge_id=item['edge_id'],     
            from_node=created_nodes[item['from_node']],
            to_node=created_nodes[item['to_node']],
            distance=item['distance']
        )

    # --- 2. LOAD RESTAURANTS FROM JSON ---
    # --- 2. LOAD RESTAURANTS FROM JSON ---
    print("Loading data from local JSON file...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(current_dir, 'food_data.json')
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            restaurants_data = json.load(file)
            
        for data in restaurants_data:
            # 🚨 THE FIX: Get the MapNode object using the ID from your JSON
            loc_id = data.get('location_node')
            assigned_node = created_nodes.get(loc_id) if loc_id else None

            r = Restaurant.objects.create(
                name=data['name'],
                cuisine=data['cuisine'],
                rating=data['rating'],
                average_delivery_time=data['average_delivery_time'],
                location_node=assigned_node  # 🚨 THE FIX: Actually save it to PostgreSQL!
            )
            for item in data['menu']:
                MenuItem.objects.create(
                    restaurant=r,
                    name=item['name'],
                    price=item['price']
                )
        print("Successfully saved authentic Karachi restaurants to your database!")
    except FileNotFoundError:
        print("Error: Could not find 'food_data.json'. Make sure it is saved in the same folder as seed.py!")

    # --- 3. SEED USERS WITH LOCATION NODES ---
    print("Creating Users with location nodes...")
    users_to_create = [
        {"name": "Usman Sheikh",  "email": "usman@swiftbite.com",  "password": "usman123",  "node_id": 9},   # West Plaza
        {"name": "Sara Ahmed",    "email": "sara@swiftbite.com",   "password": "sara123",   "node_id": 6},   # Customer Area A
        {"name": "Ali Hassan",    "email": "ali@swiftbite.com",    "password": "ali123",    "node_id": 7},   # Customer Area B
        {"name": "Demo User",     "email": "admin@kinetic.ai",     "password": "admin",     "node_id": 6},   # Customer Area A (demo login)
        {"name": "Test User",     "email": "test@foodapp.com",     "password": "password123","node_id": 11},  # High Street
    ]
    for u in users_to_create:
        location_node = created_nodes.get(u["node_id"])
        User.objects.create(
            name=u["name"],
            email=u["email"],
            password=u["password"],
            location=location_node,
        )

    print("Database is fully seeded and ready for your AI algorithms!")

if __name__ == '__main__':
    seed_database_from_json()