from flask import jsonify
import os
from .supabase_utils import supabase_request

def process_data(data):
    return {"processed": True, "input": data}

def create_request(data):
    try:
        # Rename keys to match Supabase schema
        request_data = {
            "client_id": data.get("clientId"),
            "status": data.get("status", "pending"),
            "waste_types": data.get("wasteType"),
            "volume": data.get("volume"),
            "weight": data.get("weight"),
            "photos": data.get("photos"),
            "location_address": data.get("location", {}).get("address"),
            "location_lat": data.get("location", {}).get("lat"),
            "location_lng": data.get("location", {}).get("lng"),
            "description": data.get("description")
        }
        response = supabase_request("POST", "requests", request_data)
        response.raise_for_status()
        return jsonify({"status": "created", "data": response.json()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_requests():
    try:
        response = supabase_request("GET", "requests")
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def submit_proposal(data):
    # Stub for proposal submission logic
    return jsonify({"status": "proposal submitted", "data": data})

def get_proposals(request_id):
    # Stub for fetching proposals for a request
    return jsonify([{"collector": "John", "price": 30, "time": "14:00"}])

def compute_route(data):
    """
    data = {
        "locations": [[lon1, lat1], [lon2, lat2], ...]
    }
    """
    ors_key = os.getenv("ORS_API_KEY")
    if not ors_key:
        return jsonify({"error": "ORS_API_KEY not configured"}), 500

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    headers = {
        "Authorization": ors_key,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": data.get("locations", []),
        "instructions": False
    }

    try:
        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()
        route_data = response.json()
        distance_km = route_data['features'][0]['properties']['summary']['distance'] / 1000
        return jsonify({
            "route": route_data,
            "distance_km": round(distance_km, 2)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def confirm_route(data):
    # Stub for confirming route
    return jsonify({"status": "route confirmed", "route_id": data.get("route_id")})

def register_deposit(data):
    # Stub for deposit registration
    return jsonify({"status": "deposit registered", "data": data})

def get_deposits():
    # Stub for getting deposits
    return jsonify([{"name": "La Ressourcerie", "location": [0.48, 47.26]}])