import os
import sys
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable is not set.")
    print("Set it and rerun. Example (PowerShell):")
    print("  $env:GEMINI_API_KEY = 'YOUR_KEY_HERE'")
    sys.exit(1)

genai.configure(api_key=api_key)
for model in genai.list_models():
    print(model)