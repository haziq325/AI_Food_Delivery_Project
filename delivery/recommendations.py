import os
import sys
import django

# --- PATH & DJANGO SETUP ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import User, Order, Restaurant
from django.db.models import Count

def get_content_based_recommendations(user_id, top_n=5):
    """
    Returns a list of recommended restaurants for a user based on their order history.
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        # If user doesn't exist, return top rated overall
        return list(Restaurant.objects.order_by('-rating')[:top_n])

    # 1. Get user's past orders
    past_orders = Order.objects.filter(user=user)

    if not past_orders.exists():
        # New user: return trending/overall highest rated
        return list(Restaurant.objects.order_by('-rating')[:top_n])

    # 2. Extract favorite cuisines
    favorite_cuisines = (
        past_orders.values('restaurant__cuisine')
        .annotate(order_count=Count('restaurant__cuisine'))
        .order_by('-order_count')
    )
    
    top_cuisines = [c['restaurant__cuisine'] for c in favorite_cuisines[:3]]

    # 3. Find matching restaurants (excluding ones they rated poorly, if any)
    poor_ratings = past_orders.filter(rating__lt=3).values_list('restaurant_id', flat=True)
    
    recommendations = Restaurant.objects.filter(cuisine__in=top_cuisines).exclude(pk__in=poor_ratings).order_by('-rating')
    
    # 4. Fallback backfill
    rec_list = list(recommendations[:top_n])
    
    if len(rec_list) < top_n:
        needed = top_n - len(rec_list)
        rec_ids = [r.pk for r in rec_list]
        backfill = Restaurant.objects.exclude(pk__in=rec_ids).order_by('-rating')[:needed]
        rec_list.extend(list(backfill))
        
    return rec_list
