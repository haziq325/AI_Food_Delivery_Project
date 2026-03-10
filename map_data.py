MapNode = [
    {"node_id": 1, "name": "Central Hub", "x_coordinate": 0, "y_coordinate": 0},
    {"node_id": 2, "name": "Pizza Palace", "x_coordinate": 2, "y_coordinate": 3},
    {"node_id": 3, "name": "Burger King", "x_coordinate": -2, "y_coordinate": 4},
    {"node_id": 4, "name": "Subway Station", "x_coordinate": 5, "y_coordinate": 0},
    {"node_id": 5, "name": "North Park", "x_coordinate": 0, "y_coordinate": 7},
    {"node_id": 6, "name": "Customer Area A", "x_coordinate": 4, "y_coordinate": 6},
    {"node_id": 7, "name": "Customer Area B", "x_coordinate": -5, "y_coordinate": 2},
    {"node_id": 8, "name": "East Gate", "x_coordinate": 8, "y_coordinate": 0},
    {"node_id": 9, "name": "West Plaza", "x_coordinate": -6, "y_coordinate": -3},
    {"node_id": 10,"name": "Sushi Bar", "x_coordinate": 1, "y_coordinate": -5},
    {"node_id": 11,"name": "High Street", "x_coordinate": 3, "y_coordinate": -2},
    {"node_id": 12,"name": "Library", "x_coordinate": -3, "y_coordinate": -6},
    {"node_id": 13,"name": "Cinema", "x_coordinate": 6, "y_coordinate": -4},
    {"node_id": 14,"name": "Hospital", "x_coordinate": -1, "y_coordinate": 3},
    {"node_id": 15,"name": "University", "x_coordinate": 4, "y_coordinate": -7}
]

MapEdge = [
    {"edge_id": 1, "from_node": 1, "to_node": 2, "distance": 3.6},
    {"edge_id": 2, "from_node": 1, "to_node": 14,"distance": 3.2},
    {"edge_id": 3, "from_node": 2, "to_node": 5, "distance": 4.5},
    {"edge_id": 4, "from_node": 14,"to_node": 3, "distance": 1.4},
    {"edge_id": 5, "from_node": 3, "to_node": 7, "distance": 3.6},
    {"edge_id": 6, "from_node": 5, "to_node": 6, "distance": 4.1},
    {"edge_id": 7, "from_node": 2, "to_node": 4, "distance": 4.2},
    {"edge_id": 8, "from_node": 4, "to_node": 8, "distance": 3.0},
    {"edge_id": 9, "from_node": 1, "to_node": 10, "distance": 5.1},
    {"edge_id": 10, "from_node": 10,"to_node": 11,"distance": 3.6},
    {"edge_id": 11, "from_node": 11,"to_node": 4, "distance": 2.8},
    {"edge_id": 12, "from_node": 7, "to_node": 9, "distance": 5.1},
    {"edge_id": 13, "from_node": 9, "to_node": 12,"distance": 4.2},
    {"edge_id": 14, "from_node": 10,"to_node": 12,"distance": 4.1},
    {"edge_id": 15, "from_node": 11,"to_node": 13,"distance": 3.6},
    {"edge_id": 16, "from_node": 13,"to_node": 15,"distance": 3.6},
    {"edge_id": 17, "from_node": 8, "to_node": 13,"distance": 4.5},
    {"edge_id": 18, "from_node": 6, "to_node": 4, "distance": 6.1}
]