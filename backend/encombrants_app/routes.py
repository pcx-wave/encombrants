from flask import Blueprint, request, jsonify, make_response
from .services import (
    process_data,
    create_request,
    get_requests,
    get_request_by_id,
    submit_proposal,
    get_proposals,
    accept_proposal,
    reject_proposal,
    cancel_request,
    compute_route,
    confirm_route,
    complete_route_stop,
    get_current_user_profile,
    update_user_profile,
    get_collector_profile,
    update_collector_profile,
    create_payment_intent,
    confirm_payment,
    register_deposit,
    get_deposits
)
from .supabase_utils import require_auth

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
@require_auth
def api_get_current_user(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return get_current_user_profile(jwt_token, user_data)

@main.route('/api/me', methods=['PATCH', 'OPTIONS'])
@require_auth
def api_update_user_profile(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return update_user_profile(data, jwt_token, user_data)

@main.route('/api/collector/profile', methods=['GET', 'OPTIONS'])
@require_auth
def api_get_collector_profile(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return get_collector_profile(jwt_token, user_data)

@main.route('/api/collector/profile', methods=['PATCH', 'OPTIONS'])
@require_auth
def api_update_collector_profile(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return update_collector_profile(data, jwt_token, user_data)

@main.route('/api/requests', methods=['POST', 'OPTIONS'])
@require_auth
def api_create_request(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return create_request(data, jwt_token, user_data)

@main.route('/api/requests', methods=['GET', 'OPTIONS'])
@require_auth
def api_get_requests(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return get_requests(jwt_token, user_data)

@main.route('/api/requests/<request_id>', methods=['GET', 'OPTIONS'])
@require_auth
def api_get_request(request_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return get_request_by_id(request_id, jwt_token, user_data)

@main.route('/api/requests/<request_id>/cancel', methods=['PATCH', 'OPTIONS'])
@require_auth
def api_cancel_request(request_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return cancel_request(request_id, jwt_token, user_data)

@main.route('/api/proposals', methods=['POST', 'OPTIONS'])
@require_auth
def api_submit_proposal(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return submit_proposal(data, jwt_token, user_data)

@main.route('/api/proposals/<request_id>', methods=['GET', 'OPTIONS'])
@require_auth
def api_get_proposals(request_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return get_proposals(request_id, jwt_token, user_data)

@main.route('/api/proposals/<proposal_id>/accept', methods=['POST', 'OPTIONS'])
@require_auth
def api_accept_proposal(proposal_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return accept_proposal(proposal_id, jwt_token, user_data)

@main.route('/api/proposals/<proposal_id>/reject', methods=['POST', 'OPTIONS'])
@require_auth
def api_reject_proposal(proposal_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return reject_proposal(proposal_id, jwt_token, user_data)

@main.route('/api/proposals/<proposal_id>/payment-intent', methods=['POST', 'OPTIONS'])
@require_auth
def api_create_payment_intent(proposal_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return create_payment_intent(proposal_id, jwt_token, user_data)

@main.route('/api/proposals/<proposal_id>/confirm-payment', methods=['POST', 'OPTIONS'])
@require_auth
def api_confirm_payment(proposal_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    payment_intent_id = data.get('payment_intent_id')
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return confirm_payment(proposal_id, payment_intent_id, jwt_token, user_data)

@main.route('/api/compute_route', methods=['POST', 'OPTIONS'])
@require_auth
def api_compute_route(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return compute_route(data, jwt_token, user_data)

@main.route('/api/route/confirm', methods=['POST', 'OPTIONS'])
@require_auth
def api_confirm_route(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return confirm_route(data, jwt_token, user_data)

@main.route('/api/route/stops/<stop_id>/complete', methods=['PATCH', 'OPTIONS'])
@require_auth
def api_complete_route_stop(stop_id, **kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return complete_route_stop(stop_id, jwt_token, user_data)

@main.route('/api/deposits/register', methods=['POST', 'OPTIONS'])
@require_auth
def api_register_deposit(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    data = request.get_json()
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return register_deposit(data, jwt_token, user_data)

@main.route('/api/deposits', methods=['GET', 'OPTIONS'])
@require_auth
def api_get_deposits(**kwargs):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    jwt_token = kwargs.get('jwt_token')
    user_data = kwargs.get('user_data')
    return get_deposits(jwt_token, user_data)
    
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