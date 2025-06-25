import os
import requests
import jwt
from flask import request, jsonify

def supabase_request(method, endpoint, data=None, params=None, jwt_token=None):
    """
    Make a request to Supabase with optional JWT authentication
    """
    base_url = os.getenv("VITE_SUPABASE_ENCOMBRANTS_URL")
    api_key = os.getenv("VITE_SUPABASE_ENCOMBRANTS_KEY") #utiliser anon key

    if not base_url or not api_key:
        raise ValueError("Supabase URL or API key not configured.")

    url = f"{base_url}/rest/v1/{endpoint}"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {jwt_token}",  # <== TOUJOURS le token utilisateur ici
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    print("===== Appel à Supabase =====")
    print("Endpoint:", endpoint)
    print("Headers envoyés:", headers)
    print("Params:", params)

    # If JWT token is provided, use it for authentication
    # This allows Supabase RLS policies to work correctly
#    if jwt_token:
#        headers["Authorization"] = f"Bearer {jwt_token}"
#    else:
#        headers["Authorization"] = f"Bearer {api_key}"

    return requests.request(method, url, headers=headers, json=data, params=params)

def extract_jwt_token():
    """
    Extract JWT token from Authorization header
    Returns the token or raises an error if not found/invalid
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise ValueError("Authorization header required")
    
    if not auth_header.startswith('Bearer '):
        raise ValueError("Authorization header must start with 'Bearer '")
    
    token = auth_header.split(' ')[1]
    if not token:
        raise ValueError("JWT token not found in Authorization header")
    
    return token

def verify_jwt_token(token):
    """
    Verify JWT token with Supabase
    Returns user data if valid, raises error if invalid
    """
    try:
        # For Supabase JWT verification, we can decode without verification
        # since Supabase will validate it when we make requests
        # In production, you might want to verify the signature
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid JWT token: {str(e)}")

def require_auth(f):
    """
    Decorator to require authentication for API endpoints
    """
    def decorated_function(*args, **kwargs):
        try:
            token = extract_jwt_token()
            user_data = verify_jwt_token(token)
            # Add token and user data to kwargs so the function can use them
            kwargs['jwt_token'] = token
            kwargs['user_data'] = user_data
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({"error": str(e)}), 401
        except Exception as e:
            return jsonify({"error": "Authentication failed"}), 401
    
    decorated_function.__name__ = f.__name__
    return decorated_function
