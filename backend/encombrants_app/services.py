from flask import jsonify
import os
import requests
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
    Compute an optimized route for the given request IDs using OpenRouteService
    """
    try:
        request_ids = data.get("requestIds", [])
        if not request_ids:
            return jsonify({"error": "No request IDs provided"}), 400

        # Fetch request locations from database
        locations_response = supabase_request(
            "GET",
            "requests",
            params={
                "select": "id,location_lat,location_lng",
                "id": f"in.({','.join(request_ids)})"
            }
        )
        locations_response.raise_for_status()
        requests = locations_response.json()

        # Extract coordinates for ORS API
        coordinates = [[req["location_lng"], req["location_lat"]] for req in requests]

        # Call OpenRouteService API
        ors_key = os.getenv("ORS_API_KEY")
        if not ors_key:
            return jsonify({"error": "ORS_API_KEY not configured"}), 500

        url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
        headers = {
            "Authorization": ors_key,
            "Content-Type": "application/json"
        }

        body = {
            "coordinates": coordinates,
            "instructions": True,
            "preference": "recommended",
            "units": "km"
        }

        ors_response = requests.post(url, headers=headers, json=body)
        ors_response.raise_for_status()
        route_data = ors_response.json()

        # Extract relevant data from ORS response
        total_distance = route_data['features'][0]['properties']['summary']['distance'] / 1000  # Convert to km
        total_duration = route_data['features'][0]['properties']['summary']['duration'] / 60    # Convert to minutes

        # Create route in database
        route_data = {
            "collector_id": data.get("collectorId"),  # Will be set by RLS
            "disposal_site_id": "00000000-0000-0000-0000-000000000001",  # TODO: Find best disposal site
            "distance": round(total_distance, 1),
            "duration": round(total_duration),
            "start_time": data.get("startTime"),
            "end_time": data.get("startTime"),  # TODO: Calculate proper end time
            "status": "scheduled"
        }

        route_response = supabase_request("POST", "routes", route_data)
        route_response.raise_for_status()
        route = route_response.json()[0]

        # Create route stops
        stops_data = []
        for i, request_id in enumerate(request_ids):
            stops_data.append({
                "route_id": route["id"],
                "request_id": request_id,
                "stop_order": i + 1,
                "estimated_arrival": data.get("startTime"),  # TODO: Calculate proper arrival times
                "status": "pending"
            })

        stops_response = supabase_request("POST", "route_stops", stops_data)
        stops_response.raise_for_status()

        return jsonify({
            "route": route,
            "stops": stops_response.json(),
            "path": route_data['features'][0]['geometry']
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def confirm_route(data):
    try:
        route_id = data.get("route_id")
        if not route_id:
            return jsonify({"error": "Route ID is required"}), 400

        # Update route status
        response = supabase_request(
            "PATCH",
            f"routes?id=eq.{route_id}",
            {"status": "in_progress"}
        )
        response.raise_for_status()

        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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