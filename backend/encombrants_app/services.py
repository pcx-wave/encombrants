```python
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
    try:
        # Validate required fields
        required_fields = ["requestId", "price", "scheduledStart", "scheduledEnd"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Validate price
        try:
            price = float(data["price"])
            if price <= 0:
                return jsonify({"error": "Price must be greater than 0"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid price value"}), 400

        # Create proposal
        proposal_data = {
            "request_id": data["requestId"],
            "collector_id": data.get("collectorId"),  # Will be set by RLS
            "price": price,
            "scheduled_start": data["scheduledStart"],
            "scheduled_end": data["scheduledEnd"],
            "status": "pending"
        }

        response = supabase_request("POST", "proposals", proposal_data)
        response.raise_for_status()
        
        return jsonify({
            "status": "created",
            "data": response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_proposals(request_id):
    try:
        response = supabase_request(
            "GET",
            "proposals",
            params={
                "select": "*,collector:collectors(*)",
                "request_id": f"eq.{request_id}"
            }
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    try:
        # Validate required fields
        required_fields = ["name", "address", "lat", "lng", "acceptedWasteTypes"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Create deposit site
        deposit_data = {
            "name": data["name"],
            "address": data["address"],
            "lat": float(data["lat"]),
            "lng": float(data["lng"]),
            "accepted_waste_types": data["acceptedWasteTypes"]
        }

        response = supabase_request("POST", "disposal_sites", deposit_data)
        response.raise_for_status()
        
        # Create deposit settings if payment is enabled
        if data.get("paymentEnabled"):
            settings_data = {
                "deposit_id": response.json()[0]["id"],
                "payment_enabled": True
            }
            settings_response = supabase_request("POST", "deposit_settings", settings_data)
            settings_response.raise_for_status()

        return jsonify({
            "status": "created",
            "data": response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_deposits():
    try:
        response = supabase_request(
            "GET",
            "disposal_sites",
            params={
                "select": "*,deposit_settings(*)"
            }
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```