from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    phone: str
    shop_name: str
    password: str

class UserLogin(BaseModel):
    username_or_phone: str
    password: str

class ItemCreate(BaseModel):
    category_id: int
    name: str
    image_url: str
    price_per_kg: float
    available_sizes: List[float]

class OrderCreate(BaseModel):
    user_id: int
    items_details: List[dict]
    total_price: float