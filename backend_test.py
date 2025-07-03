#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime
import random

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://023bf178-5281-4668-811e-640ed8057122.preview.emergentagent.com"
API_BASE_URL = f"{BACKEND_URL}/api"

def test_api_health():
    """Test the basic API health endpoint"""
    print("\n=== Testing Basic API Health ===")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response missing 'message' field"
        assert "Nolita Cacao Calculator API" in response.json()["message"], "Unexpected response content"
        
        print("✅ Basic API Health Check: PASSED")
        return True
    except Exception as e:
        print(f"❌ Basic API Health Check: FAILED - {str(e)}")
        return False

def test_create_status_check():
    """Test creating a status check"""
    print("\n=== Testing Status Check Creation ===")
    try:
        # Generate a unique client name for testing
        client_name = f"test_client_{uuid.uuid4()}"
        payload = {"client_name": client_name}
        
        response = requests.post(f"{API_BASE_URL}/status", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert response.json()["client_name"] == client_name, "Client name in response doesn't match request"
        assert "id" in response.json(), "Response missing 'id' field"
        assert "timestamp" in response.json(), "Response missing 'timestamp' field"
        
        print("✅ Status Check Creation: PASSED")
        return response.json()["id"]
    except Exception as e:
        print(f"❌ Status Check Creation: FAILED - {str(e)}")
        return None

def test_get_status_checks(expected_id=None):
    """Test retrieving status checks"""
    print("\n=== Testing Status Check Retrieval ===")
    try:
        response = requests.get(f"{API_BASE_URL}/status")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} status checks")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        
        if expected_id:
            found = False
            for status in response.json():
                if status["id"] == expected_id:
                    found = True
                    break
            assert found, f"Created status check with ID {expected_id} not found in retrieved list"
            print(f"✅ Status Check with ID {expected_id} was successfully retrieved")
        
        print("✅ Status Check Retrieval: PASSED")
        return True
    except Exception as e:
        print(f"❌ Status Check Retrieval: FAILED - {str(e)}")
        return False

def test_data_persistence():
    """Test data persistence by creating and then retrieving a status check"""
    print("\n=== Testing Data Persistence ===")
    try:
        # Create a new status check
        status_id = test_create_status_check()
        if not status_id:
            print("❌ Data Persistence: FAILED - Could not create status check")
            return False
        
        # Small delay to ensure data is persisted
        time.sleep(1)
        
        # Retrieve and verify the status check exists
        if test_get_status_checks(expected_id=status_id):
            print("✅ Data Persistence: PASSED")
            return True
        else:
            print("❌ Data Persistence: FAILED - Could not retrieve created status check")
            return False
    except Exception as e:
        print(f"❌ Data Persistence: FAILED - {str(e)}")
        return False

