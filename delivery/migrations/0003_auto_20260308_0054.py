from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        # Note: Make sure the dependency below matches the name of your last migration file!
        # It usually looks something like ('delivery', '0002_auto_...'), but Django will usually
        # auto-fill the correct dependency when you run the empty makemigrations command.
        ('delivery', '0002_auto_20260308_0052'), 
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Create the Stored Procedure
            CREATE OR REPLACE PROCEDURE checkout_order(p_order_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                -- Update the order status to Preparing
                UPDATE delivery_order
                SET status = 'Preparing'
                WHERE order_id = p_order_id;
            END;
            $$;
            """,
            reverse_sql="""
            -- Tell Django how to undo this if we ever rollback our database
            DROP PROCEDURE IF EXISTS checkout_order(INT);
            """
        )
    ]