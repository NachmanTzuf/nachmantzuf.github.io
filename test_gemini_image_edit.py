import os
from google import genai
from google.genai import types
from PIL import Image

client = genai.Client()

img_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg'
pil_img = Image.open(img_path)

prompt = (
    "Modify this image: Keep the ancient stone arch, the glowing ancient Celtic numerals and runes on the arch, "
    "the sea cliffs, the ocean, and the green hills completely identical. "
    "In the foreground, adjust the round stone altar/pedestal: tilt the top surface of the round stone pedestal forward "
    "towards the viewer at an angle so that the entire circular top disc is fully visible in deep 3D perspective, "
    "with clear circular Celtic stone concentric rings and a distinct carved center point clearly visible. "
    "Move the stone pedestal slightly closer/lower in the frame, keeping it centered. "
    "Maintain the exact photographic realism, overgrown moss, cracks, and ivy."
)

print('Requesting image generation/edit...')
try:
    response = client.models.generate_content(
        model='gemini-3-pro-image',
        contents=[pil_img, prompt],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio="9:16",
            ),
        ),
    )

    out_file = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/gemini_edited_sanctuary.jpg'
    for part in response.parts:
        if part.inline_data:
            img = part.as_image()
            img.save(out_file)
            print('SUCCESS: Image saved to', out_file)
            break
except Exception as e:
    print('Error with gemini-3-pro-image:', e)
