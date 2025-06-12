from flask import Blueprint, request, jsonify, make_response
from .services import (
    process_data,
    create_request,
    get_requests,
    submit_proposal,
    get_proposals,
    accept_proposal,
    reject_proposal,
    cancel_request,
    compute_route,
    confirm_route,
    complete_route_stop,
    get_current_user_profile,
    register_deposit,
    get_deposits
)

main = Blueprint('main', __name__)

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
    return response

@main.after_request
def after_request(response):
    return add_cors_headers(response)

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

@main.route('/api/me', methods=['GET', 'OPTIONS'])
def api_get_current_user():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return get_current_user_profile()

@main.route('/api/requests', methods=['POST', 'OPTIONS'])
def api_create_request():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    return create_request(data)

@main.route('/api/requests', methods=['GET', 'OPTIONS'])
def api_get_requests():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return get_requests()

@main.route('/api/requests/<request_id>', methods=['GET', 'OPTIONS'])
def api_get_request(request_id):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return get_requests(request_id)

@main.route('/api/requests/<request_id>/cancel', methods=['PATCH', 'OPTIONS'])
def api_cancel_request(request_id):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return cancel_request(request_id)

@main.route('/api/proposals', methods=['POST', 'OPTIONS'])
def api_submit_proposal():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    return submit_proposal(data)

@main.route('/api/proposals/<request_id>', methods=['GET', 'OPTIONS'])
def api_get_proposals(request_id):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return get_proposals(request_id)

@main.route('/api/proposals/<proposal_id>/accept', methods=['POST', 'OPTIONS'])
def api_accept_proposal(proposal_id):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return accept_proposal(proposal_id)

@main.route('/api/proposals/<proposal_id>/reject', methods=['POST', 'OPTIONS'])
def api_reject_proposal(proposal_id):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return reject_proposal(proposal_id)

@main.route('/api/compute_route', methods=['POST', 'OPTIONS'])
def api_compute_route():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    return compute_route(data)

@main.route('/api/route/confirm', methods=['POST', 'OPTIONS'])
def api_confirm_route():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    return confirm_route(data)

@main.route('/api/route/stops/<stop_id>/complete', methods=['PATCH', 'OPTIONS'])
def api_complete_route_stop(stop_id):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    return complete_route_stop(stop_id)

@main.route('/api/deposits/register', methods=['POST', 'OPTIONS'])
def api_register_deposit():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    return register_deposit(data)

@main.route('/api/deposits', methods=['GET', 'OPTIONS'])
def api_get_deposits():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
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