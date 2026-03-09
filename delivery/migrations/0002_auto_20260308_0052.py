from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('delivery', '0001_initial'), # This makes sure your tables exist first!
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- 1. Create the function that calculates the total price
            CREATE OR REPLACE FUNCTION update_order_total()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE delivery_order
                SET total_price = (
                    SELECT COALESCE(SUM(mi.price * oi.quantity), 0)
                    FROM delivery_orderitem oi
                    JOIN delivery_menuitem mi ON oi.menu_item_id = mi.item_id
                    -- Handle both INSERT/UPDATE (NEW) and DELETE (OLD)
                    WHERE oi.order_id = COALESCE(NEW.order_id, OLD.order_id)
                )
                WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
                
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;

            -- 2. Create the Trigger that watches the OrderItem table
            CREATE TRIGGER trigger_update_order_total
            AFTER INSERT OR UPDATE OR DELETE ON delivery_orderitem
            FOR EACH ROW
            EXECUTE FUNCTION update_order_total();
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS trigger_update_order_total ON delivery_orderitem;
            DROP FUNCTION IF EXISTS update_order_total();
            """
        )
    ]