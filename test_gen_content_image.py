import os
from google import genai
from google.genai import types

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

# Let's list available models that might generate images
try:
    models = list(client.models.list())
    print("Found", len(models), "models.")
    image_models = [m.name for m in models if "image" in m.name.lower() or "imagen" in m.name.lower()]
    print("Image/Imagen models:", image_models)
except Exception as e:
    print("Error listing models:", e)

test_models = [
    "imagen-3.0-generate-002",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-lite-image"
]

for m in test_models:
    print(f"Testing generate_content with {m}...")
    try:
        res = client.models.generate_content(
            model=m,
            contents="A cinematic photo of an ancient Roman arch overgrown with vines",
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            )
        )
        print("Success! Parts:", len(res.parts))
        for p in res.parts:
            if p.inline_data:
                print("Got inline_data length:", len(p.inline_data.data))
                with open("public/images/test_gen.jpg", "wb") as f:
                    f.write(p.inline_data.data)
                print("Saved image!")
                break
        break
    except Exception as e:
        print(f"Failed {m}:", e)
