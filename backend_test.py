#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://cfc593e8-afc2-4477-a5b1-d21c4cbc9ec6.preview.emergentagent.com"
API_BASE_URL = f"{BACKEND_URL}/api"

def test_api_health():
    """Test the basic API health endpoint"""
    print("\n=== Testing Basic API Health ===")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert response.json() == {"message": "Hello World"}, "Unexpected response content"
        
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

def run_all_tests():
    """Run all tests and return overall result"""
    print("\n======= NOLITA CACAO CALCULATOR BACKEND TESTS =======")
    print(f"Testing against API URL: {API_BASE_URL}")
    
    tests = [
        ("Basic API Health", test_api_health),
        ("Status Check CRUD", test_data_persistence),
        ("Error Handling", test_error_handling),
        ("CORS Configuration", test_cors_configuration)
    ]
    
    results = {}
    all_passed = True
    
    for name, test_func in tests:
        print(f"\n\n{'=' * 50}")
        print(f"RUNNING TEST: {name}")
        print(f"{'=' * 50}")
        result = test_func()
        results[name] = result
        if not result:
            all_passed = False
    
    print("\n\n======= TEST SUMMARY =======")
    for name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{name}: {status}")
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! The backend is working correctly.")
    else:
        print("\n❌ SOME TESTS FAILED. Please check the logs above for details.")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()