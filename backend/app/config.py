import os
from dotenv import load_dotenv


def load_config():
	# Try .env first; fall back to env.example naming if needed
	load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
	load_dotenv(os.path.join(os.path.dirname(__file__), "..", "env"))
	return {
		"SECRET_KEY": os.getenv("SECRET_KEY", "dev"),
		"HUGGINGFACE_MODEL": os.getenv("HUGGINGFACE_MODEL", "sshleifer/tiny-distilroberta-base"),
		"FIREBASE_PROJECT_ID": os.getenv("FIREBASE_PROJECT_ID", ""),
		"GOOGLE_APPLICATION_CREDENTIALS": os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		"ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS", "*"),
	}


