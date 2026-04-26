import os
import sys
import django
import math
from django.db.models import Count, Avg, Q

# --- PATH & DJANGO SETUP ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings') 
django.setup()

from delivery.models import User, Order, Restaurant, MapNode

def get_hybrid_recommendations(user_id, top_n=6):
    """
    Advanced Recommendation Engine:
    - Collaborative Filtering: Finding users with similar tastes.
    - Content-Based: Matching favorite cuisines.
    - Location-Aware: Prioritizing restaurants near the user's Karachi node.
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return list(Restaurant.objects.order_by('-rating')[:top_n])

    # 1. BASELINE: GET USER DATA
    user_past_orders = Order.objects.filter(user=user)
    user_restaurant_ids = user_past_orders.values_list('restaurant_id', flat=True).distinct()
    user_node = user.location

    # 2. COLLABORATIVE FILTERING (Similar User Tastes)
    # Find other users who have ordered from the same restaurants as this user
    similar_users = User.objects.filter(
        order__restaurant_id__in=user_restaurant_ids
    ).exclude(pk=user_id).distinct()

    # Get restaurants that those similar users liked (rating 4 or 5)
    collaborative_recs = (
        Restaurant.objects.filter(
            order__user__in=similar_users,
            order__rating__gte=4
        )
        .exclude(pk__in=user_restaurant_ids) # Don't recommend what they already tried
        .annotate(similarity_score=Count('order'))
        .order_by('-similarity_score')
    )

    # 3. CONTENT-BASED (Cuisine Match)
    top_cuisines = (
        user_past_orders.values('restaurant__cuisine')
        .annotate(count=Count('restaurant__cuisine'))
        .order_by('-count')
        .values_list('restaurant__cuisine', flat=True)[:2]
    )
    
    content_recs = Restaurant.objects.filter(cuisine__in=top_cuisines).exclude(pk__in=user_restaurant_ids)

    # 4. LOCATION-AWARE SCORING
    # Combine candidates
    candidate_ids = set(list(collaborative_recs.values_list('pk', flat=True)[:10]) + 
                        list(content_recs.values_list('pk', flat=True)[:10]))
    
    # If not enough candidates, add top-rated overall
    if len(candidate_ids) < top_n:
        top_rated = Restaurant.objects.order_by('-rating').exclude(pk__in=user_restaurant_ids)[:10]
        candidate_ids.update(top_rated.values_list('pk', flat=True))

    candidates = Restaurant.objects.filter(pk__in=candidate_ids)
    
    # Final Scoring: (Rating * 0.4) + (Location Score * 0.6)
    # Location Score = 1 / (1 + distance)
    scored_restaurants = []
    for rest in candidates:
        score = float(rest.rating or 0) * 0.5 # Rating contribution
        
        # Proximity contribution
        if user_node and rest.location_node:
            dist = math.sqrt(
                (user_node.x_coordinate - rest.location_node.x_coordinate)**2 + 
                (user_node.y_coordinate - rest.location_node.y_coordinate)**2
            )
            # Normalize: closer = higher score. Max distance in Karachi map is ~20
            proximity_score = 5.0 * (1.0 / (1.0 + (dist / 5.0))) 
            score += proximity_score
            
        scored_restaurants.append((rest, score))

    # Sort by hybrid score
    scored_restaurants.sort(key=lambda x: x[1], reverse=True)
    
    # Return just the Restaurant objects
    return [r[0] for r in scored_restaurants[:top_n]]

# Keep the old name as an alias if needed, or update the view to use the new one
def get_content_based_recommendations(user_id, top_n=6):
    return get_hybrid_recommendations(user_id, top_n)
