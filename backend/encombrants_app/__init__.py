from flask import Flask
from dotenv import load_dotenv
import os



def create_app():
    load_dotenv()  # Charge les variables de .env
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_key")

    from .routes import main
    app.register_blueprint(main)

    return app