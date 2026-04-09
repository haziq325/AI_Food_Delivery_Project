import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import joblib
import time
import os
import sys
import django

# --- PATH & DJANGO SETUP FOR PATHFINDING ---
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery_brain import calculate_shortest_path, calculate_shortest_path_astar
from delivery.models import MapNode

def generate_ml_evaluation_charts():
    print("Generating ML Evaluation Charts...")
    # Recreate the synthetic test logic from train_eta_model.py to evaluate
    np.random.seed(42)
    num_samples = 1000
    distances = np.random.uniform(1.0, 20.0, num_samples)
    order_sizes = np.random.randint(1, 11, num_samples)
    traffic_multipliers = np.random.choice([0.8, 1.0, 1.5, 2.5], num_samples, p=[0.2, 0.5, 0.2, 0.1])
    noise = np.random.normal(0, 3, num_samples)
    actual_times = (distances * 2 * traffic_multipliers) + (order_sizes * 2) + noise
    actual_times = np.maximum(actual_times, 5)

    df = pd.DataFrame({
        'distance': distances,
        'order_size': order_sizes,
        'traffic_multiplier': traffic_multipliers,
        'actual_time': actual_times
    })
    
    # Normally we do train_test_split, but for visualizing errors on the whole distribution:
    X = df[['distance', 'order_size', 'traffic_multiplier']]
    
    try:
        model = joblib.load('eta_model.pkl')
    except Exception as e:
        print("Model not found. Please run train_eta_model.py first.")
        return

    predictions = model.predict(X)
    df['predicted_time'] = predictions
    df['error'] = df['predicted_time'] - df['actual_time']
    
    # 1. Scatter Plot: Actual vs Predicted
    plt.figure(figsize=(8, 6))
    plt.scatter(df['actual_time'], df['predicted_time'], alpha=0.5, color='blue')
    plt.plot([0, max(df['actual_time'])], [0, max(df['actual_time'])], color='red', linestyle='--')
    plt.title('Actual vs Predicted Delivery Time')
    plt.xlabel('Actual Time (Minutes)')
    plt.ylabel('Predicted Time (Minutes)')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.savefig('ml_actual_vs_predicted.png')
    print(" -> Saved 'ml_actual_vs_predicted.png'")
    
    # 2. Histogram: Error Distribution
    plt.figure(figsize=(8, 6))
    plt.hist(df['error'], bins=30, color='purple', edgecolor='black', alpha=0.7)
    plt.title('Prediction Error Distribution')
    plt.xlabel('Error (Minutes: Predicted - Actual)')
    plt.ylabel('Frequency')
    plt.grid(axis='y', linestyle='--', alpha=0.6)
    plt.savefig('ml_error_distribution.png')
    print(" -> Saved 'ml_error_distribution.png'")

def generate_algorithm_comparison_chart():
    print("Generating Pathfinding Algorithm Comparison Charts...")
    
    # Grab all nodes
    nodes = list(MapNode.objects.values_list('node_id', flat=True))
    if len(nodes) < 2:
        print("Not enough nodes in database to compare algorithms.")
        return
        
    import random
    random.seed(10)
    
    # Select 20 random pairs of different nodes
    pairs = []
    while len(pairs) < 20:
        u = random.choice(nodes)
        v = random.choice(nodes)
        if u != v and (u, v) not in pairs:
            pairs.append((u, v))
            
    dijkstra_times = []
    astar_times = []
    
    for u, v in pairs:
        # Measure Dijkstra
        start_t = time.perf_counter()
        calculate_shortest_path(u, v, traffic_level="normal")
        dijkstra_t = (time.perf_counter() - start_t) * 1000 # ms
        dijkstra_times.append(dijkstra_t)
        
        # Measure A*
        start_t = time.perf_counter()
        calculate_shortest_path_astar(u, v, traffic_level="normal")
        astar_t = (time.perf_counter() - start_t) * 1000 # ms
        astar_times.append(astar_t)

    avg_dijkstra = np.mean(dijkstra_times)
    avg_astar = np.mean(astar_times)
    
    # Plot Bar Chart
    plt.figure(figsize=(8, 6))
    algorithms = ['Dijkstra', 'A* (A-Star)']
    times = [avg_dijkstra, avg_astar]
    
    colors = ['#1f77b4', '#ff7f0e']
    bars = plt.bar(algorithms, times, color=colors, width=0.5)
    
    plt.title('Average Execution Time: Dijkstra vs A*')
    plt.ylabel('Execution Time (ms)')
    
    # Add value labels
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 0.5, f"{yval:.2f} ms", ha='center', va='bottom', fontweight='bold')
        
    plt.grid(axis='y', linestyle='--', alpha=0.6)
    plt.ylim(0, max(times) + 5)
    plt.savefig('pathfinding_comparison.png')
    print(" -> Saved 'pathfinding_comparison.png'")


if __name__ == "__main__":
    print("Starting Chart Generation...")
    generate_ml_evaluation_charts()
    generate_algorithm_comparison_chart()
    print("All charts successfully generated!")
