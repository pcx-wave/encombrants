from flask import jsonify

def process_data(data):
    return {"processed": True, "input": data}

def create_request(data):
    # Stub for request creation logic
    return jsonify({"status": "request created", "data": data})

def get_requests():
    # Stub for fetching requests
    return jsonify([{"id": 1, "type": "meuble", "volume": 2.5}])

def submit_proposal(data):
    # Stub for proposal submission logic
    return jsonify({"status": "proposal submitted", "data": data})

def get_proposals(request_id):
    # Stub for fetching proposals for a request
    return jsonify([{"collector": "John", "price": 30, "time": "14:00"}])

def compute_route(data):
    # Stub for route computation
    return jsonify({"route": ["pointA", "pointB"], "distance_km": 12.5})

def confirm_route(data):
    # Stub for confirming route
    return jsonify({"status": "route confirmed", "route_id": data.get("route_id")})

def register_deposit(data):
    # Stub for deposit registration
    return jsonify({"status": "deposit registered", "data": data})

def get_deposits():
    # Stub for getting deposits
    return jsonify([{"name": "La Ressourcerie", "location": [0.48, 47.26]}])