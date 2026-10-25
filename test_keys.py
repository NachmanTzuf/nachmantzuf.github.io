import os
from google import genai

gemini_key = os.environ.get("GEMINI_API_KEY")
print("GEMINI_API_KEY starts with:", gemini_key[:8] if gemini_key else "None")
google_key = os.environ.get("GOOGLE_API_KEY")
print("GOOGLE_API_KEY starts with:", google_key[:8] if google_key else "None")

if gemini_key:
    client = genai.Client(api_key=gemini_key)
    try:
        models = list(client.models.list())
        print("Success with GEMINI_API_KEY! Model count:", len(models))
        image_models = [m.name for m in models if "image" in m.name.lower() or "imagen" in m.name.lower()]
        print("Image/Imagen models:", image_models)
    except Exception as e:
        print("Failed with GEMINI_API_KEY:", e)
