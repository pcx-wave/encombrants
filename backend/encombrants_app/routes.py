from flask import Blueprint, jsonify, render_template
import requests

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('index.html')

@main.route('/api-test')
def api_test():
    response = requests.get('https://jsonplaceholder.typicode.com/todos/1')
    return jsonify(response.json())
