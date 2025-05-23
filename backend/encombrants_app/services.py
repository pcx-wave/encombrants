from flask import jsonify
import os
from .supabase_utils import supabase_request

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