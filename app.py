import streamlit as st
import os
import sys
import matplotlib.pyplot as plt
import pandas as pd
import requests

# === DJANGO SETUP ===
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings')
import django
django.setup()

from delivery.models import User, Restaurant, MenuItem, MapNode, MapEdge
from delivery.recommendations import get_content_based_recommendations
from delivery_brain import calculate_shortest_path_astar

# === UI SETUP ===
st.set_page_config(page_title="AI Food Delivery", layout="wide", page_icon="🍔")

CUSTOM_CSS = """
<style>
/* Modern Dark Theme with Glassmorphism */
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
    color: #e0e0e0;
}
[data-testid="stSidebar"] {
    background-color: rgba(15, 32, 39, 0.8) !important;
    backdrop-filter: blur(10px);
}
h1, h2, h3 {
    font-family: 'Inter', sans-serif;
    color: #00d2ff !important;
}
.restaurant-card {
    background: rgba(20, 20, 20, 0.4);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-bottom: 20px;
}
.restaurant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px 0 rgba(0, 210, 255, 0.3);
}
.restaurant-card h3 {
    margin-top: 0;
    color: #ff8a00 !important;
}
.badge {
    background-color: #00d2ff;
    color: #0f2027;
    padding: 6px 10px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 0.8em;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.title("🍔 NextGen AI Food Delivery Dashboard")

# Fetch Users
users = User.objects.all()
if not users.exists():
    st.error("No users found. Please run your initial migrations/seeds first.")
    st.stop()

# --- SIDEBAR: LOGIN ---
st.sidebar.header("🔐 User Portal")
user_dict = {u.name: u for u in users}
selected_user_name = st.sidebar.selectbox("Login as:", list(user_dict.keys()))
current_user = user_dict[selected_user_name]

st.sidebar.markdown(f"**Welcome back, {current_user.name}!** \n\n*Check out your personalized recommendations in the Dashboard.*")

# --- MAIN APP TABS ---
tab1, tab2, tab3 = st.tabs(["🌟 Recommendations", "🛒 Place Order", "🗺️ Live Logistics API"])

with tab1:
    st.header(f"Curated precisely for you, {current_user.name}")
    st.markdown("*Filtered dynamically via your historic order patterns and highest-rated cuisines.*")
    
    # Get recommendations
    recs = get_content_based_recommendations(current_user.user_id, top_n=6)
    
    # Grid layout for Restaurant Cards
    cols = st.columns(3)
    for i, r in enumerate(recs):
        with cols[i % 3]:
            st.markdown(f"""
            <div class="restaurant-card">
                <h3>{r.name}</h3>
                <p><b>Cuisine:</b> {r.cuisine}</p>
                <p><b>Rating:</b> ⭐ {r.rating}/5.0</p>
                <p><span class="badge">ETA: {r.average_delivery_time} mins</span></p>
            </div>
            """, unsafe_allow_html=True)

with tab2:
    st.header("Place a New Order")
    st.markdown("We are connected directly to PostgreSQL's `place_order` Stored Procedure.")
    
    restaurants = Restaurant.objects.all()
    rest_dict = {r.name: r for r in restaurants}
    selected_rest_name = st.selectbox("Choose Restaurant:", list(rest_dict.keys()))
    current_rest = rest_dict[selected_rest_name]
    
    items = MenuItem.objects.filter(restaurant=current_rest)
    item_dict = {i.name: i for i in items}
    
    if items.exists():
        selected_item_name = st.selectbox("Choose Menu Item:", list(item_dict.keys()))
        current_item = item_dict[selected_item_name]
        
        col_q, col_btn, _ = st.columns([1, 2, 2])
        qty = col_q.number_input("Quantity", min_value=1, max_value=10, value=1)
        
        with col_btn:
            st.write("") # Spacing
            st.write("")
            if st.button("🚀 Confirm Order", type="primary"):
                from django.db import connection
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "CALL place_order(%s, %s, %s, %s);",
                            [current_user.user_id, current_rest.restaurant_id, current_item.item_id, qty]
                        )
                    st.success(f"✅ Fantastic! You ordered **{qty}x {current_item.name}** from **{current_rest.name}**!")
                    st.balloons()
                except Exception as e:
                    st.error(f"Error placing order via Stored Procedure: {e}")
    else:
        st.warning("No menu items for this restaurant.")

with tab3:
    st.header("Live Logistics & AI Routing Maps")
    st.markdown("Visualize our custom A* algorithm navigating the city grid.")
    
    colA, colB = st.columns(2)
    r_name = colA.selectbox("Dispatcher (Restaurant):", list(rest_dict.keys()), key="map_rest")
    c_node = colB.number_input("To Customer Node (ID 1-15):", min_value=1, max_value=15, value=6)
    
    if st.button("🗺️ Compute & Visualize A* Route", type="primary"):
        rest = rest_dict[r_name]
        start_node_id = rest.location_node.node_id if rest.location_node else None
        
        if not start_node_id:
            st.error("Restaurant has no mapped location!")
        else:
            with st.spinner("Calculating optimal path avoiding virtual traffic..."):
                cost, path = calculate_shortest_path_astar(start_node_id, c_node, traffic_level="normal")
            
            if path:
                st.success(f"✅ Route Optimized! Traversed Distance: {cost:.2f} units.")
                st.info(f"**Path traversal:** `{' -> '.join(map(str, path))}`")
                
                # Fetch all nodes and edges for Matplotlib plotting
                nodes = {n.node_id: n for n in MapNode.objects.all()}
                edges = MapEdge.objects.all()
                
                fig, ax = plt.subplots(figsize=(10, 6))
                fig.patch.set_facecolor('#0f2027')
                ax.set_facecolor('#0f2027')
                
                # Plot all standard edges (roads)
                for edge in edges:
                    u = nodes[edge.from_node_id]
                    v = nodes[edge.to_node_id]
                    ax.plot([u.x_coordinate, v.x_coordinate], [u.y_coordinate, v.y_coordinate], 
                            color='#2c5364', linewidth=1.5, zorder=1, alpha=0.5)
                
                # Plot the active path
                for i in range(len(path)-1):
                    n1 = nodes[path[i]]
                    n2 = nodes[path[i+1]]
                    ax.plot([n1.x_coordinate, n2.x_coordinate], [n1.y_coordinate, n2.y_coordinate], 
                            color='#ff8a00', linewidth=4, zorder=2)
                
                # Plot nodes
                x = [n.x_coordinate for n in nodes.values()]
                y = [n.y_coordinate for n in nodes.values()]
                ax.scatter(x, y, color='#00d2ff', s=80, zorder=3, alpha=0.8)
                
                # Label nodes
                for n in nodes.values():
                    if n.node_id in path:
                         ax.annotate(str(n.node_id), (n.x_coordinate, n.y_coordinate + 0.3), 
                                    color="white", fontsize=11, fontweight='bold', ha='center', va='bottom')
                    else:
                         ax.annotate(str(n.node_id), (n.x_coordinate, n.y_coordinate - 0.3), 
                                    color='#2c5364', fontsize=9, ha='center', va='top')
                
                ax.axis('off')
                st.pyplot(fig)
                
            else:
                st.error("No path found! Node might be isolated or traffic blocked.")
