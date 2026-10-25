import os
from google import genai

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

models_to_try = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image",
    "gemini-2.0-flash",
    "imagen-3.0-generate-002"
]

for m in models_to_try:
    print(f"Testing model {m}...")
    try:
        response = client.models.generate_content(
            model=m,
            contents=["A cinematic ultra-realistic 8k photo of ancient Roman temple ruins in the desert at golden hour, weathered columns, sunlight from upper right, vertical portrait 9:16"],
        )
        print(f"Model {m} response parts: {len(response.parts)}")
        for i, part in enumerate(response.parts):
            if part.inline_data:
                print(f"Found inline_data mime={part.inline_data.mime_type} length={len(part.inline_data.data)}")
                os.makedirs("public/images", exist_ok=True)
                with open("public/images/test_imagen.jpg", "wb") as f:
                    f.write(part.inline_data.data)
                print("SAVED IMAGE SUCCESSFULLY!")
                exit(0)
            elif part.text:
                print(f"Text part: {part.text[:80]}...")
    except Exception as e:
        print(f"Error with {m}:", e)
