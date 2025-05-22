from flask import Blueprint, request, jsonify
from .services import (
    process_data,
    create_request,
    get_requests,
    submit_proposal,
    get_proposals,
    compute_route,
    confirm_route,
    register_deposit,
    get_deposits
)

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return "Encombrants API is running."

@main.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify(data)

@main.route('/api/process', methods=['POST'])
def process():
    data = request.get_json()
    result = process_data(data)
    return jsonify(result)

@main.route('/api/requests', methods=['POST'])
def api_create_request():
    data = request.get_json()
    return create_request(data)

@main.route('/api/requests', methods=['GET'])
def api_get_requests():
    return get_requests()

@main.route('/api/proposals', methods=['POST'])
def api_submit_proposal():
    data = request.get_json()
    return submit_proposal(data)

@main.route('/api/proposals/<request_id>', methods=['GET'])
def api_get_proposals(request_id):
    return get_proposals(request_id)

@main.route('/api/compute_route', methods=['POST'])
def api_compute_route():
    data = request.get_json()
    return compute_route(data)

@main.route('/api/route/confirm', methods=['POST'])
def api_confirm_route():
    data = request.get_json()
    return confirm_route(data)

@main.route('/api/deposits/register', methods=['POST'])
def api_register_deposit():
    data = request.get_json()
    return register_deposit(data)

@main.route('/api/deposits', methods=['GET'])
def api_get_deposits():
    return get_deposits()
    
@main.route('/api/test_supabase')
def test_supabase():
    from flask import current_app
    import requests

    headers = {
        "apikey": current_app.config['SUPABASE_KEY'],
        "Authorization": f"Bearer {current_app.config['SUPABASE_KEY']}",
        "Content-Type": "application/json"
    }
    try:
        r = requests.get(
            f"{current_app.config['SUPABASE_URL']}/rest/v1/users?limit=1",
            headers=headers
        )
        r.raise_for_status()
        return jsonify(r.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

