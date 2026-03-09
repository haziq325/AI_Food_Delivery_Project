import os
import psycopg2
from dotenv import load_dotenv

# 1. Load the variables from the .env file
load_dotenv()

class DatabaseManager:
    def __init__(self):
        """Initializes the connection using environment variables."""
        try:
            self.conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS"),
                port=os.getenv("DB_PORT")
            )
            self.cur = self.conn.cursor()
            print(" Connection to PostgreSQL established.")
        except Exception as e:
            print(f" Error connecting to database: {e}")

    def execute_query(self, query, params=None):
        """Executes a command (Create, Update, Delete)."""
        try:
            self.cur.execute(query, params)
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            print(f"error Query failed: {e}")

    def fetch_data(self, query, params=None):
        """Fetches data from the database (Select)."""
        self.cur.execute(query, params)
        return self.cur.fetchall()

    def close(self):
        """Closes the connection."""
        self.cur.close()
        self.conn.close()
        print("Connection closed.")


if __name__ == "__main__":
    db = DatabaseManager()
    db.close()