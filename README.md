# 🛵 SwiftBite

> A high-performance relational food delivery and fleet management system built for Karachi — powered by PostgreSQL, Django REST Framework, and A* pathfinding.

---

## 📌 Overview

SwiftBite is a backend database system for a food delivery platform, purpose-built for the logistics of a dense urban environment. Rather than relying on application-layer business logic, SwiftBite embeds intelligence directly into PostgreSQL through stored procedures, triggers, and a graph-based delivery network.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 16 |
| Backend Framework | Django 5 + Django REST Framework |
| ORM | Django ORM (with raw SQL for procedures) |
| Pathfinding | A* Algorithm (graph traversal on MapNode/MapEdge) |
| Language | Python 3.12 |

---

## 🗂️ Data Model

The system is built on 8 core entities:

- **User** — customer accounts with a map location and restaurant favorites
- **Restaurant** — listings with cuisine, aggregate rating, and map location
- **MenuItem** — items belonging to a restaurant with price validation
- **Order** — the central transaction linking user, restaurant, and rider
- **OrderItem** — junction table resolving order ↔ menu item with quantity
- **Rider** — fleet entity with real-time status and current map location
- **MapNode** — geographic intersection in the delivery network
- **MapEdge** — weighted directed road segment between two nodes

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL 16
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/swiftbite.git
cd swiftbite
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the database

Create a PostgreSQL database, then update `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'swiftbite',
        'USER': 'your_postgres_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 5. Apply migrations

```bash
python manage.py migrate
```

### 6. Seed the database

```bash
python seed.py
```

This populates the database with 50 map nodes, 25 restaurants, 300+ menu items, 20 riders, and sample orders.

### 7. Run the development server

```bash
python manage.py runserver
```

The API will be live at `http://localhost:8000/`.

---

## 🧠 Key Features

### A\* Pathfinding
Karachi's road network is modelled as a weighted directed graph. When an order is placed, the system computes the optimal delivery route from the restaurant's MapNode to the customer's MapNode using A\* and stores it as a path on the Order record.

### Trigger-Based Rating Engine
A PL/pgSQL trigger fires after every order review is submitted. It automatically recalculates and updates the restaurant's aggregate rating in real time — no application code required.

### Stored Procedure Order Placement
Order creation is handled by `CALL place_order(...)` — a PostgreSQL stored procedure that atomically inserts the order, all order items, computes the total price, and assigns the nearest available rider in a single transaction.

### Fleet Management
Riders move between three states: `Available → Busy → Available`. The system prevents unavailable riders from being assigned new orders and automatically frees them upon delivery.

---

## 🗃️ Database Schema Highlights

```
User        ──< Order >── Restaurant
                 │
              OrderItem ──── MenuItem
                 │
               Rider
                 │
             MapNode ──< MapEdge >── MapNode
```

- `CheckConstraint` on `MenuItem.price > 0`
- `CheckConstraint` on `Order.rating` between 1–5 or NULL
- `CheckConstraint` on `MapEdge.distance > 0`
- Indexes on `Order.user`, `Order.restaurant`, `Order.status`, `MenuItem.restaurant`

---

## 🧪 Running Tests

```bash
python manage.py test
```

Tests cover:
- Price and rating constraint enforcement at the database level
- Rider status transitions on order delivery
- Rating trigger correctness after review submission

---

## 📁 Project Structure

```
swiftbite/
├── core/
│   ├── models.py          # All 8 entity definitions
│   ├── views.py           # DRF API views
│   ├── serializers.py     # JSON serializers
│   ├── urls.py            # API routing
│   └── migrations/        # Database migration history
├── seed.py                # Database seeding script
├── manage.py
├── requirements.txt
└── README.md
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/restaurants/` | List all restaurants |
| GET | `/api/restaurants/:id/menu/` | Get menu for a restaurant |
| POST | `/api/orders/` | Place a new order |
| GET | `/api/orders/:id/` | Get order details and delivery path |
| PATCH | `/api/orders/:id/` | Update order status |
| GET | `/api/riders/` | List all riders and their status |
| GET | `/api/analytics/` | Revenue and fleet metrics |

---

## 🔮 Future Plans

- [ ] PostGIS integration for true coordinate-based proximity queries
- [ ] Migrate rider status updates to a database trigger
- [ ] WebSocket support for real-time order tracking
- [ ] Predictive demand modelling on the analytics dashboard

---
