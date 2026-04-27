import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load connection details from .env
# Assuming the script is in 'scripts/' and .env is in root
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def update_procedure():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            port=os.getenv("DB_PORT")
        )
        cur = conn.cursor()

        # The new SQL Procedure
        sql = """
        CREATE OR REPLACE PROCEDURE place_order(
            p_user_id INT,
            p_restaurant_id INT,
            p_menu_item_id INT,
            p_quantity INT
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_order_id INT;
            v_item_price NUMERIC(8, 2);
            v_total_price NUMERIC(8, 2);
            v_rest_x DOUBLE PRECISION;
            v_rest_y DOUBLE PRECISION;
            v_rider_id INT;
        BEGIN
            -- 1. Get restaurant coordinates for distance calculation
            SELECT n.x_coordinate, n.y_coordinate INTO v_rest_x, v_rest_y
            FROM delivery_restaurant r
            JOIN delivery_mapnode n ON r.location_node_id = n.node_id
            WHERE r.restaurant_id = p_restaurant_id;

            -- 2. Find the nearest available rider (Euclidean distance)
            SELECT r.rider_id INTO v_rider_id
            FROM delivery_rider r
            JOIN delivery_mapnode n ON r.current_location_id = n.node_id
            WHERE r.status = 'Available'
            ORDER BY ((n.x_coordinate - v_rest_x)^2 + (n.y_coordinate - v_rest_y)^2) ASC
            LIMIT 1;

            -- 3. Get price and calculate total
            SELECT price INTO v_item_price FROM delivery_menuitem WHERE item_id = p_menu_item_id;
            v_total_price := v_item_price * p_quantity;

            -- 4. Create order and assign rider
            INSERT INTO delivery_order (user_id, restaurant_id, rider_id, total_price, status, created_at)
            VALUES (p_user_id, p_restaurant_id, v_rider_id, v_total_price, CASE WHEN v_rider_id IS NOT NULL THEN 'Out for Delivery' ELSE 'Pending' END, NOW())
            RETURNING order_id INTO v_order_id;

            -- 5. Update Rider status
            IF v_rider_id IS NOT NULL THEN
                UPDATE delivery_rider SET status = 'Busy' WHERE rider_id = v_rider_id;
            END IF;

            -- 6. Create order items
            INSERT INTO delivery_orderitem (order_id, menu_item_id, quantity)
            VALUES (v_order_id, p_menu_item_id, p_quantity);
        END;
        $$;
        """

        print("🚀 Updating stored procedure in PostgreSQL...")
        cur.execute(sql)
        conn.commit()
        print("✅ Success! The atomic order/rider logic is now active.")

    except Exception as e:
        print(f"❌ Error connecting or executing: {e}")
        print("Tip: Check if your DB_PASS and other variables in .env are correct.")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    update_procedure()
