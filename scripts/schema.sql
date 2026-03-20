-- Drop in dependency order so re-running is safe
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS MenuItems;
DROP TABLE IF EXISTS Restaurants;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS MapEdges;
DROP TABLE IF EXISTS MapNodes;

-- MapNodes Table
CREATE TABLE MapNodes (
    Node_id SERIAL PRIMARY KEY,
    Name VARCHAR(100),
    X_coordinate DOUBLE PRECISION NOT NULL,
    Y_coordinate DOUBLE PRECISION NOT NULL
);

-- MapEdges Table
CREATE TABLE MapEdges (
    Edge_id SERIAL PRIMARY KEY,
    StartsAt INTEGER NOT NULL REFERENCES MapNodes(Node_id) ON DELETE CASCADE,
    EndsAt INTEGER NOT NULL REFERENCES MapNodes(Node_id) ON DELETE CASCADE,
    Distance DOUBLE PRECISION NOT NULL CHECK (Distance > 0)
);

-- Users Table
CREATE TABLE Users (
    User_id SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE,
    Password VARCHAR(255),
    Node_id INTEGER REFERENCES MapNodes(Node_id)
);

-- Restaurants Table
CREATE TABLE Restaurants (
    Restaurant_id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Cuisine VARCHAR(100),
    Rating NUMERIC(3,2) DEFAULT 0.0,
    Average_Delivery_Time INTEGER,
    Node_id INTEGER REFERENCES MapNodes(Node_id)
);

-- MenuItems Table
CREATE TABLE MenuItems (
    Item_id SERIAL PRIMARY KEY,
    Restaurant_id INTEGER NOT NULL REFERENCES Restaurants(Restaurant_id) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Price NUMERIC(8,2) NOT NULL CHECK (Price > 0)
);

-- Indexes on MenuItems
CREATE INDEX idx_menuitem_restaurant ON MenuItems(Restaurant_id);

-- Orders Table
CREATE TABLE Orders (
    Order_id SERIAL PRIMARY KEY,
    User_id INTEGER NOT NULL REFERENCES Users(User_id) ON DELETE CASCADE,
    Restaurant_id INTEGER NOT NULL REFERENCES Restaurants(Restaurant_id) ON DELETE CASCADE,
    Total_Price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    Rating INTEGER NULL CHECK (Rating >= 1 AND Rating <= 5),
    Created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes on Orders
CREATE INDEX idx_order_user ON Orders(User_id);
CREATE INDEX idx_order_restaurant ON Orders(Restaurant_id);
CREATE INDEX idx_order_status ON Orders(Status);

-- OrderItems Table
CREATE TABLE OrderItems (
    Order_Item_id SERIAL PRIMARY KEY,
    Order_id INTEGER NOT NULL REFERENCES Orders(Order_id) ON DELETE CASCADE,
    Menu_Item_id INTEGER NOT NULL REFERENCES MenuItems(Item_id) ON DELETE CASCADE,
    Quantity INTEGER NOT NULL DEFAULT 1
);
