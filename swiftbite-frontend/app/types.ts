export interface UserSession {
  user_id: number;
  name: string;
  location_node_id: number | null;
  location_name: string;
  favorite_ids: number[];
}

export interface CartItem {
  item_id: number;
  name: string;
  price: number;
  quantity: number;
  restaurant_id: number;
  restaurant_name: string;
}

export interface OrderResult {
  order_id: number;
  path: number[];
  distance: number;
  estimated_time: number;
}
