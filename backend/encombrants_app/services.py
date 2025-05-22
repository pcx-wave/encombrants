from flask import jsonify
import os
from .supabase_utils import supabase_request

def process_data(data):
    return {"processed": True, "input": data}

def create_request(data):
    try:
        # Normalize the data to match Supabase schema
        request_data = {
            "client_id": data.get("clientId"),
            "status": "pending",
            "waste_types": data.get("wasteType", []),
            "volume": float(data.get("volume", 0)),
            "weight": float(data.get("weight", 0)) if data.get("weight") else None,
            "photos": data.get("photos", []),
            "location_address": data.get("location", {}).get("address"),
            "location_lat": float(data.get("location", {}).get("lat", 0)),
            "location_lng": float(data.get("location", {}).get("lng", 0)),
            "description": data.get("description")
        }

        # Validate required fields
        required_fields = ["client_id", "waste_types", "volume", "location_address", "location_lat", "location_lng"]
        missing_fields = [field for field in required_fields if not request_data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        response = supabase_request("POST", "requests", request_data)
        response.raise_for_status()
        
        # Create availability windows
        if data.get("availabilityWindows"):
            for window in data["availabilityWindows"]:
                window_data = {
                    "request_id": response.json()[0]["id"],
                    "start_time": window["start"],
                    "end_time": window["end"]
                }
                window_response = supabase_request("POST", "availability_windows", window_data)
                window_response.raise_for_status()

        return jsonify({
            "status": "created",
            "data": response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_requests():
    try:
        response = supabase_request(
            "GET",
            "requests",
            params={
                "select": "*,availability_windows(*)"
            }
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def submit_proposal(data):
    try:
        proposal_data = {
            "request_id": data.get("requestId"),
            "collector_id": data.get("collectorId"),
            "price": float(data.get("price", 0)),
            "scheduled_start": data.get("scheduledTime", {}).get("start"),
            "scheduled_end": data.get("scheduledTime", {}).get("end"),
            "status": "pending"
        }

        # Validate required fields
        required_fields = ["request_id", "collector_id", "price", "scheduled_start", "scheduled_end"]
        missing_fields = [field for field in required_fields if not proposal_data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

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
                "select": "*,collectors(*)",
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
    try:
        route_data = {
            "collector_id": data.get("collectorId"),
            "disposal_site_id": data.get("disposalSiteId"),
            "distance": float(data.get("distance", 0)),
            "duration": int(data.get("duration", 0)),
            "start_time": data.get("startTime"),
            "end_time": data.get("endTime"),
            "status": "scheduled"
        }

        # Validate required fields
        required_fields = ["collector_id", "disposal_site_id", "start_time", "end_time"]
        missing_fields = [field for field in required_fields if not route_data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Create route
        route_response = supabase_request("POST", "routes", route_data)
        route_response.raise_for_status()
        route_id = route_response.json()[0]["id"]

        # Create route stops
        for stop in data.get("stops", []):
            stop_data = {
                "route_id": route_id,
                "request_id": stop["requestId"],
                "stop_order": stop["order"],
                "estimated_arrival": stop["estimatedArrival"],
                "status": "pending"
            }
            stop_response = supabase_request("POST", "route_stops", stop_data)
            stop_response.raise_for_status()

        return jsonify({
            "status": "created",
            "data": route_response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def register_deposit(data):
    try:
        deposit_data = {
            "name": data.get("name"),
            "address": data.get("address"),
            "lat": float(data.get("lat", 0)),
            "lng": float(data.get("lng", 0)),
            "accepted_waste_types": data.get("acceptedWasteTypes", [])
        }

        # Validate required fields
        required_fields = ["name", "address", "lat", "lng", "accepted_waste_types"]
        missing_fields = [field for field in required_fields if not deposit_data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        response = supabase_request("POST", "disposal_sites", deposit_data)
        response.raise_for_status()
        
        return jsonify({
            "status": "created",
            "data": response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_deposits():
    try:
        response = supabase_request("GET", "disposal_sites")
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500