"""
BLENDER 5.2 PROCEDURAL ROMAN SANCTUARY ENGINE
Generates an ultra-cinematic, photorealistic vertical mobile (9:16) background:
  - Grand Roman Arch with carved Roman numerals (I - VIII) and ancient epigraphy
  - Overgrown with lush, deep emerald green climbing ivy vines and hanging foliage
  - Ruined open-air room with stone flagstone floor and mossy cracks
  - Beyond the arch: open lush green Mediterranean forest, rolling hills, and morning sky
  - In the center: a chunky, weathered round Roman stone pedestal with moss and vines
  - Fragmented, soft dappled morning sunlight filtering through leaves from the upper right
"""

import bpy
import math
import os
import random

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # Ensure a clean scene exists
    if not bpy.data.scenes:
        bpy.data.scenes.new("Scene")
    scene = bpy.context.scene
    return scene

def create_stone_material(name, base_color=(0.58, 0.52, 0.44, 1.0), roughness=0.88, bump_strength=0.15):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = 0.04

    # Add procedural noise for weathered stone texture
    tex_noise = nodes.new(type='ShaderNodeTexNoise')
    tex_noise.inputs['Scale'].default_value = 18.0
    tex_noise.inputs['Detail'].default_value = 8.0
    tex_noise.inputs['Roughness'].default_value = 0.7

    color_ramp = nodes.new(type='ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.3
    color_ramp.color_ramp.elements[0].color = (base_color[0] * 0.75, base_color[1] * 0.75, base_color[2] * 0.70, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.7
    color_ramp.color_ramp.elements[1].color = (base_color[0] * 1.15, base_color[1] * 1.12, base_color[2] * 1.05, 1.0)

    bump = nodes.new(type='ShaderNodeBump')
    bump.inputs['Strength'].default_value = bump_strength

    links.new(tex_noise.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(tex_noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat

def create_vine_leaf_material():
    mat = bpy.data.materials.new(name="Emerald_Ivy_Leaves")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    # Rich deep emerald green
    bsdf.inputs['Base Color'].default_value = (0.045, 0.24, 0.065, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.42
    if 'Subsurface Weight' in bsdf.inputs:
        bsdf.inputs['Subsurface Weight'].default_value = 0.35
        bsdf.inputs['Subsurface Radius'].default_value = (0.2, 0.5, 0.1)

    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat

def create_moss_material():
    mat = bpy.data.materials.new(name="Green_Moss_Stone")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.08, 0.28, 0.09, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.95
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat

def build_scene():
    scene = reset_scene()

    # Materials
    travertine_mat = create_stone_material("Roman_Travertine", (0.58, 0.54, 0.46, 1.0), roughness=0.85, bump_strength=0.18)
    dark_stone_mat = create_stone_material("Dark_Sanctuary_Stone", (0.35, 0.32, 0.28, 1.0), roughness=0.90, bump_strength=0.22)
    leaf_mat = create_vine_leaf_material()
    moss_mat = create_moss_material()

    # 1. Flagstone Floor
    bpy.ops.mesh.primitive_cylinder_add(radius=5.5, depth=0.2, vertices=48, location=(0, 0, -0.1))
    floor = bpy.context.active_object
    floor.name = "Sanctuary_Floor"
    floor.data.materials.append(dark_stone_mat)

    # Add moss patches on floor
    for i in range(16):
        ang = random.uniform(0, math.pi * 2)
        dist = random.uniform(1.2, 4.0)
        sx = random.uniform(0.3, 0.9)
        sy = random.uniform(0.3, 0.8)
        bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=0.01, vertices=16, location=(math.cos(ang)*dist, math.sin(ang)*dist, 0.005))
        moss_patch = bpy.context.active_object
        moss_patch.scale = (sx, sy, 1.0)
        moss_patch.data.materials.append(moss_mat)

    # 2. Chunky Central Pedestal ("big chunky sort of like a pedestal... Round one, very nice with from old stones with also greenery")
    # Base foundation block
    bpy.ops.mesh.primitive_cylinder_add(radius=0.92, depth=0.16, vertices=48, location=(0, 0, 0.08))
    ped_base = bpy.context.active_object
    ped_base.name = "Chunky_Pedestal_Base"
    ped_base.data.materials.append(dark_stone_mat)

    # Carved middle drum
    bpy.ops.mesh.primitive_cylinder_add(radius=0.76, depth=0.24, vertices=48, location=(0, 0, 0.28))
    ped_mid = bpy.context.active_object
    ped_mid.name = "Chunky_Pedestal_Drum"
    ped_mid.data.materials.append(travertine_mat)

    # Top stone platform
    bpy.ops.mesh.primitive_cylinder_add(radius=0.68, depth=0.10, vertices=48, location=(0, 0, 0.45))
    ped_top = bpy.context.active_object
    ped_top.name = "Chunky_Pedestal_Top"
    ped_top.data.materials.append(travertine_mat)

    # Pedestal moss ring & clinging vines
    for i in range(12):
        a = (i / 12) * math.pi * 2
        vx = math.cos(a) * 0.82
        vy = math.sin(a) * 0.82
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=0.35, vertices=8, location=(vx, vy, 0.24))
        vine = bpy.context.active_object
        vine.rotation_euler = (random.uniform(-0.15, 0.15), random.uniform(-0.15, 0.15), random.uniform(0, 3.14))
        vine.data.materials.append(leaf_mat)

    # 3. Grand Roman Arch
    # Left Column
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=3.8, vertices=32, location=(-1.95, 0.8, 1.9))
    col_l = bpy.context.active_object
    col_l.name = "Roman_Column_Left"
    col_l.data.materials.append(travertine_mat)

    # Right Column
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=3.8, vertices=32, location=(1.95, 0.8, 1.9))
    col_r = bpy.context.active_object
    col_r.name = "Roman_Column_Right"
    col_r.data.materials.append(travertine_mat)

    # Column Bases & Capitals
    for side, cx in [('L', -1.95), ('R', 1.95)]:
        # Base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.52, depth=0.35, vertices=32, location=(cx, 0.8, 0.17))
        b = bpy.context.active_object
        b.data.materials.append(travertine_mat)
        # Capital
        bpy.ops.mesh.primitive_cylinder_add(radius=0.52, depth=0.35, vertices=32, location=(cx, 0.8, 3.7))
        c = bpy.context.active_object
        c.data.materials.append(travertine_mat)

    # Semicircular Roman Arch Rib (Voussoir segments)
    arch_radius = 1.95
    arch_center_z = 3.7
    segments = 15
    for s in range(segments):
        t1 = (s / segments) * math.pi
        t2 = ((s + 1) / segments) * math.pi
        t_mid = (t1 + t2) / 2
        ax = math.cos(math.pi - t_mid) * arch_radius
        az = arch_center_z + math.sin(t_mid) * arch_radius
        rot_y = (math.pi / 2) - t_mid

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(ax, 0.8, az))
        arch_block = bpy.context.active_object
        arch_block.scale = (0.42, 0.55, 0.48)
        arch_block.rotation_euler = (0, rot_y, 0)
        arch_block.data.materials.append(travertine_mat)

    # Keystone at top center
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.8, arch_center_z + arch_radius + 0.12))
    keystone = bpy.context.active_object
    keystone.scale = (0.54, 0.62, 0.58)
    keystone.data.materials.append(travertine_mat)

    # Arch Entablature / Frieze with Roman Numerals (Text)
    bpy.ops.object.text_add(location=(-1.65, 0.50, arch_center_z + arch_radius + 0.42))
    txt = bpy.context.active_object
    txt.name = "Roman_Numerals_Frieze"
    txt.data.body = "I • II • III • IV • V • VI • VII • VIII"
    txt.data.size = 0.22
    txt.data.extrude = 0.04
    txt.rotation_euler = (math.pi / 2, 0, 0)
    txt.data.materials.append(travertine_mat)

    # Top Cornice Wall
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.8, arch_center_z + arch_radius + 0.65))
    cornice = bpy.context.active_object
    cornice.scale = (4.8, 0.70, 0.35)
    cornice.data.materials.append(travertine_mat)

    # 4. Lush Climbing Green Ivy & Vines over Columns and Arch
    # Distribute ivy vines and leaf clusters
    random.seed(42)
    # Along Left Column
    for i in range(28):
        h = random.uniform(0.3, 4.2)
        ang = random.uniform(0, math.pi * 2)
        px = -1.95 + math.cos(ang) * 0.44
        py = 0.8 + math.sin(ang) * 0.44
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.12, 0.26), location=(px, py, h))
        leaf = bpy.context.active_object
        leaf.scale = (1.0, 0.4, 1.2)
        leaf.rotation_euler = (random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), random.uniform(0, 3.14))
        leaf.data.materials.append(leaf_mat)

    # Along Right Column
    for i in range(28):
        h = random.uniform(0.3, 4.2)
        ang = random.uniform(0, math.pi * 2)
        px = 1.95 + math.cos(ang) * 0.44
        py = 0.8 + math.sin(ang) * 0.44
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.12, 0.26), location=(px, py, h))
        leaf = bpy.context.active_object
        leaf.scale = (1.0, 0.4, 1.2)
        leaf.rotation_euler = (random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), random.uniform(0, 3.14))
        leaf.data.materials.append(leaf_mat)

    # Drooping Hanging Vines from Archway
    for i in range(35):
        t = random.uniform(0.15, math.pi - 0.15)
        ax = math.cos(math.pi - t) * (arch_radius - 0.08)
        az = arch_center_z + math.sin(t) * (arch_radius - 0.08)
        ay = 0.8 + random.uniform(-0.25, 0.25)
        # Droop downwards
        droop_len = random.uniform(0.3, 1.1)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=droop_len, vertices=8, location=(ax, ay, az - droop_len/2))
        vine_tendril = bpy.context.active_object
        vine_tendril.data.materials.append(leaf_mat)

        # Leaf cluster at end of vine
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.14, 0.24), location=(ax, ay, az - droop_len))
        cluster = bpy.context.active_object
        cluster.data.materials.append(leaf_mat)

    # 5. Outdoor Nature & Greenery Beyond the Arch (Background Room Opening)
    # Backdrop Trees & Lush Green Jungle Foliage (Outside)
    for i in range(40):
        tx = random.uniform(-4.5, 4.5)
        ty = random.uniform(3.5, 9.0)
        tz = random.uniform(0.5, 6.0)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.8, 1.8), location=(tx, ty, tz))
        tree_mass = bpy.context.active_object
        # Vibrant lush olive/emerald green tones
        tree_mat = bpy.data.materials.new(name=f"TreeGreen_{i}")
        tree_mat.use_nodes = True
        b_color = (random.uniform(0.04, 0.09), random.uniform(0.22, 0.38), random.uniform(0.05, 0.12), 1.0)
        tree_mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = b_color
        tree_mass.data.materials.append(tree_mat)

    # Sky Backdrop Plane (Morning Sunrise Sky with warm peachy horizon and soft blue zenith)
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 12.0, 8.0))
    sky = bpy.context.active_object
    sky.rotation_euler = (math.pi / 2, 0, 0)
    sky_mat = bpy.data.materials.new(name="Morning_Sky_Backdrop")
    sky_mat.use_nodes = True
    s_nodes = sky_mat.node_tree.nodes
    s_links = sky_mat.node_tree.links
    s_nodes.clear()
    s_out = s_nodes.new('ShaderNodeOutputMaterial')
    s_emit = s_nodes.new('ShaderNodeEmission')
    s_ramp = s_nodes.new('ShaderNodeValToRGB')
    s_tex = s_nodes.new('ShaderNodeTexGradient')
    s_coord = s_nodes.new('ShaderNodeTexCoord')

    s_ramp.color_ramp.elements[0].position = 0.2
    s_ramp.color_ramp.elements[0].color = (1.0, 0.90, 0.78, 1.0) # Warm morning glow
    s_ramp.color_ramp.elements[1].position = 0.8
    s_ramp.color_ramp.elements[1].color = (0.42, 0.65, 0.85, 1.0) # Soft morning blue

    s_links.new(s_coord.outputs['Generated'], s_tex.inputs['Vector'])
    s_links.new(s_tex.outputs['Fac'], s_ramp.inputs['Fac'])
    s_links.new(s_ramp.outputs['Color'], s_emit.inputs['Color'])
    s_emit.inputs['Strength'].default_value = 1.3
    s_links.new(s_emit.outputs['Emission'], s_out.inputs['Surface'])
    sky.data.materials.append(sky_mat)

    # 6. Dappled Fragmented Morning Sunlight ("morning early morning vibes with the sun shining through... a lot of a few small light sunlight beams")
    # Sun light from Upper Right
    bpy.ops.object.light_add(type='SUN', location=(6.0, -2.0, 8.0))
    sun = bpy.context.active_object
    sun.name = "Morning_Fragmented_Sun"
    sun.data.energy = 5.5
    sun.data.color = (1.0, 0.94, 0.86) # Warm morning sun
    sun.data.angle = math.radians(1.5) # Soft shadows
    # Aim sun at pedestal
    sun.rotation_euler = (math.radians(52), math.radians(-24), math.radians(-42))

    # Dappled Foliage Gobo Grid (breaks sun into delicate small fragmented beams)
    for g in range(18):
        gx = random.uniform(2.5, 4.5)
        gy = random.uniform(0.0, 2.0)
        gz = random.uniform(4.5, 6.8)
        bpy.ops.mesh.primitive_cube_add(size=random.uniform(0.2, 0.5), location=(gx, gy, gz))
        gobo_leaf = bpy.context.active_object
        gobo_leaf.data.materials.append(leaf_mat)

    # Ambient Fill Light (Soft cool morning fill)
    bpy.ops.object.light_add(type='POINT', location=(-3.0, -1.0, 3.5))
    fill = bpy.context.active_object
    fill.data.energy = 180.0
    fill.data.color = (0.75, 0.88, 0.95)

    # 7. Cinematic Camera Matching Mobile 9:16 Framing
    bpy.ops.object.camera_add(location=(0.0, -3.95, 1.45))
    cam = bpy.context.active_object
    cam.name = "Cinematic_Sanctuary_Camera"
    cam.rotation_euler = (math.radians(82), 0, 0)
    cam.data.lens = 48.0 # 48mm natural lens
    scene.camera = cam

    # 8. Render Engine Configuration (Blender 5.2 EEVEE Next for rapid high-fidelity raytraced render)
    scene.render.engine = 'BLENDER_EEVEE'
    scene.eevee.shadow_ray_count = 4
    scene.eevee.shadow_step_count = 8
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'

    # Vertical 9:16 mobile resolution: 1080 x 1920
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 95

    out_path = "public/images/roman_sanctuary_cinematic.jpg"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    scene.render.filepath = os.path.abspath(out_path)
    print(f"Starting render to {scene.render.filepath}...")
    bpy.ops.render.render(write_still=True)
    print("RENDER COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    build_scene()
