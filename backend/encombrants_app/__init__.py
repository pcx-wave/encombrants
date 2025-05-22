from flask import Flask
from dotenv import load_dotenv
import os
import requests

from flask_cors import CORS
CORS(app)


def create_app():
    load_dotenv()  # Charge les variables de .env
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_key")
    app.config['SUPABASE_URL'] = os.getenv("VITE_SUPABASE_URL")
    app.config['SUPABASE_KEY'] = os.getenv("VITE_SUPABASE_ANON_KEY")

    from .routes import main
    app.register_blueprint(main)

    return app