from flask import jsonify, request
import os
import requests
from .supabase_utils import supabase_request

def process_data(data):
    return {"processed": True, "input": data}

def get_current_user_profile(jwt_token, user_data):
    """Get current authenticated user profile"""
    try:
        user_id = user_data.get('sub')
        if not user_id:
            return jsonify({"error": "Invalid user token"}), 401
        
        # Fetch user profile from Supabase using authenticated request
        response = supabase_request(
            "GET", 
            "users",
            params={"select": "*", "id": f"eq.{user_id}"},
            jwt_token=jwt_token
        )
        response.raise_for_status()
        users = response.json()
        
        if not users:
            return jsonify({"error": "User profile not found"}), 404
        
        user = users[0]
        return jsonify({
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "type": user["type"],
            "phone": user.get("phone"),
            "address": user.get("address"),
            "created_at": user["created_at"]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_best_disposal_site(waste_types, last_location_lat, last_location_lng, jwt_token):
    """Find the best disposal site based on waste types and location"""
    try:
        # Get all disposal sites
        response = supabase_request("GET", "disposal_sites", jwt_token=jwt_token)
        response.raise_for_status()
        sites = response.json()
        
        # Filter sites that accept all waste types
        compatible_sites = []
        for site in sites:
            if all(waste_type in site['accepted_waste_types'] for waste_type in waste_types):
                compatible_sites.append(site)
        
        if not compatible_sites:
            # Return first site as fallback
            return sites[0] if sites else None
        
        # Calculate distance to each compatible site (simplified Euclidean distance)
        def calculate_distance(lat1, lng1, lat2, lng2):
            return ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2) ** 0.5
        
        best_site = compatible_sites[0]
        min_distance = calculate_distance(
            last_location_lat, last_location_lng,
            best_site['lat'], best_site['lng']
        )
        
        for site in compatible_sites[1:]:
            distance = calculate_distance(
                last_location_lat, last_location_lng,
                site['lat'], site['lng']
            )
            if distance < min_distance:
                min_distance = distance
                best_site = site
        
        return best_site
        
    except Exception as e:
        print(f"Error finding best disposal site: {e}")
        return None

def create_request(data, jwt_token, user_data):
    try:
        user_id = user_data.get('sub')
        if not user_id:
            return jsonify({"error": "Invalid user token"}), 401
        
        # Rename keys to match Supabase schema
        request_data = {
            "client_id": user_id,  # Use authenticated user ID
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
        
        response = supabase_request("POST", "requests", request_data, jwt_token=jwt_token)
        response.raise_for_status()
        request_result = response.json()[0]
        
        # Create availability windows
        availability_windows = data.get("availabilityWindows", [])
        for window in availability_windows:
            window_data = {
                "request_id": request_result["id"],
                "start_time": window["start"],
                "end_time": window["end"]
            }
            supabase_request("POST", "availability_windows", window_data, jwt_token=jwt_token)
        
        return jsonify({"status": "created", "data": request_result}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_requests(jwt_token, user_data):
    try:
        # Get all requests with availability windows
        response = supabase_request(
            "GET", 
            "requests",
            params={"select": "*,availability_windows(*)"},
            jwt_token=jwt_token
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_request_by_id(request_id, jwt_token, user_data):
    try:
        # Get specific request with availability windows
        response = supabase_request(
            "GET", 
            "requests",
            params={
                "select": "*,availability_windows(*)",
                "id": f"eq.{request_id}"
            },
            jwt_token=jwt_token
        )
        response.raise_for_status()
        requests_data = response.json()
        if requests_data:
            return jsonify(requests_data[0]), 200
        else:
            return jsonify({"error": "Request not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def cancel_request(request_id, jwt_token, user_data):
    try:
        response = supabase_request(
            "PATCH",
            f"requests?id=eq.{request_id}",
            {"status": "cancelled"},
            jwt_token=jwt_token
        )
        response.raise_for_status()
        return jsonify({"status": "cancelled"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def submit_proposal(data, jwt_token, user_data):
    try:
        user_id = user_data.get('sub')
        if not user_id:
            return jsonify({"error": "Invalid user token"}), 401
        
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
            "collector_id": user_id,  # Use authenticated user ID
            "price": price,
            "scheduled_start": data["scheduledStart"],
            "scheduled_end": data["scheduledEnd"],
            "status": "pending"
        }

        response = supabase_request("POST", "proposals", proposal_data, jwt_token=jwt_token)
        response.raise_for_status()
        
        return jsonify({
            "status": "created",
            "data": response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_proposals(request_id, jwt_token, user_data):
    try:
        response = supabase_request(
            "GET",
            "proposals",
            params={
                "select": "*,collector:collectors(*)",
                "request_id": f"eq.{request_id}"
            },
            jwt_token=jwt_token
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def accept_proposal(proposal_id, jwt_token, user_data):
    try:
        # Update proposal status to accepted
        response = supabase_request(
            "PATCH",
            f"proposals?id=eq.{proposal_id}",
            {"status": "accepted"},
            jwt_token=jwt_token
        )
        response.raise_for_status()
        
        # Get the proposal to find the request_id
        proposal_response = supabase_request(
            "GET",
            "proposals",
            params={
                "select": "request_id",
                "id": f"eq.{proposal_id}"
            },
            jwt_token=jwt_token
        )
        proposal_response.raise_for_status()
        proposal_data = proposal_response.json()
        
        if proposal_data:
            request_id = proposal_data[0]["request_id"]
            
            # Update request status to matched
            supabase_request(
                "PATCH",
                f"requests?id=eq.{request_id}",
                {"status": "matched"},
                jwt_token=jwt_token
            )
            
            # Reject all other proposals for this request
            supabase_request(
                "PATCH",
                f"proposals?request_id=eq.{request_id}&id=neq.{proposal_id}",
                {"status": "rejected"},
                jwt_token=jwt_token
            )
        
        return jsonify({"status": "accepted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def reject_proposal(proposal_id, jwt_token, user_data):
    try:
        response = supabase_request(
            "PATCH",
            f"proposals?id=eq.{proposal_id}",
            {"status": "rejected"},
            jwt_token=jwt_token
        )
        response.raise_for_status()
        return jsonify({"status": "rejected"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def compute_route(data, jwt_token, user_data):
    """
    Compute an optimized route for the given request IDs using OpenRouteService
    """
    try:
        user_id = user_data.get('sub')
        if not user_id:
            return jsonify({"error": "Invalid user token"}), 401
        
        request_ids = data.get("requestIds", [])
        if not request_ids:
            return jsonify({"error": "No request IDs provided"}), 400

        # Fetch request locations from database
        locations_response = supabase_request(
            "GET",
            "requests",
            params={
                "select": "id,location_lat,location_lng,waste_types",
                "id": f"in.({','.join(request_ids)})"
            },
            jwt_token=jwt_token
        )
        locations_response.raise_for_status()
        requests = locations_response.json()

        if not requests:
            return jsonify({"error": "No valid requests found"}), 400

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

        # Get all waste types from requests
        all_waste_types = []
        for req in requests:
            all_waste_types.extend(req["waste_types"])
        unique_waste_types = list(set(all_waste_types))

        # Find best disposal site
        last_request = requests[-1]
        best_disposal_site = get_best_disposal_site(
            unique_waste_types,
            last_request["location_lat"],
            last_request["location_lng"],
            jwt_token
        )

        if not best_disposal_site:
            return jsonify({"error": "No suitable disposal site found"}), 400

        # Create route in database
        route_data_db = {
            "collector_id": user_id,  # Use authenticated user ID
            "disposal_site_id": best_disposal_site["id"],
            "distance": round(total_distance, 1),
            "duration": round(total_duration),
            "start_time": data.get("startTime"),
            "end_time": data.get("startTime"),  # TODO: Calculate proper end time
            "status": "scheduled"
        }

        route_response = supabase_request("POST", "routes", route_data_db, jwt_token=jwt_token)
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

        stops_response = supabase_request("POST", "route_stops", stops_data, jwt_token=jwt_token)
        stops_response.raise_for_status()

        return jsonify({
            "route": route,
            "stops": stops_response.json(),
            "path": route_data['features'][0]['geometry'],
            "disposal_site": best_disposal_site
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def confirm_route(data, jwt_token, user_data):
    try:
        route_id = data.get("route_id")
        if not route_id:
            return jsonify({"error": "Route ID is required"}), 400

        # Update route status
        response = supabase_request(
            "PATCH",
            f"routes?id=eq.{route_id}",
            {"status": "in_progress"},
            jwt_token=jwt_token
        )
        response.raise_for_status()

        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def complete_route_stop(stop_id, jwt_token, user_data):
    try:
        # Update route stop status
        response = supabase_request(
            "PATCH",
            f"route_stops?id=eq.{stop_id}",
            {"status": "completed"},
            jwt_token=jwt_token
        )
        response.raise_for_status()

        # Get the route_id to check if all stops are completed
        stop_response = supabase_request(
            "GET",
            "route_stops",
            params={
                "select": "route_id",
                "id": f"eq.{stop_id}"
            },
            jwt_token=jwt_token
        )
        stop_response.raise_for_status()
        stop_data = stop_response.json()

        if stop_data:
            route_id = stop_data[0]["route_id"]
            
            # Check if all stops in this route are completed or skipped
            all_stops_response = supabase_request(
                "GET",
                "route_stops",
                params={
                    "select": "status",
                    "route_id": f"eq.{route_id}"
                },
                jwt_token=jwt_token
            )
            all_stops_response.raise_for_status()
            all_stops = all_stops_response.json()
            
            # If all stops are completed or skipped, mark route as completed
            if all(stop["status"] in ["completed", "skipped"] for stop in all_stops):
                supabase_request(
                    "PATCH",
                    f"routes?id=eq.{route_id}",
                    {"status": "completed"},
                    jwt_token=jwt_token
                )

        return jsonify({"status": "completed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def register_deposit(data, jwt_token, user_data):
    try:
        user_id = user_data.get('sub')
        if not user_id:
            return jsonify({"error": "Invalid user token"}), 401
        
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

        response = supabase_request("POST", "disposal_sites", deposit_data, jwt_token=jwt_token)
        response.raise_for_status()
        
        # Create deposit settings if payment is enabled
        if data.get("paymentEnabled"):
            settings_data = {
                "deposit_id": user_id,  # Use authenticated user ID
                "payment_enabled": True
            }
            settings_response = supabase_request("POST", "deposit_settings", settings_data, jwt_token=jwt_token)
            settings_response.raise_for_status()

        return jsonify({
            "status": "created",
            "data": response.json()[0]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_deposits(jwt_token, user_data):
    try:
        response = supabase_request(
            "GET",
            "disposal_sites",
            params={
                "select": "*,deposit_settings(*)"
            },
            jwt_token=jwt_token
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500