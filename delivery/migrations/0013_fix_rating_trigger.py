from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('delivery', '0012_order_review'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Drop the old trigger that only handled UPDATES
            DROP TRIGGER IF EXISTS auto_update_restaurant_rating ON delivery_order;

            -- Re-create the trigger to handle BOTH INSERT and UPDATE
            CREATE TRIGGER auto_update_restaurant_rating
            AFTER INSERT OR UPDATE OF rating ON delivery_order
            FOR EACH ROW
            EXECUTE FUNCTION update_restaurant_rating_func();
            
            -- Also, run a one-time update for all restaurants to fix the current seeded ratings
            UPDATE delivery_restaurant r
            SET rating = (
                SELECT COALESCE(ROUND(AVG(rating), 1), 0)
                FROM delivery_order o
                WHERE o.restaurant_id = r.restaurant_id AND o.rating IS NOT NULL
            );
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS auto_update_restaurant_rating ON delivery_order;
            CREATE TRIGGER auto_update_restaurant_rating
            AFTER UPDATE OF rating ON delivery_order
            FOR EACH ROW
            EXECUTE FUNCTION update_restaurant_rating_func();
            """
        )
    ]
