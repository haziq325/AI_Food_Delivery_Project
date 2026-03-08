 -- commands backup 
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Restaurants;
DROP TABLE IF EXISTS MapNodes;
DROP TABLE IF EXISTS MapEdges;

--  MapNodes Table @1
-- This table will store the nodes of the map, which represent locations such as restaurants, intersections, etc.
--  cordinate geometry map and its location and its name. {x, y}
CREATE TABLE MapNodes (
    node_id SERIAL PRIMARY KEY,
    node_name VARCHAR(100),
    x_coordinate DOUBLE PRECISION NOT NULL, -- Longitude
    y_coordinate DOUBLE PRECISION NOT NULL  -- Latitude
);

--  MapEdges Table @2
-- the roads that will conect  nodes together, and the distance between them. 
-- The distance will be used as the Weight for the A* algorithm to calculate the shortest path between nodes. will help in heuristic function 
-- rsturants and theri location and their distance in between
CREATE TABLE MapEdges (
    edge_id SERIAL PRIMARY KEY,
    start_node_id INTEGER REFERENCES MapNodes(node_id),
    end_node_id INTEGER REFERENCES MapNodes(node_id),
    distance DOUBLE PRECISION NOT NULL -- The 'Weight' for A*
);

-- Existing MapNodes and MapEdges code is above...

--  Restaurants Table @3
-- Links a restaurant business info to a physical Node on the map
CREATE TABLE Restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100),
    rating DECIMAL(3,2),
    node_id INTEGER REFERENCES MapNodes(node_id) -- Connection to Spatial Layer
);
    
-- Users Table @4
-- To track where the customer is located on the map
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    node_id INTEGER REFERENCES MapNodes(node_id) -- Connection to Spatial Layer
);




