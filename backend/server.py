from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models for Calculator Data
class CostStructure(BaseModel):
    id: str = Field(default="default")
    labourPercent: float = 20
    packagingAmount: float = 100
    manufacturingPercent: float = 20
    marketingPercent: float = 20
    deliveryAmount: float = 100
    gstPercent: float = 18
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    quantity: Any  # Can be int or string
    calculatorMode: str
    costStructureSnapshot: Dict[str, Any]
    ingredientCost: Optional[float] = None
    costPrice: Optional[float] = None
    targetSellingPrice: Optional[float] = None
    targetMargin: Optional[float] = None
    customProfitPercent: Optional[float] = None
    # Calculation results
    totalCost: Optional[float] = None
    totalCostPrice: Optional[float] = None
    finalSellingPrice: Optional[float] = None
    scenarios: Optional[List[Dict[str, Any]]] = None
    actualMargin: Optional[float] = None
    maxIngredientCost: Optional[float] = None
    # Additional fields
    savedAt: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    updatedAt: Optional[str] = None

class HamperProduct(BaseModel):
    id: str
    name: str
    category: str
    quantity: int
    unitPrice: float
    totalPrice: float

class Hamper(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    occasionName: str
    category: str  # Gold, Platinum, Luxe
    products: List[HamperProduct]
    totalCost: float
    finalPrice: float
    profitMargin: float
    description: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

class Category(BaseModel):
    name: str
    productCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Status Check Models (existing)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Create/Update Models
class ProductCreate(BaseModel):
    name: str
    category: str
    quantity: Any
    calculatorMode: str
    costStructureSnapshot: Dict[str, Any]
    ingredientCost: Optional[float] = None
    costPrice: Optional[float] = None
    targetSellingPrice: Optional[float] = None
    targetMargin: Optional[float] = None
    customProfitPercent: Optional[float] = None
    totalCost: Optional[float] = None
    totalCostPrice: Optional[float] = None
    finalSellingPrice: Optional[float] = None
    scenarios: Optional[List[Dict[str, Any]]] = None
    actualMargin: Optional[float] = None
    maxIngredientCost: Optional[float] = None

class HamperCreate(BaseModel):
    occasionName: str
    category: str
    products: List[HamperProduct]
    totalCost: float
    finalPrice: float
    profitMargin: float
    description: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str


# ==================== COST STRUCTURE ENDPOINTS ====================
@api_router.get("/cost-structure", response_model=CostStructure)
async def get_cost_structure():
    """Get the current cost structure settings"""
    cost_structure = await db.cost_structure.find_one({"id": "default"})
    if not cost_structure:
        # Create default cost structure if none exists
        default_structure = CostStructure()
        await db.cost_structure.insert_one(default_structure.dict())
        return default_structure
    return CostStructure(**cost_structure)

@api_router.put("/cost-structure", response_model=CostStructure)
async def update_cost_structure(cost_structure: CostStructure):
    """Update the cost structure settings"""
    cost_structure.id = "default"
    cost_structure.updatedAt = datetime.utcnow()
    await db.cost_structure.replace_one(
        {"id": "default"}, 
        cost_structure.dict(), 
        upsert=True
    )
    return cost_structure


# ==================== CATEGORY ENDPOINTS ====================
@api_router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all product categories"""
    categories = await db.categories.find().to_list(1000)
    if not categories:
        # Create default categories if none exist
        default_categories = [
            'LIQUOR CHOCOLATES', 'BON BON', 'GANACHE', 'TRUFFLES', 'STICK PALO',
            'SQUARE BAR', 'TRAVEL CAKES', 'COOKIES- SMALL CHUNK', 'SAVORY- VEGAN',
            'BROWNIE', 'DRAGEES', 'QUADRAPLETS SPREADS', 'CHOCOLATE CUBE',
            'BISCOTTI', 'CHOCOLATE FLOWER BAR'
        ]
        for cat_name in default_categories:
            await db.categories.insert_one({"name": cat_name, "createdAt": datetime.utcnow()})
        return default_categories
    return [cat["name"] for cat in categories]

@api_router.post("/categories", response_model=dict)
async def add_category(category: CategoryCreate):
    """Add a new category"""
    # Check if category already exists
    existing = await db.categories.find_one({"name": category.name.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    await db.categories.insert_one({
        "name": category.name.upper(),
        "createdAt": datetime.utcnow()
    })
    return {"message": "Category added successfully", "name": category.name.upper()}

@api_router.put("/categories/{old_name}")
async def update_category(old_name: str, new_name: str):
    """Update a category name"""
    # Update category name
    result = await db.categories.update_one(
        {"name": old_name},
        {"$set": {"name": new_name.upper()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Update all products with this category
    await db.products.update_many(
        {"category": old_name},
        {"$set": {"category": new_name.upper()}}
    )
    
    return {"message": "Category updated successfully"}

@api_router.delete("/categories/{category_name}")
async def delete_category(category_name: str):
    """Delete a category and move its products to first available category"""
    # Get all categories
    all_categories = await db.categories.find().to_list(1000)
    if len(all_categories) <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the last category")
    
    # Find first available category that's not being deleted
    first_available = None
    for cat in all_categories:
        if cat["name"] != category_name:
            first_available = cat["name"]
            break
    
    if first_available:
        # Move products to first available category
        await db.products.update_many(
            {"category": category_name},
            {"$set": {"category": first_available}}
        )
    else:
        # Delete products if no alternative category
        await db.products.delete_many({"category": category_name})
    
    # Delete the category
    await db.categories.delete_one({"name": category_name})
    return {"message": "Category deleted successfully"}


# ==================== PRODUCT ENDPOINTS ====================
@api_router.get("/products", response_model=List[Product])
async def get_products():
    """Get all products"""
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    """Create a new product"""
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    return product

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate):
    """Update a specific product"""
    product_dict = product_data.dict()
    product_dict["updatedAt"] = datetime.now().strftime("%Y-%m-%d")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a specific product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ==================== HAMPER ENDPOINTS ====================
@api_router.get("/hampers", response_model=List[Hamper])
async def get_hampers():
    """Get all hampers"""
    hampers = await db.hampers.find().to_list(1000)
    return [Hamper(**hamper) for hamper in hampers]

@api_router.post("/hampers", response_model=Hamper)
async def create_hamper(hamper_data: HamperCreate):
    """Create a new hamper"""
    hamper = Hamper(**hamper_data.dict())
    await db.hampers.insert_one(hamper.dict())
    return hamper

@api_router.get("/hampers/{hamper_id}", response_model=Hamper)
async def get_hamper(hamper_id: str):
    """Get a specific hamper by ID"""
    hamper = await db.hampers.find_one({"id": hamper_id})
    if not hamper:
        raise HTTPException(status_code=404, detail="Hamper not found")
    return Hamper(**hamper)

@api_router.delete("/hampers/{hamper_id}")
async def delete_hamper(hamper_id: str):
    """Delete a specific hamper"""
    result = await db.hampers.delete_one({"id": hamper_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Hamper not found")
    return {"message": "Hamper deleted successfully"}


# ==================== EXISTING STATUS CHECK ENDPOINTS ====================
@api_router.get("/")
async def root():
    return {"message": "Nolita Cacao Calculator API - Ready for collaborative use!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
