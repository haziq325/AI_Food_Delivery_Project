import os
import sys
import django
import json

# 1. PATH SETUP
sys.path.append(os.getcwd())

# 2. SETUP DJANGO
# Uses your actual config folder name: food_delivery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

# 3. IMPORTS
from delivery.models import User, Restaurant, MenuItem, MapNode, MapEdge
from map_data import MapNode as node_list, MapEdge as edge_list

def seed_database():
    print("Clearing old data...")
    User.objects.all().delete()
    Restaurant.objects.all().delete()
    MenuItem.objects.all().delete()
    MapNode.objects.all().delete()
    MapEdge.objects.all().delete()

    print("Creating Map Nodes (Intersections)...")
    created_nodes = {}
    for item in node_list:
        # All fields and keys are now strictly lowercase
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

    print("Loading restaurants from food_data.json...")
    json_path = os.path.join(os.path.dirname(__file__), 'food_data.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            restaurants_data = json.load(file)
            for data in restaurants_data:
                r = Restaurant.objects.create(
                    name=data['name'],
                    cuisine=data['cuisine'],
                    rating=data['rating'],
                    average_delivery_time=data['average_delivery_time']
                )
                for item in data['menu']:
                    MenuItem.objects.create(
                        restaurant=r, 
                        name=item['name'], 
                        price=item['price']
                    )
        print(f"✅ Successfully saved {len(restaurants_data)} restaurants!")
    except FileNotFoundError:
        print("❌ Error: Could not find 'food_data.json'!")

    print("✅ Database is fully seeded!")

if __name__ == '__main__':
    seed_database()