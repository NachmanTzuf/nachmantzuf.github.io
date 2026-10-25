import os
from google import genai
from google.genai import types

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
print("API Key present:", bool(api_key))

client = genai.Client(api_key=api_key)

models = ["imagen-3.0-generate-002", "imagen-3.0-fast-generate-001", "imagen-4.0-generate-001"]

for m in models:
    print(f"Trying {m}...")
    try:
        res = client.models.generate_images(
            model=m,
            prompt="A majestic ancient Roman arch overgrown with lush green vines, ancient carved stone numerals, opening to an overgrown ruined garden sanctuary with sunlight filtering through leaves",
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="9:16",
                output_mime_type="image/jpeg",
            )
        )
        if res.generated_images:
            img = res.generated_images[0].image
            with open("public/images/test_gen_arch.jpg", "wb") as f:
                f.write(img.image_bytes)
            print(f"SUCCESS with {m}! Saved public/images/test_gen_arch.jpg (size {len(img.image_bytes)})")
            break
    except Exception as e:
        print(f"Failed {m}:", e)
