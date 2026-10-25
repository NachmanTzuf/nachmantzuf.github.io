from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import numpy as np

# Load our glowing image
img = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_glow.jpg').convert('RGBA')
w, h = img.size # 571 x 1024

# Let's create a new canvas 571 x 1024 (or 1080 x 1920)
# We want:
# 1. Arch shifted down by ~130px (so keystone is at y = 185px, completely below the Stage 1 HUD at y = 160px)
# 2. Sky at top seamlessly filled with matching overcast misty grey clouds
# 3. Pedestal lowered so its flat circular top is at y = 740px (72% of height), right underneath harp feet!

# Let's build this step-by-step
target_h = 1024
target_w = 571

# 1. Sky extension:
# The top 50 pixels of img are pure misty sky (y=0 to y=50)
top_sky = img.crop((0, 0, w, 55))

# Create background canvas
canvas = Image.new('RGBA', (w, h), (0, 0, 0, 255))

# Fill top with gradient/mist from the top sky
for y in range(200):
    # Sample from top_sky with slight blur
    sample_y = min(y // 4, 50)
    line = img.crop((0, sample_y, w, sample_y + 1))
    canvas.paste(line.resize((w, 1)), (0, y))

# Let's paste the arch and landscape shifted down by 135px
# Scale the arch slightly down (e.g. 0.90) to simulate it being "a little bit further in the back"
arch_scale = 0.88
scaled_w = int(w * arch_scale)
scaled_h = int(h * arch_scale)
scaled_landscape = img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)

# Position scaled landscape: centered horizontally, shifted down so keystone is at y = 190
# Original keystone was at y=55. In scaled, it's at 55 * 0.88 = 48.
# To make it y = 190, offset_y = 190 - 48 = 142.
offset_x = (w - scaled_w) // 2
offset_y = 142

# Blend top of scaled landscape with sky
alpha_mask = Image.new('L', (scaled_w, scaled_h), 255)
# Gradient feather at top of landscape
draw_mask = ImageDraw.Draw(alpha_mask)
for i in range(40):
    draw_mask.line([(0, i), (scaled_w, i)], fill=int(255 * (i / 40.0)))

canvas.paste(scaled_landscape, (offset_x, offset_y), alpha_mask)

# Now for the stone pedestal:
# In the original image, the pedestal is located at x: [75, 495], y: [580, 1024]
# We want the pedestal to be closer to the viewer (slightly scaled or full size),
# and positioned lower so its circular top is at y = 735 (directly under the harp feet)!
pedestal_crop = img.crop((50, 580, 520, 1024))
pw, ph = pedestal_crop.size

# We place the pedestal so its flat top (at y=5 in the crop) sits at y = 720 on the canvas!
# Center it horizontally:
ped_x = (w - pw) // 2
ped_y = 720

# Create a smooth feather mask around the top and sides of the pedestal
ped_mask = Image.new('L', (pw, ph), 255)
p_draw = ImageDraw.Draw(ped_mask)
# Feather top edge
for i in range(25):
    p_draw.line([(0, i), (pw, i)], fill=int(255 * (i / 25.0)))
# Feather left and right edges
for i in range(20):
    p_draw.line([(i, 0), (i, ph)], fill=int(255 * (i / 20.0)))
    p_draw.line([(pw - 1 - i, 0), (pw - 1 - i, ph)], fill=int(255 * (i / 20.0)))

canvas.paste(pedestal_crop, (ped_x, ped_y), ped_mask)

# Save result
canvas.convert('RGB').save('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_recomposed.jpg', quality=95)
print("Saved test_recomposed.jpg!")
