import os
import django
import json

# 1. Setup Django Environment (Keep your actual project name here!)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import User, Restaurant, MenuItem, MapNode, MapEdge

def seed_database_from_json():
    print("Clearing old data...")
    User.objects.all().delete()
    Restaurant.objects.all().delete()
    MenuItem.objects.all().delete()
    MapNode.objects.all().delete()
    MapEdge.objects.all().delete()

    # --- 1. SEED MAP NODES & EDGES (For the AI) ---
    print("Creating Map Nodes (Intersections)...")
    
    node_a = MapNode.objects.create(name="Clifton Block 5", x_coordinate=0.0, y_coordinate=0.0)
    node_b = MapNode.objects.create(name="DHA Phase 6", x_coordinate=2.0, y_coordinate=0.0)
    node_c = MapNode.objects.create(name="Saddar", x_coordinate=0.0, y_coordinate=3.0)

    print("Creating Map Edges (Roads)...")
    MapEdge.objects.create(from_node=node_a, to_node=node_b, distance=2.5)
    MapEdge.objects.create(from_node=node_b, to_node=node_c, distance=4.1)
    MapEdge.objects.create(from_node=node_a, to_node=node_c, distance=3.2)

    # --- 2. LOAD RESTAURANTS FROM JSON ---
    print("Loading data from local JSON file...")
    
    # This automatically finds the food_data.json file in your folder
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(current_dir, 'food_data.json')
    
    try:
        with open(json_file_path, 'r') as file:
            restaurants_data = json.load(file)
            
        for data in restaurants_data:
            # Create the restaurant
            r = Restaurant.objects.create(
                name=data['name'],
                cuisine=data['cuisine'],
                rating=data['rating'],
                average_delivery_time=data['average_delivery_time']
            )
            
            # Create the menu items for this restaurant
            for item in data['menu']:
                MenuItem.objects.create(
                    restaurant=r,
                    name=item['name'],
                    price=item['price']
                )
                
        print(f"✅ Successfully saved authentic Karachi restaurants to your database!")
        
    except FileNotFoundError:
        print("❌ Error: Could not find 'food_data.json'. Make sure it is saved in the same folder as seed.py!")

    # --- 3. SEED A TEST USER ---
    print("Creating a Test User...")
    User.objects.create(name="Test User", email="test@foodapp.com", password="password123")
    print("✅ Database is fully seeded and ready for your friend's AI algorithms!")

if __name__ == '__main__':
    seed_database_from_json()