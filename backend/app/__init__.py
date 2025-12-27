from flask import Flask, jsonify
from flask_cors import CORS
from .config import load_config
from .firebase import init_firebase
from .routes.health import health_bp
from .routes.itineraries import itineraries_bp
from .routes.recommendations import recommendations_bp
from .routes.auth import auth_bp
from .routes.profiles import profiles_bp
from .routes.trips import trips_bp


def create_app() -> Flask:
	app = Flask(__name__)
	config = load_config()
	app.config.update(config)

	CORS(app, resources={r"/api/*": {"origins": config.get("ALLOWED_ORIGINS", "*")}})

	# Initialize Firebase (Auth + Firestore)
	init_firebase(project_id=app.config.get("FIREBASE_PROJECT_ID") or None)

	# Register blueprints
	app.register_blueprint(health_bp, url_prefix="/api")
	app.register_blueprint(itineraries_bp, url_prefix="/api")
	app.register_blueprint(recommendations_bp, url_prefix="/api")
	app.register_blueprint(booking_bp, url_prefix="/api")
	app.register_blueprint(auth_bp, url_prefix="/api")
	app.register_blueprint(profiles_bp, url_prefix="/api")
	app.register_blueprint(trips_bp, url_prefix="/api")

	@app.errorhandler(404)
	def not_found(_: Exception):
		return jsonify({"error": "Not Found"}), 404

	return app


