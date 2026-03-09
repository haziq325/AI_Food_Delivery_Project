from db_manager import DatabaseManager

def verify_setup():
    db = DatabaseManager()
    
    # Query to list all user-created tables
    query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    """
    
    tables = db.fetch_data(query)
    
    print("\n---  Database Table List ---")
    if tables:
        for table in tables:
            print(f"        Found Table:        {table[0]}")
    else:
        print(" No tables found. check your setup of corect file or database")

    print("------------------------------\n")
    
    db.close()

if __name__ == "__main__":
    verify_setup()