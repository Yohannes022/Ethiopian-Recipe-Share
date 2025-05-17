from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
import json
import os
import random
import string
import time
from datetime import datetime, timedelta
import uuid

# Initialize FastAPI app
app = FastAPI(title="Restaurant Management API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data file paths
DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
RESTAURANTS_FILE = os.path.join(DATA_DIR, "restaurants.json")
RECIPES_FILE = os.path.join(DATA_DIR, "recipes.json")
ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files if they don't exist
def init_data_file(file_path, default_data):
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump(default_data, f, indent=2)

# Initialize all data files
init_data_file(USERS_FILE, {"users": []})
init_data_file(RESTAURANTS_FILE, {"restaurants": []})
init_data_file(RECIPES_FILE, {"recipes": []})
init_data_file(ORDERS_FILE, {"orders": []})

# Helper functions for data operations
def read_data(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def write_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# Models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str = "customer"  # customer, owner, manager

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    avatar: Optional[str] = None
    verified: bool = False
    createdAt: str
    updatedAt: str

class VerificationRequest(BaseModel):
    phone: str
    otp: str

class RestaurantBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    cuisine: List[str]
    priceLevel: str
    openingHours: Dict[str, Dict[str, str]]
    contactPhone: str
    contactEmail: EmailStr

class RestaurantCreate(RestaurantBase):
    ownerId: str

class Restaurant(RestaurantBase):
    id: str
    ownerId: str
    managerId: Optional[str] = None
    rating: float = 0.0
    ratingCount: int = 0
    imageUrl: str
    coverImageUrl: Optional[str] = None
    isOpen: bool = True
    createdAt: str
    updatedAt: str

class MenuItem(BaseModel):
    id: str
    restaurantId: str
    name: str
    description: Optional[str] = None
    price: float
    category: str
    imageUrl: Optional[str] = None
    isAvailable: bool = True
    preparationTime: Optional[int] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    nutritionalInfo: Optional[Dict[str, Any]] = None
    createdAt: str
    updatedAt: str

class OrderItem(BaseModel):
    id: str
    menuItemId: str
    name: str
    price: float
    quantity: int
    specialInstructions: Optional[str] = None

class Order(BaseModel):
    id: str
    userId: str
    restaurantId: str
    items: List[OrderItem]
    status: str  # pending, confirmed, preparing, ready, in-delivery, delivered, cancelled
    totalAmount: float
    paymentMethod: str
    paymentStatus: str  # pending, paid, failed
    serviceType: str  # delivery, pickup, dine-in
    deliveryAddress: Optional[str] = None
    deliveryFee: Optional[float] = None
    tableNumber: Optional[str] = None
    pickupTime: Optional[str] = None
    specialInstructions: Optional[str] = None
    createdAt: str
    updatedAt: str

class RecipeBase(BaseModel):
    title: str
    description: str
    prepTime: int
    cookTime: int
    servings: int
    difficulty: str
    ingredients: List[Dict[str, Any]]
    instructions: List[str]
    tags: List[str]
    cuisine: str
    mealType: str
    calories: Optional[int] = None

class RecipeCreate(RecipeBase):
    userId: str
    imageUrl: str

class Recipe(RecipeBase):
    id: str
    userId: str
    imageUrl: str
    rating: float = 0
    ratingCount: int = 0
    comments: List[Dict[str, Any]] = []
    isFavorite: bool = False
    createdAt: str
    updatedAt: str

class Comment(BaseModel):
    userId: str
    text: str
    rating: Optional[int] = None

class AnalyticsData(BaseModel):
    totalSales: float
    totalOrders: int
    newCustomers: int
    avgOrderValue: float
    salesByDay: Dict[str, float]
    ordersByDay: Dict[str, int]
    popularItems: List[Dict[str, Any]]
    customerBreakdown: Dict[str, int]

# Authentication
def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

# Store OTPs with expiration (in memory for demo, would use Redis in production)
otps = {}  # {phone: {"otp": "123456", "expires": timestamp}}

# Routes
@app.get("/")
def read_root():
    return {"message": "Restaurant Management API"}

# User routes
@app.post("/api/users/register", response_model=Dict[str, Any])
def register_user(user: UserCreate):
    data = read_data(USERS_FILE)
    
    # Check if email already exists
    if any(u["email"] == user.email for u in data["users"]):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if phone already exists
    if any(u["phone"] == user.phone for u in data["users"]):
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Create new user
    now = datetime.now().isoformat()
    new_user = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password": user.password,  # In production, hash this password
        "role": user.role,
        "verified": False,
        "avatar": f"https://ui-avatars.com/api/?name={user.name.replace(' ', '+')}&background=random",
        "createdAt": now,
        "updatedAt": now
    }
    
    data["users"].append(new_user)
    write_data(USERS_FILE, data)
    
    # Generate OTP
    otp = generate_otp()
    otps[user.phone] = {
        "otp": otp,
        "expires": time.time() + 300  # 5 minutes expiration
    }
    
    # Return user data (excluding password) and OTP (for demo purposes)
    user_response = {k: v for k, v in new_user.items() if k != "password"}
    return {"user": user_response, "otp": otp}

@app.post("/api/auth/verify-otp", response_model=Dict[str, Any])
def verify_otp(verification: VerificationRequest):
    # Check if OTP exists and is valid
    if verification.phone not in otps or time.time() > otps[verification.phone]["expires"]:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    if verification.otp != otps[verification.phone]["otp"]:
        raise HTTPException(status_code=400, detail="Incorrect OTP")
    
    # Mark user as verified
    data = read_data(USERS_FILE)
    for user in data["users"]:
        if user["phone"] == verification.phone:
            user["verified"] = True
            user["updatedAt"] = datetime.now().isoformat()
            write_data(USERS_FILE, data)
            
            # Remove OTP after successful verification
            del otps[verification.phone]
            
            # Return user data (excluding password)
            user_response = {k: v for k, v in user.items() if k != "password"}
            return {"user": user_response}
    
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/api/auth/resend-otp", response_model=Dict[str, Any])
def resend_otp(phone: str):
    # Check if user exists
    data = read_data(USERS_FILE)
    user = next((u for u in data["users"] if u["phone"] == phone), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate new OTP
    otp = generate_otp()
    otps[phone] = {
        "otp": otp,
        "expires": time.time() + 300  # 5 minutes expiration
    }
    
    return {"message": "OTP sent successfully", "otp": otp}

@app.post("/api/auth/login", response_model=Dict[str, Any])
def login(email: str, password: str):
    data = read_data(USERS_FILE)
    user = next((u for u in data["users"] if u["email"] == email and u["password"] == password), None)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["verified"]:
        raise HTTPException(status_code=403, detail="Account not verified")
    
    # Return user data (excluding password)
    user_response = {k: v for k, v in user.items() if k != "password"}
    return {"user": user_response}

# Restaurant routes
@app.post("/api/restaurants", response_model=Restaurant)
def create_restaurant(restaurant: RestaurantCreate):
    data = read_data(RESTAURANTS_FILE)
    
    # Check if owner exists
    users_data = read_data(USERS_FILE)
    owner = next((u for u in users_data["users"] if u["id"] == restaurant.ownerId), None)
    
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Create new restaurant
    now = datetime.now().isoformat()
    new_restaurant = {
        "id": str(uuid.uuid4()),
        **restaurant.dict(),
        "rating": 0.0,
        "ratingCount": 0,
        "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500",
        "coverImageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500",
        "isOpen": True,
        "createdAt": now,
        "updatedAt": now
    }
    
    data["restaurants"].append(new_restaurant)
    write_data(RESTAURANTS_FILE, data)
    
    return new_restaurant

@app.get("/api/restaurants", response_model=List[Restaurant])
def get_restaurants():
    data = read_data(RESTAURANTS_FILE)
    return data["restaurants"]

@app.get("/api/restaurants/{restaurant_id}", response_model=Restaurant)
def get_restaurant(restaurant_id: str):
    data = read_data(RESTAURANTS_FILE)
    restaurant = next((r for r in data["restaurants"] if r["id"] == restaurant_id), None)
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return restaurant

@app.get("/api/restaurants/owner/{owner_id}", response_model=List[Restaurant])
def get_owner_restaurants(owner_id: str):
    data = read_data(RESTAURANTS_FILE)
    restaurants = [r for r in data["restaurants"] if r["ownerId"] == owner_id]
    return restaurants

# Menu routes
@app.post("/api/restaurants/{restaurant_id}/menu", response_model=MenuItem)
def add_menu_item(restaurant_id: str, menu_item: Dict[str, Any]):
    data = read_data(RESTAURANTS_FILE)
    restaurant = next((r for r in data["restaurants"] if r["id"] == restaurant_id), None)
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Initialize menu if it doesn't exist
    if "menu" not in restaurant:
        restaurant["menu"] = []
    
    # Create new menu item
    now = datetime.now().isoformat()
    new_item = {
        "id": str(uuid.uuid4()),
        "restaurantId": restaurant_id,
        **menu_item,
        "createdAt": now,
        "updatedAt": now
    }
    
    restaurant["menu"].append(new_item)
    write_data(RESTAURANTS_FILE, data)
    
    return new_item

@app.get("/api/restaurants/{restaurant_id}/menu", response_model=List[MenuItem])
def get_menu(restaurant_id: str):
    data = read_data(RESTAURANTS_FILE)
    restaurant = next((r for r in data["restaurants"] if r["id"] == restaurant_id), None)
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return restaurant.get("menu", [])

# Order routes
@app.post("/api/orders", response_model=Order)
def create_order(order: Dict[str, Any]):
    data = read_data(ORDERS_FILE)
    
    # Create new order
    now = datetime.now().isoformat()
    new_order = {
        "id": str(uuid.uuid4()),
        **order,
        "status": "pending",
        "createdAt": now,
        "updatedAt": now
    }
    
    data["orders"].append(new_order)
    write_data(ORDERS_FILE, data)
    
    return new_order

@app.get("/api/orders/user/{user_id}", response_model=List[Order])
def get_user_orders(user_id: str):
    data = read_data(ORDERS_FILE)
    orders = [o for o in data["orders"] if o["userId"] == user_id]
    return orders

@app.get("/api/orders/restaurant/{restaurant_id}", response_model=List[Order])
def get_restaurant_orders(restaurant_id: str):
    data = read_data(ORDERS_FILE)
    orders = [o for o in data["orders"] if o["restaurantId"] == restaurant_id]
    return orders

@app.put("/api/orders/{order_id}/status", response_model=Order)
def update_order_status(order_id: str, status: str):
    data = read_data(ORDERS_FILE)
    order = next((o for o in data["orders"] if o["id"] == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "in-delivery", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    order["status"] = status
    order["updatedAt"] = datetime.now().isoformat()
    write_data(ORDERS_FILE, data)
    
    return order

# Recipe routes
@app.post("/api/recipes", response_model=Recipe)
def create_recipe(recipe: RecipeCreate):
    data = read_data(RECIPES_FILE)
    
    # Create new recipe
    now = datetime.now().isoformat()
    new_recipe = {
        "id": str(uuid.uuid4()),
        **recipe.dict(),
        "rating": 0,
        "ratingCount": 0,
        "comments": [],
        "isFavorite": False,
        "createdAt": now,
        "updatedAt": now
    }
    
    data["recipes"].append(new_recipe)
    write_data(RECIPES_FILE, data)
    
    return new_recipe

@app.get("/api/recipes", response_model=List[Recipe])
def get_recipes():
    data = read_data(RECIPES_FILE)
    return data["recipes"]

@app.get("/api/recipes/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: str):
    data = read_data(RECIPES_FILE)
    recipe = next((r for r in data["recipes"] if r["id"] == recipe_id), None)
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return recipe

@app.post("/api/recipes/{recipe_id}/comments", response_model=Recipe)
def add_comment(recipe_id: str, comment: Comment):
    data = read_data(RECIPES_FILE)
    recipe = next((r for r in data["recipes"] if r["id"] == recipe_id), None)
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Add comment
    now = datetime.now().isoformat()
    new_comment = {
        "id": str(uuid.uuid4()),
        **comment.dict(),
        "createdAt": now
    }
    
    recipe["comments"].append(new_comment)
    
    # Update rating if provided
    if comment.rating:
        total_rating = recipe["rating"] * recipe["ratingCount"]
        recipe["ratingCount"] += 1
        recipe["rating"] = (total_rating + comment.rating) / recipe["ratingCount"]
    
    recipe["updatedAt"] = now
    write_data(RECIPES_FILE, data)
    
    return recipe

# Analytics routes
@app.get("/api/analytics/restaurant/{restaurant_id}", response_model=AnalyticsData)
def get_restaurant_analytics(restaurant_id: str, period: str = "week"):
    """
    Get analytics data for a restaurant
    
    period: day, week, month, year
    """
    # Get orders for this restaurant
    orders_data = read_data(ORDERS_FILE)
    restaurant_orders = [o for o in orders_data["orders"] if o["restaurantId"] == restaurant_id]
    
    # Calculate date range based on period
    now = datetime.now()
    if period == "day":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "year":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        raise HTTPException(status_code=400, detail="Invalid period. Must be one of: day, week, month, year")
    
    # Filter orders by date
    filtered_orders = [
        o for o in restaurant_orders 
        if datetime.fromisoformat(o["createdAt"]) >= start_date
    ]
    
    # Calculate metrics
    total_sales = sum(o["totalAmount"] for o in filtered_orders)
    total_orders = len(filtered_orders)
    
    # Get unique customers
    unique_customers = set(o["userId"] for o in filtered_orders)
    new_customers = len(unique_customers)
    
    # Calculate average order value
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    # Calculate sales by day
    sales_by_day = {}
    orders_by_day = {}
    
    for order in filtered_orders:
        order_date = datetime.fromisoformat(order["createdAt"]).strftime("%Y-%m-%d")
        sales_by_day[order_date] = sales_by_day.get(order_date, 0) + order["totalAmount"]
        orders_by_day[order_date] = orders_by_day.get(order_date, 0) + 1
    
    # Calculate popular items
    item_counts = {}
    for order in filtered_orders:
        for item in order["items"]:
            item_id = item["menuItemId"]
            item_counts[item_id] = item_counts.get(item_id, 0) + item["quantity"]
    
    # Sort items by popularity
    popular_items = [
        {"id": item_id, "name": next((i["name"] for o in filtered_orders for i in o["items"] if i["menuItemId"] == item_id), "Unknown"), "count": count}
        for item_id, count in sorted(item_counts.items(), key=lambda x: x[1], reverse=True)
    ][:5]  # Top 5 items
    
    # Calculate customer breakdown (new vs returning)
    all_orders = [o for o in restaurant_orders]
    all_customers = set(o["userId"] for o in all_orders)
    returning_customers = len(all_customers) - new_customers
    
    customer_breakdown = {
        "new": new_customers,
        "returning": returning_customers
    }
    
    return {
        "totalSales": total_sales,
        "totalOrders": total_orders,
        "newCustomers": new_customers,
        "avgOrderValue": avg_order_value,
        "salesByDay": sales_by_day,
        "ordersByDay": orders_by_day,
        "popularItems": popular_items,
        "customerBreakdown": customer_breakdown
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    