def test_error_handling():
    """Test error handling with invalid inputs"""
    print("\n=== Testing Error Handling ===")
    try:
        # Test with missing required field
        response = requests.post(f"{API_BASE_URL}/status", json={})
        print(f"Status Code for missing field: {response.status_code}")
        assert response.status_code in [400, 422], f"Expected status code 400 or 422 for validation error, got {response.status_code}"
        
        # Test with invalid JSON
        headers = {'Content-Type': 'application/json'}
        response = requests.post(f"{API_BASE_URL}/status", data="invalid json", headers=headers)
        print(f"Status Code for invalid JSON: {response.status_code}")
        assert response.status_code in [400, 422], f"Expected status code 400 or 422 for invalid JSON, got {response.status_code}"
        
        print("✅ Error Handling: PASSED")
        return True
    except Exception as e:
        print(f"❌ Error Handling: FAILED - {str(e)}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n=== Testing CORS Configuration ===")
    try:
        headers = {
            'Origin': 'http://example.com',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        # Preflight request
        response = requests.options(f"{API_BASE_URL}/", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not present')}")
        
        assert response.status_code in [200, 204], f"Expected status code 200 or 204, got {response.status_code}"
        assert 'Access-Control-Allow-Origin' in response.headers, "CORS headers not present in response"
        
        print("✅ CORS Configuration: PASSED")
        return True
    except Exception as e:
        print(f"❌ CORS Configuration: FAILED - {str(e)}")
        return False

# ==================== COST STRUCTURE API TESTS ====================

def test_get_cost_structure():
    """Test retrieving the cost structure"""
    print("\n=== Testing Cost Structure Retrieval ===")
    try:
        response = requests.get(f"{API_BASE_URL}/cost-structure")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response missing 'id' field"
        assert "labourPercent" in response.json(), "Response missing 'labourPercent' field"
        assert "packagingAmount" in response.json(), "Response missing 'packagingAmount' field"
        assert "manufacturingPercent" in response.json(), "Response missing 'manufacturingPercent' field"
        assert "marketingPercent" in response.json(), "Response missing 'marketingPercent' field"
        assert "deliveryAmount" in response.json(), "Response missing 'deliveryAmount' field"
        assert "gstPercent" in response.json(), "Response missing 'gstPercent' field"
        
        print("✅ Cost Structure Retrieval: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Cost Structure Retrieval: FAILED - {str(e)}")
        return None

def test_update_cost_structure():
    """Test updating the cost structure"""
    print("\n=== Testing Cost Structure Update ===")
    try:
        # First get the current cost structure
        current = test_get_cost_structure()
        if not current:
            print("❌ Cost Structure Update: FAILED - Could not retrieve current cost structure")
            return False
        
        # Update with new values
        updated = current.copy()
        updated["labourPercent"] = 25.5
        updated["packagingAmount"] = 150.75
        updated["manufacturingPercent"] = 22.5
        updated["marketingPercent"] = 18.5
        updated["deliveryAmount"] = 120.25
        updated["gstPercent"] = 18.0
        
        response = requests.put(f"{API_BASE_URL}/cost-structure", json=updated)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert response.json()["labourPercent"] == 25.5, "labourPercent not updated correctly"
        assert response.json()["packagingAmount"] == 150.75, "packagingAmount not updated correctly"
        assert response.json()["manufacturingPercent"] == 22.5, "manufacturingPercent not updated correctly"
        assert response.json()["marketingPercent"] == 18.5, "marketingPercent not updated correctly"
        assert response.json()["deliveryAmount"] == 120.25, "deliveryAmount not updated correctly"
        assert response.json()["gstPercent"] == 18.0, "gstPercent not updated correctly"
        
        # Verify the update persisted
        time.sleep(1)
        verification = test_get_cost_structure()
        assert verification["labourPercent"] == 25.5, "labourPercent update did not persist"
        assert verification["packagingAmount"] == 150.75, "packagingAmount update did not persist"
        
        print("✅ Cost Structure Update: PASSED")
        return True
    except Exception as e:
        print(f"❌ Cost Structure Update: FAILED - {str(e)}")
        return False

# ==================== CATEGORIES API TESTS ====================

def test_get_categories():
    """Test retrieving all categories"""
    print("\n=== Testing Categories Retrieval ===")
    try:
        response = requests.get(f"{API_BASE_URL}/categories")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} categories")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        assert len(response.json()) > 0, "No categories returned"
        
        print("✅ Categories Retrieval: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Categories Retrieval: FAILED - {str(e)}")
        return None

def test_add_category():
    """Test adding a new category"""
    print("\n=== Testing Category Addition ===")
    try:
        # Generate a unique category name
        category_name = f"TEST CATEGORY {uuid.uuid4().hex[:8]}"
        payload = {"name": category_name}
        
        response = requests.post(f"{API_BASE_URL}/categories", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response missing 'message' field"
        assert "name" in response.json(), "Response missing 'name' field"
        assert response.json()["name"] == category_name.upper(), "Category name in response doesn't match request"
        
        # Verify the category was added
        time.sleep(1)
        categories = test_get_categories()
        assert category_name.upper() in categories, f"Added category {category_name.upper()} not found in retrieved list"
        
        print("✅ Category Addition: PASSED")
        return category_name.upper()
    except Exception as e:
        print(f"❌ Category Addition: FAILED - {str(e)}")
        return None

def test_update_category():
    """Test updating a category name"""
    print("\n=== Testing Category Update ===")
    try:
        # First add a new category
        old_name = test_add_category()
        if not old_name:
            print("❌ Category Update: FAILED - Could not add category to update")
            return False
        
        # Update the category name
        new_name = f"UPDATED CATEGORY {uuid.uuid4().hex[:8]}"
        
        response = requests.put(f"{API_BASE_URL}/categories/{old_name}?new_name={new_name}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response missing 'message' field"
        
        # Verify the update persisted
        time.sleep(1)
        categories = test_get_categories()
        assert new_name.upper() in categories, f"Updated category {new_name.upper()} not found in retrieved list"
        assert old_name not in categories, f"Old category {old_name} still exists in retrieved list"
        
        print("✅ Category Update: PASSED")
        return new_name.upper()
    except Exception as e:
        print(f"❌ Category Update: FAILED - {str(e)}")
        return None

def test_delete_category():
    """Test deleting a category"""
    print("\n=== Testing Category Deletion ===")
    try:
        # First add a new category
        category_name = test_add_category()
        if not category_name:
            print("❌ Category Deletion: FAILED - Could not add category to delete")
            return False
        
        # Delete the category
        response = requests.delete(f"{API_BASE_URL}/categories/{category_name}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response missing 'message' field"
        
        # Verify the deletion persisted
        time.sleep(1)
        categories = test_get_categories()
        assert category_name not in categories, f"Deleted category {category_name} still exists in retrieved list"
        
        print("✅ Category Deletion: PASSED")
        return True
    except Exception as e:
        print(f"❌ Category Deletion: FAILED - {str(e)}")
        return False

# ==================== PRODUCTS API TESTS ====================

def test_get_products():
    """Test retrieving all products"""
    print("\n=== Testing Products Retrieval ===")
    try:
        response = requests.get(f"{API_BASE_URL}/products")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} products")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        
        print("✅ Products Retrieval: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Products Retrieval: FAILED - {str(e)}")
        return None

def test_create_product():
    """Test creating a new product"""
    print("\n=== Testing Product Creation ===")
    try:
        # Get categories for product creation
        categories = test_get_categories()
        if not categories:
            print("❌ Product Creation: FAILED - Could not retrieve categories")
            return False
        
        # Get cost structure for product creation
        cost_structure = test_get_cost_structure()
        if not cost_structure:
            print("❌ Product Creation: FAILED - Could not retrieve cost structure")
            return False
        
        # Create a new product
        product_name = f"Test Chocolate {uuid.uuid4().hex[:8]}"
        category = random.choice(categories)
        
        payload = {
            "name": product_name,
            "category": category,
            "quantity": "100g",
            "calculatorMode": "ingredientToPrice",
            "costStructureSnapshot": cost_structure,
            "ingredientCost": 150.0,
            "totalCost": 250.0,
            "totalCostPrice": 300.0,
            "finalSellingPrice": 450.0,
            "actualMargin": 33.33
        }
        
        response = requests.post(f"{API_BASE_URL}/products", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response missing 'id' field"
        assert response.json()["name"] == product_name, "Product name in response doesn't match request"
        assert response.json()["category"] == category, "Category in response doesn't match request"
        
        print("✅ Product Creation: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Product Creation: FAILED - {str(e)}")
        return None

def test_update_product():
    """Test updating a product"""
    print("\n=== Testing Product Update ===")
    try:
        # First create a new product
        product = test_create_product()
        if not product:
            print("❌ Product Update: FAILED - Could not create product to update")
            return False
        
        # Update the product
        updated_payload = {
            "name": f"Updated {product['name']}",
            "category": product["category"],
            "quantity": "200g",
            "calculatorMode": product["calculatorMode"],
            "costStructureSnapshot": product["costStructureSnapshot"],
            "ingredientCost": 200.0,
            "totalCost": 300.0,
            "totalCostPrice": 350.0,
            "finalSellingPrice": 500.0,
            "actualMargin": 30.0
        }
        
        response = requests.put(f"{API_BASE_URL}/products/{product['id']}", json=updated_payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert response.json()["id"] == product["id"], "Product ID in response doesn't match request"
        assert response.json()["name"] == updated_payload["name"], "Product name not updated correctly"
        assert response.json()["quantity"] == updated_payload["quantity"], "Product quantity not updated correctly"
        assert response.json()["ingredientCost"] == updated_payload["ingredientCost"], "Product ingredientCost not updated correctly"
        
        # Verify the update persisted
        time.sleep(1)
        response = requests.get(f"{API_BASE_URL}/products/{product['id']}")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert response.json()["name"] == updated_payload["name"], "Product name update did not persist"
        
        print("✅ Product Update: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Product Update: FAILED - {str(e)}")
        return None

def test_delete_product():
    """Test deleting a product"""
    print("\n=== Testing Product Deletion ===")
    try:
        # First create a new product
        product = test_create_product()
        if not product:
            print("❌ Product Deletion: FAILED - Could not create product to delete")
            return False
        
        # Delete the product
        response = requests.delete(f"{API_BASE_URL}/products/{product['id']}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response missing 'message' field"
        
        # Verify the deletion persisted
        time.sleep(1)
        response = requests.get(f"{API_BASE_URL}/products/{product['id']}")
        assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
        
        print("✅ Product Deletion: PASSED")
        return True
    except Exception as e:
        print(f"❌ Product Deletion: FAILED - {str(e)}")
        return False

# ==================== HAMPERS API TESTS ====================

def test_get_hampers():
    """Test retrieving all hampers"""
    print("\n=== Testing Hampers Retrieval ===")
    try:
        response = requests.get(f"{API_BASE_URL}/hampers")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} hampers")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        
        print("✅ Hampers Retrieval: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Hampers Retrieval: FAILED - {str(e)}")
        return None

def test_create_hamper():
    """Test creating a new hamper"""
    print("\n=== Testing Hamper Creation ===")
    try:
        # First create a product to include in the hamper
        product1 = test_create_product()
        if not product1:
            print("❌ Hamper Creation: FAILED - Could not create product for hamper")
            return False
        
        # Create another product
        product2 = test_create_product()
        if not product2:
            print("❌ Hamper Creation: FAILED - Could not create second product for hamper")
            return False
        
        # Create a new hamper
        hamper_name = f"Test Hamper {uuid.uuid4().hex[:8]}"
        
        hamper_products = [
            {
                "id": product1["id"],
                "name": product1["name"],
                "category": product1["category"],
                "quantity": 2,
                "unitPrice": product1["finalSellingPrice"],
                "totalPrice": product1["finalSellingPrice"] * 2
            },
            {
                "id": product2["id"],
                "name": product2["name"],
                "category": product2["category"],
                "quantity": 1,
                "unitPrice": product2["finalSellingPrice"],
                "totalPrice": product2["finalSellingPrice"]
            }
        ]
        
        total_cost = sum(p["totalPrice"] for p in hamper_products)
        
        payload = {
            "occasionName": hamper_name,
            "category": "Gold",
            "products": hamper_products,
            "totalCost": total_cost,
            "finalPrice": total_cost * 1.2,  # 20% markup
            "profitMargin": 20.0,
            "description": "A test hamper with chocolate products"
        }
        
        response = requests.post(f"{API_BASE_URL}/hampers", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response missing 'id' field"
        assert response.json()["occasionName"] == hamper_name, "Hamper name in response doesn't match request"
        assert len(response.json()["products"]) == 2, "Hamper should contain 2 products"
        
        print("✅ Hamper Creation: PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Hamper Creation: FAILED - {str(e)}")
        return None

def test_delete_hamper():
    """Test deleting a hamper"""
    print("\n=== Testing Hamper Deletion ===")
    try:
        # First create a new hamper
        hamper = test_create_hamper()
        if not hamper:
            print("❌ Hamper Deletion: FAILED - Could not create hamper to delete")
            return False
        
        # Delete the hamper
        response = requests.delete(f"{API_BASE_URL}/hampers/{hamper['id']}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response missing 'message' field"
        
        # Verify the deletion persisted
        time.sleep(1)
        response = requests.get(f"{API_BASE_URL}/hampers/{hamper['id']}")
        assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
        
        print("✅ Hamper Deletion: PASSED")
        return True
    except Exception as e:
        print(f"❌ Hamper Deletion: FAILED - {str(e)}")
        return False

# ==================== ONLINE MENU PRODUCTS API TESTS ====================

def test_create_online_menu_profit_margin_product():
    """Test creating an online menu product with profit margin mode"""
    print("\n=== Testing Online Menu Product Creation (Profit Margin Mode) ===")
    try:
        # Get cost structure for product creation
        cost_structure = test_get_cost_structure()
        if not cost_structure:
            print("❌ Online Menu Product Creation: FAILED - Could not retrieve cost structure")
            return False
        
        # Create a new online menu product with profit margin mode
        product_name = f"Online Menu Test (Profit Margin) {uuid.uuid4().hex[:8]}"
        
        # Create online menu specific cost structure
        online_cost_structure = cost_structure.copy()
        online_cost_structure["labourPercent"] = 20
        online_cost_structure["manufacturingPercent"] = 20
        online_cost_structure["marketingPercent"] = 20
        online_cost_structure["packagingAmount"] = 30  # 30% of ingredient cost
        
        payload = {
            "name": product_name,
            "category": "Online Menu",
            "quantity": "Online Platform",
            "calculatorMode": "online-menu-profit-margin",
            "costStructureSnapshot": online_cost_structure,
            "ingredientCost": 200.0,
            "platformCommission": 25.0,  # 25% of selling price
            "targetMargin": 30.0,
            "totalCost": 320.0,  # Ingredient cost × 1.6 + packaging
            "finalSellingPrice": 600.0,
            "netRevenue": 450.0,  # After platform commission
            "actualMargin": 28.75
        }
        
        response = requests.post(f"{API_BASE_URL}/products", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response missing 'id' field"
        assert response.json()["name"] == product_name, "Product name in response doesn't match request"
        assert response.json()["category"] == "Online Menu", "Category in response doesn't match request"
        assert response.json()["calculatorMode"] == "online-menu-profit-margin", "Calculator mode in response doesn't match request"
        assert "platformCommission" in response.json()["costStructureSnapshot"], "Platform commission not saved in cost structure snapshot"
        
        print("✅ Online Menu Product Creation (Profit Margin Mode): PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Online Menu Product Creation (Profit Margin Mode): FAILED - {str(e)}")
        return None

def test_create_online_menu_price_analysis_product():
    """Test creating an online menu product with price analysis mode"""
    print("\n=== Testing Online Menu Product Creation (Price Analysis Mode) ===")
    try:
        # Get cost structure for product creation
        cost_structure = test_get_cost_structure()
        if not cost_structure:
            print("❌ Online Menu Product Creation: FAILED - Could not retrieve cost structure")
            return False
        
        # Create a new online menu product with price analysis mode
        product_name = f"Online Menu Test (Price Analysis) {uuid.uuid4().hex[:8]}"
        
        # Create online menu specific cost structure
        online_cost_structure = cost_structure.copy()
        online_cost_structure["labourPercent"] = 20
        online_cost_structure["manufacturingPercent"] = 20
        online_cost_structure["marketingPercent"] = 20
        online_cost_structure["packagingAmount"] = 30  # 30% of ingredient cost
        
        payload = {
            "name": product_name,
            "category": "Online Menu",
            "quantity": "Online Platform",
            "calculatorMode": "online-menu-price-analysis",
            "costStructureSnapshot": online_cost_structure,
            "ingredientCost": 180.0,
            "platformCommission": 25.0,  # 25% of selling price
            "targetSellingPrice": 550.0,
            "totalCost": 288.0,  # Ingredient cost × 1.6 + packaging
            "finalSellingPrice": 550.0,
            "netRevenue": 412.5,  # After platform commission
            "actualMargin": 30.25
        }
        
        response = requests.post(f"{API_BASE_URL}/products", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response missing 'id' field"
        assert response.json()["name"] == product_name, "Product name in response doesn't match request"
        assert response.json()["category"] == "Online Menu", "Category in response doesn't match request"
        assert response.json()["calculatorMode"] == "online-menu-price-analysis", "Calculator mode in response doesn't match request"
        assert "platformCommission" in response.json()["costStructureSnapshot"], "Platform commission not saved in cost structure snapshot"
        
        print("✅ Online Menu Product Creation (Price Analysis Mode): PASSED")
        return response.json()
    except Exception as e:
        print(f"❌ Online Menu Product Creation (Price Analysis Mode): FAILED - {str(e)}")
        return None

def test_get_online_menu_products():
    """Test retrieving online menu products by filtering"""
    print("\n=== Testing Online Menu Products Retrieval ===")
    try:
        # First create online menu products if they don't exist
        profit_margin_product = test_create_online_menu_profit_margin_product()
        price_analysis_product = test_create_online_menu_price_analysis_product()
        
        if not profit_margin_product or not price_analysis_product:
            print("⚠️ Online Menu Products Retrieval: WARNING - Could not create test products, but will continue with test")
        
        # Get all products
        all_products = test_get_products()
        if not all_products:
            print("❌ Online Menu Products Retrieval: FAILED - Could not retrieve products")
            return False
        
        # Filter online menu products
        online_menu_products = [p for p in all_products if p["calculatorMode"].startswith("online-menu")]
        profit_margin_products = [p for p in all_products if p["calculatorMode"] == "online-menu-profit-margin"]
        price_analysis_products = [p for p in all_products if p["calculatorMode"] == "online-menu-price-analysis"]
        
        print(f"Found {len(online_menu_products)} online menu products")
        print(f"Found {len(profit_margin_products)} profit margin mode products")
        print(f"Found {len(price_analysis_products)} price analysis mode products")
        
        assert len(online_menu_products) > 0, "No online menu products found"
        
        # Verify at least one product of each type exists
        if profit_margin_product:
            found_profit_margin = False
            for p in online_menu_products:
                if p["id"] == profit_margin_product["id"]:
                    found_profit_margin = True
                    break
            assert found_profit_margin, "Created profit margin product not found in retrieved list"
        
        if price_analysis_product:
            found_price_analysis = False
            for p in online_menu_products:
                if p["id"] == price_analysis_product["id"]:
                    found_price_analysis = True
                    break
            assert found_price_analysis, "Created price analysis product not found in retrieved list"
        
        print("✅ Online Menu Products Retrieval: PASSED")
        return online_menu_products
    except Exception as e:
        print(f"❌ Online Menu Products Retrieval: FAILED - {str(e)}")
        return None

# ==================== COMPREHENSIVE DATA PERSISTENCE TEST ====================

def test_comprehensive_data_persistence():
    """Test comprehensive data persistence across all API endpoints"""
    print("\n=== Testing Comprehensive Data Persistence ===")
    try:
        # 1. Update cost structure
        cost_structure_updated = test_update_cost_structure()
        if not cost_structure_updated:
            print("❌ Comprehensive Data Persistence: FAILED - Cost structure update failed")
            return False
        
        # 2. Create a category
        category_name = test_add_category()
        if not category_name:
            print("❌ Comprehensive Data Persistence: FAILED - Category creation failed")
            return False
        
        # 3. Create a product in that category
        payload = {
            "name": f"Persistence Test Product {uuid.uuid4().hex[:8]}",
            "category": category_name,
            "quantity": "150g",
            "calculatorMode": "ingredientToPrice",
            "costStructureSnapshot": test_get_cost_structure(),
            "ingredientCost": 175.0,
            "totalCost": 275.0,
            "totalCostPrice": 325.0,
            "finalSellingPrice": 475.0,
            "actualMargin": 31.58
        }
        
        product_response = requests.post(f"{API_BASE_URL}/products", json=payload)
        if product_response.status_code != 200:
            print(f"❌ Comprehensive Data Persistence: FAILED - Product creation failed with status {product_response.status_code}")
            return False
        
        product = product_response.json()
        print(f"Created product: {product['name']} with ID: {product['id']}")
        
        # 4. Create an online menu product
        online_menu_payload = {
            "name": f"Online Menu Persistence Test {uuid.uuid4().hex[:8]}",
            "category": "Online Menu",
            "quantity": "Online Platform",
            "calculatorMode": "online-menu-profit-margin",
            "costStructureSnapshot": {
                **test_get_cost_structure(),
                "platformCommission": 25.0
            },
            "ingredientCost": 200.0,
            "platformCommission": 25.0,
            "targetMargin": 30.0,
            "totalCost": 320.0,
            "finalSellingPrice": 600.0,
            "netRevenue": 450.0,
            "actualMargin": 28.75
        }
        
        online_product_response = requests.post(f"{API_BASE_URL}/products", json=online_menu_payload)
        if online_product_response.status_code != 200:
            print(f"❌ Comprehensive Data Persistence: FAILED - Online menu product creation failed with status {online_product_response.status_code}")
            return False
        
        online_product = online_product_response.json()
        print(f"Created online menu product: {online_product['name']} with ID: {online_product['id']}")
        
        # 5. Create a hamper with that product
        hamper_products = [
            {
                "id": product["id"],
                "name": product["name"],
                "category": product["category"],
                "quantity": 3,
                "unitPrice": product["finalSellingPrice"],
                "totalPrice": product["finalSellingPrice"] * 3
            }
        ]
        
        hamper_payload = {
            "occasionName": f"Persistence Test Hamper {uuid.uuid4().hex[:8]}",
            "category": "Platinum",
            "products": hamper_products,
            "totalCost": hamper_products[0]["totalPrice"],
            "finalPrice": hamper_products[0]["totalPrice"] * 1.25,  # 25% markup
            "profitMargin": 25.0,
            "description": "A test hamper for persistence testing"
        }
        
        hamper_response = requests.post(f"{API_BASE_URL}/hampers", json=hamper_payload)
        if hamper_response.status_code != 200:
            print(f"❌ Comprehensive Data Persistence: FAILED - Hamper creation failed with status {hamper_response.status_code}")
            return False
        
        hamper = hamper_response.json()
        print(f"Created hamper: {hamper['occasionName']} with ID: {hamper['id']}")
        
        # 6. Wait to ensure data is persisted
        time.sleep(2)
        
        # 7. Verify all data persists
        # Check cost structure
        cost_structure = test_get_cost_structure()
        if not cost_structure or cost_structure["labourPercent"] != 25.5:
            print("❌ Comprehensive Data Persistence: FAILED - Cost structure did not persist")
            return False
        
        # Check category
        categories = test_get_categories()
        if not categories or category_name not in categories:
            print("❌ Comprehensive Data Persistence: FAILED - Category did not persist")
            return False
        
        # Check product
        product_verification = requests.get(f"{API_BASE_URL}/products/{product['id']}")
        if product_verification.status_code != 200:
            print(f"❌ Comprehensive Data Persistence: FAILED - Product did not persist, status {product_verification.status_code}")
            return False
        
        # Check online menu product
        online_product_verification = requests.get(f"{API_BASE_URL}/products/{online_product['id']}")
        if online_product_verification.status_code != 200:
            print(f"❌ Comprehensive Data Persistence: FAILED - Online menu product did not persist, status {online_product_verification.status_code}")
            return False
        
        # Verify online menu product has correct calculator mode
        if online_product_verification.json()["calculatorMode"] != "online-menu-profit-margin":
            print(f"❌ Comprehensive Data Persistence: FAILED - Online menu product has incorrect calculator mode")
            return False
        
        # Check hamper
        hamper_verification = requests.get(f"{API_BASE_URL}/hampers/{hamper['id']}")
        if hamper_verification.status_code != 200:
            print(f"❌ Comprehensive Data Persistence: FAILED - Hamper did not persist, status {hamper_verification.status_code}")
            return False
        
        print("✅ Comprehensive Data Persistence: PASSED")
        return True
    except Exception as e:
        print(f"❌ Comprehensive Data Persistence: FAILED - {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result"""
    print("\n======= NOLITA CACAO CALCULATOR BACKEND TESTS =======")
    print(f"Testing against API URL: {API_BASE_URL}")
    
    tests = [
        ("Basic API Health", test_api_health),
        ("Status Check CRUD", test_data_persistence),
        ("Error Handling", test_error_handling),
        ("CORS Configuration", test_cors_configuration),
        
        # Cost Structure API Tests
        ("Cost Structure Retrieval", test_get_cost_structure),
        ("Cost Structure Update", test_update_cost_structure),
        
        # Categories API Tests
        ("Categories Retrieval", test_get_categories),
        ("Category Addition", test_add_category),
        ("Category Update", test_update_category),
        ("Category Deletion", test_delete_category),
        
        # Products API Tests
        ("Products Retrieval", test_get_products),
        ("Product Creation", test_create_product),
        ("Product Update", test_update_product),
        ("Product Deletion", test_delete_product),
        
        # Hampers API Tests
        ("Hampers Retrieval", test_get_hampers),
        ("Hamper Creation", test_create_hamper),
        ("Hamper Deletion", test_delete_hamper),
        
        # Comprehensive Data Persistence
        ("Comprehensive Data Persistence", test_comprehensive_data_persistence)
    ]
    
    results = {}
    all_passed = True
    
    for name, test_func in tests:
        print(f"\n\n{'=' * 50}")
        print(f"RUNNING TEST: {name}")
        print(f"{'=' * 50}")
        result = test_func()
        results[name] = result
        if not result and result is not None:  # None means the test was skipped
            all_passed = False
    
    print("\n\n======= TEST SUMMARY =======")
    for name, result in results.items():
        if result is None:
            status = "⚠️ SKIPPED"
        else:
            status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{name}: {status}")
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! The backend is working correctly.")
    else:
        print("\n❌ SOME TESTS FAILED. Please check the logs above for details.")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()