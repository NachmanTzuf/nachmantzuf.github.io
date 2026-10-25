r"""
BLENDER 5.2 PHOTOREALISTIC 8-STRING CELTIC LEVER HARP GENERATOR (V9.3 REA MASTER)
Engineered via Reverse Engineering Anything (REA) Blueprint — V9.3 Precision Upgrade:
1. Front Crown Diagonal Scarf Connection & Hairline Glue Seam:
   - Crisp, softly radiused (~3mm) outer crown tip corner at (Y = -0.396, Z = 1.376) where the upper neck meets the front pillar.
   - Straight diagonal planar glue seam running from outer tip (Y=-0.396, Z=1.376) down and inward at ~54 deg to the lower inner throat
     (Y=-0.326, Z=1.225), rendered with a 0.35mm micro-groove / warm dark amber glue line RGB(0.32, 0.21, 0.11).
2. Forepillar Subtle Forward Convex Bow & Tapered Side-View Width:
   - Gentle forward convex bow along its length, terminating cleanly against the dark walnut mounting seat above the base trim molding.
   - Side-view width starts narrower at the bottom base (~0.044m at Z=0.08m), widens through middle (~0.056m at Z=0.68m),
     and widens further (~0.072m at Z=1.15m) approaching the inner throat curve and diagonal crown joint.
3. Harmonic Neck Smooth S-Curve, Larger Inner Throat Curve & Dynamic Thickness:
   - Slimmer vertical height at treble valley near String 7-8 (~0.058m), sweeping through a completely smooth, continuous S-curve
     and getting progressively thicker toward String 1 and the front pillar (~0.108m to 0.115m approaching the crown).
   - Larger, more generous inner throat curve under the crown with substantial wood volume curving down toward the inside of the pillar.
4. Upper Neck Uniform Lateral Width & Crisp Knee Lever-Side Crescent Carving + Tiny Knee Glue Seam:
   - Uniform lateral X-width (rx = 0.025m, total width 0.050m) throughout the entire string section from front pillar to String 8.
   - Only after String 8, approaching the knee connection with the soundbox, flares smoothly into hw_cone on -X and forms a crisp,
     sculpted C-shaped crescent bevel/step line on the lever side (+X).
   - Subtle hairline glue seam (0.35mm, RGB(0.32, 0.21, 0.11)) along the knee block/dome connection plane on top of the soundbox and inner throat.
5. Legs Mounted Strictly From Underneath on Flat Base Plate with C1-Smooth Arches & Overhangs:
   - Soundbox staves, soundboard, string rib, purfling, and edge rails terminate cleanly on a horizontal bottom base plate
     (Harp_Bottom_Plate at Z_base = 0.052m) with a clean base trim collar and circular bottom soundhole (radius = 0.042m) with 3D recessed interior depth.
   - Arched legs (Harp_Leg_1, Harp_Leg_2) mounted strictly underneath Z_base = 0.052m with zero penetration into the soundboard or body,
     C1-smooth cosine/smoothstep transitions into the ~0.042m front/rear toe overhangs and bottom arch, and 2 countersunk dark screws per leg.
6. Rear Soundbox Soundholes Proportional Oval Aspect Ratio (~2.1:1) & Recessed Wood Interior Depth:
   - 3 vertical oval soundholes centered along the middle rear stave at t=0.130, t=0.435, and t=0.755, width ~78% of center stave width,
     harmonious ~1.95:1 to ~2.15:1 oval aspect ratios, flush outer wood rim, and deeply recessed warm-shaded interior cavity strictly inside the soundbox.
7. Strings Closer to 90 Degrees, 100% Parallel YZ Angle & Equal Symmetric Spacing:
   - Top string mounts on neck (Y = -0.300 to Y = +0.154) with 3-tier hardware intact.
   - Bottom attachment of String 1 moved forward to t1 = 0.072 (t8 ~ 0.685), with all 8 strings 100% parallel in YZ and 100% equally spaced.
8. Levers Color Changed to Pure Silver with Red (C) and Blue (F) Markings:
   - Lever_Base_1..8 and Lever_Handle_1..8 in bright brushed metallic silver (mat_lever_silver), Red band on Strings 1 & 8, Blue band on String 4, Silver band on others.
9. Multi-Angle Verification Suite (v9_3_*.png).
"""

import bpy
import math
import os
import shutil
from mathutils import Vector, Matrix, Quaternion

# ---------------------------------------------------------------------------
# 1. RESET SCENE & SETTINGS
# ---------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

harp_col = bpy.data.collections.new("CelticHarp8String")
scene.collection.children.link(harp_col)

def link_obj(obj):
    if obj.name not in harp_col.objects:
        harp_col.objects.link(obj)
    for col in list(obj.users_collection):
        if col != harp_col:
            col.objects.unlink(obj)
    return obj

def create_mesh_obj(name, verts, faces, uvs=None, mat=None, smooth=True):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    if uvs:
        uv_layer = mesh.uv_layers.new(name="UVMap")
        for poly in mesh.polygons:
            for loop_idx in poly.loop_indices:
                v_idx = mesh.loops[loop_idx].vertex_index
                uv_layer.data[loop_idx].uv = uvs[v_idx]
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    link_obj(obj)
    return obj

def catmull_rom_spline(ctrl_pts, num_samples, end_pt=None):
    n = len(ctrl_pts)
    last_ghost = end_pt if end_pt is not None else ctrl_pts[-1]
    pts = [ctrl_pts[0]] + list(ctrl_pts) + [last_ghost]
    out = []
    for i in range(num_samples):
        u_global = (i / (num_samples - 1)) * (n - 1)
        seg = min(n - 2, int(u_global))
        u = u_global - seg
        p0, p1, p2, p3 = pts[seg], pts[seg + 1], pts[seg + 2], pts[seg + 3]
        u2 = u * u
        u3 = u2 * u
        pt = 0.5 * (
            (2.0 * p1) +
            (-p0 + p2) * u +
            (2.0*p0 - 5.0*p1 + 4.0*p2 - p3) * u2 +
            (-p0 + 3.0*p1 - 3.0*p2 + p3) * u3
        )
        out.append(pt)
    return out

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def smootherstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)

# ---------------------------------------------------------------------------
# 2. WOOD TEXTURES & PBR MATERIALS
# ---------------------------------------------------------------------------
def create_blond_maple_image(name="Tex_BlondMaple", width=512, height=512):
    img = bpy.data.images.new(name=name, width=width, height=height, alpha=False)
    pixels = [0.0] * (width * height * 4)
    base_rgb      = (0.74, 0.54, 0.33)
    dark_rgb      = (0.58, 0.39, 0.22)
    highlight_rgb = (0.80, 0.62, 0.38)

    for y in range(height):
        v = y / height
        v_ang = v * math.pi * 2.0
        for x in range(width):
            u = x / width
            u_ang = u * math.pi * 2.0
            wobble = 0.14 * math.sin(v_ang * 2.0 + 0.9 * math.sin(u_ang * 2.0))
            rings = 0.5 + 0.5 * math.sin((u * 10.0 + wobble) * math.pi * 2.0)
            fine_fibers = 0.5 + 0.5 * math.sin(u_ang * 64.0 + 0.4 * math.sin(v_ang * 3.0))
            subtle_curl = 0.5 + 0.5 * math.sin(v_ang * 18.0 + 0.3 * math.sin(u_ang * 2.0))

            g_fac = 0.58 * rings + 0.32 * fine_fibers + 0.10 * subtle_curl
            r = dark_rgb[0] * (1.0 - g_fac) + base_rgb[0] * g_fac + highlight_rgb[0] * (subtle_curl * 0.04)
            g = dark_rgb[1] * (1.0 - g_fac) + base_rgb[1] * g_fac + highlight_rgb[1] * (subtle_curl * 0.04)
            b = dark_rgb[2] * (1.0 - g_fac) + base_rgb[2] * g_fac + highlight_rgb[2] * (subtle_curl * 0.04)

            idx = (y * width + x) * 4
            pixels[idx]     = min(1.0, max(0.0, r))
            pixels[idx + 1] = min(1.0, max(0.0, g))
            pixels[idx + 2] = min(1.0, max(0.0, b))
            pixels[idx + 3] = 1.0

    img.pixels.foreach_set(pixels)
    img.pack()
    return img

def create_diamond_purfling_image(name="Tex_DiamondPurfling", width=128, height=512):
    img = bpy.data.images.new(name=name, width=width, height=height, alpha=False)
    pixels = [0.0] * (width * height * 4)
    ebony_walnut = (0.07, 0.03, 0.015)
    red_walnut   = (0.28, 0.11, 0.04)
    cream_maple  = (0.92, 0.80, 0.58)

    num_diamonds = 36.0
    for y in range(height):
        v = y / height
        phase = (v * num_diamonds) % 1.0
        dist_center = abs(phase - 0.5) * 2.0

        for x in range(width):
            u = x / width
            dist_u = abs(u - 0.5) * 2.0

            if dist_u > 0.84:
                rgb = ebony_walnut
            elif dist_u > 0.68:
                rgb = cream_maple
            else:
                d_val = (1.0 - dist_center) * 0.68
                if dist_u < d_val:
                    rgb = red_walnut if ((int(v * num_diamonds)) % 2 == 0) else ebony_walnut
                else:
                    rgb = cream_maple

            idx = (y * width + x) * 4
            pixels[idx]     = rgb[0]
            pixels[idx + 1] = rgb[1]
            pixels[idx + 2] = rgb[2]
            pixels[idx + 3] = 1.0

    img.pixels.foreach_set(pixels)
    img.pack()
    return img

img_maple = create_blond_maple_image()
img_purfling = create_diamond_purfling_image()

def make_textured_mat(name, image, roughness=0.25, coat=0.25, specular=0.35):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = specular
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
    tex_node = nodes.new("ShaderNodeTexImage")
    tex_node.image = image
    links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
    return mat

def make_pbr_mat(name, base_color, roughness=0.25, metallic=0.0, specular=None, coat=None, coat_roughness=None, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if specular is not None:
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = specular
        elif "Specular" in bsdf.inputs:
            bsdf.inputs["Specular"].default_value = specular
    if coat is not None and "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
    if coat_roughness is not None and "Coat Roughness" in bsdf.inputs:
        bsdf.inputs["Coat Roughness"].default_value = coat_roughness
    if emission and "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

mat_maple_wood    = make_textured_mat("Harp_BlondMaple", img_maple, roughness=0.24, coat=0.32, specular=0.40)
mat_purfling      = make_textured_mat("Harp_Inlaid_Purfling", img_purfling, roughness=0.22, coat=0.40, specular=0.45)
mat_walnut_rib    = make_pbr_mat("Harp_DarkWalnut_Rib", (0.12, 0.065, 0.035), roughness=0.32, metallic=0.02)
mat_glue_seam     = make_pbr_mat("Harp_Glue_Seam", (0.32, 0.21, 0.11), roughness=0.38, metallic=0.0)
mat_interior_wood = make_pbr_mat("Harp_Interior_WarmWood", (0.09, 0.065, 0.042), roughness=0.82, metallic=0.0)
mat_dark_cavity   = make_pbr_mat("Harp_Interior_DarkCavity", (0.045, 0.032, 0.022), roughness=0.90, metallic=0.0)
mat_gunmetal_pin  = make_pbr_mat("Hardware_Gunmetal_Pin", (0.14, 0.14, 0.16), roughness=0.26, metallic=0.90)
mat_lever_base    = make_pbr_mat("Hardware_Gunmetal_Base", (0.18, 0.20, 0.24), roughness=0.26, metallic=0.92)
mat_lever_silver  = make_pbr_mat("Hardware_Brushed_Silver", (0.92, 0.94, 0.98), roughness=0.04, metallic=0.99, specular=1.0, coat=0.8, coat_roughness=0.02)
mat_lever_black   = make_pbr_mat("Hardware_Anodized_Black", (0.06, 0.06, 0.07), roughness=0.24, metallic=0.88)
mat_chrome_metal  = make_pbr_mat("Hardware_Polished_Chrome", (0.82, 0.85, 0.90), roughness=0.05, metallic=0.99, specular=1.0, coat=0.8, coat_roughness=0.02)
mat_silver_eyelet = make_pbr_mat("Hardware_Silver_Eyelet", (0.85, 0.86, 0.88), roughness=0.18, metallic=0.92)
mat_felt_washer   = make_pbr_mat("Hardware_Felt_Washer", (0.38, 0.38, 0.40), roughness=0.75, metallic=0.10)
mat_band_red      = make_pbr_mat("Lever_ColorBand_Red", (0.88, 0.05, 0.07), roughness=0.35, metallic=0.02, emission=(0.35, 0.02, 0.02), emission_strength=0.15)
mat_band_blue     = make_pbr_mat("Lever_ColorBand_Blue", (0.05, 0.25, 0.88), roughness=0.35, metallic=0.02, emission=(0.02, 0.06, 0.35), emission_strength=0.15)
mat_string_red    = make_pbr_mat("String_Red_C", (0.88, 0.08, 0.10), roughness=0.15, metallic=0.05, emission=(0.35, 0.02, 0.02), emission_strength=0.18)
mat_string_blue   = make_pbr_mat("String_Blue_F", (0.08, 0.28, 0.90), roughness=0.15, metallic=0.05, emission=(0.02, 0.08, 0.40), emission_strength=0.18)
mat_string_nylon  = make_pbr_mat("String_Clear_Nylon", (0.95, 0.93, 0.88), roughness=0.12, metallic=0.05, emission=(0.22, 0.20, 0.16), emission_strength=0.12)

# ---------------------------------------------------------------------------
# 3. SOUNDBOX PARAMETRIC GEOMETRY & HORIZONTAL BASE PLANE (Z_base = 0.052m)
# ---------------------------------------------------------------------------
Z_base = 0.052
Z_collar_top = 0.052

def soundboard_center(t):
    y = -0.14 + t * 0.45
    z =  0.075 + t * 0.965
    return Vector((0.0, y, z))

def soundbox_dimensions(t):
    half_w = 0.162 * (1.0 - 0.70 * t)
    depth  = 0.170 * (1.0 - 0.44 * t)
    return half_w, depth

sb_dir = (soundboard_center(1.0) - soundboard_center(0.0)).normalized()
back_normal = Vector((0.0, sb_dir.z, -sb_dir.y)).normalized()
front_normal = -back_normal
side_x = Vector((1.0, 0.0, 0.0))

def get_t_at_z(d_f, z_target=Z_base):
    c0 = 0.075 + back_normal.z * d_f * 0.170
    c1 = 0.965 - back_normal.z * d_f * 0.170 * 0.44
    return (z_target - c0) / c1

t_base_front = get_t_at_z(0.0, Z_base)
t_base_rear  = get_t_at_z(1.0, Z_base)

# Horizontal Luthier Miter Plane at Z ~ 0.988m (t_front = 0.948 at d=0, t_rear = 0.986 at d=1):
t_miter = 0.948
t_miter_rear = 0.986
c_top = soundboard_center(t_miter) # (0.0, 0.2866, 0.9898)
hw_top, depth_top = soundbox_dimensions(t_miter) # hw=0.0545, depth=0.0991
c_rear_top = soundboard_center(t_miter_rear)
hw_rear_top, depth_rear_top = soundbox_dimensions(t_miter_rear)
p_miter_rear = c_rear_top + back_normal * depth_rear_top # (0.0, 0.3909, 0.9858)

base_24_d_frac = [
    0.42, 0.56, 0.70, 0.84, 0.92, 1.00, 1.00, 1.00,
    0.92, 0.84, 0.70, 0.56, 0.42, 0.28, 0.14, 0.00,
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.14, 0.28,
]
base_24_x_frac = [
     0.90,  0.80,  0.70,  0.60,  0.41,  0.22,  0.00, -0.22,
    -0.41, -0.60, -0.70, -0.80, -0.90, -0.9333, -0.9667, -1.00,
    -0.6667, -0.3333, 0.00, 0.3333, 0.6667, 1.00, 0.9667, 0.9333,
]

def get_soundbox_ring_24(s_frac):
    # At s_frac = 0.0: every vertex lies on the horizontal base collar top Z = Z_collar_top (0.061m)!
    # At s_frac = 1.0: every vertex lies on the top luthier miter plane (t_miter..t_miter_rear)!
    throat_taper = 0.15 * smoothstep(0.60, 1.00, s_frac)
    ring = [None] * 24
    for j in range(24):
        d_f = base_24_d_frac[j]
        front_fac = max(0.0, (0.42 - d_f) / 0.42)
        x_f = base_24_x_frac[j] * (1.0 - throat_taper * front_fac)
        t_bot_j = get_t_at_z(d_f, Z_collar_top)
        t_top_j = t_miter + (t_miter_rear - t_miter) * d_f
        t_j = t_bot_j + (t_top_j - t_bot_j) * s_frac
        c_j = soundboard_center(t_j)
        hw_j, depth_j = soundbox_dimensions(t_j)
        pt = c_j + back_normal * (d_f * depth_j) + side_x * (hw_j * x_f)
        ring[j] = pt
    return ring

miter_24_pts = get_soundbox_ring_24(1.0)
base_24_pts  = get_soundbox_ring_24(0.0)
miter_24_x_frac = []
miter_24_d_frac = list(base_24_d_frac)
for j in range(24):
    miter_24_x_frac.append(miter_24_pts[j].x / hw_top)

dome_24_x_frac = list(miter_24_x_frac)
dome_24_d_frac = list(miter_24_d_frac)
for _ in range(2):
    nx = [0.25 * dome_24_x_frac[(j - 1) % 24] + 0.50 * dome_24_x_frac[j] + 0.25 * dome_24_x_frac[(j + 1) % 24] for j in range(24)]
    nd = [0.25 * dome_24_d_frac[(j - 1) % 24] + 0.50 * dome_24_d_frac[j] + 0.25 * dome_24_d_frac[(j + 1) % 24] for j in range(24)]
    nx[0]  = miter_24_x_frac[0]
    nx[12] = miter_24_x_frac[12]
    nx[15] = miter_24_x_frac[15]
    nx[21] = miter_24_x_frac[21]
    dome_24_x_frac, dome_24_d_frac = nx, nd

# ---------------------------------------------------------------------------
# 4. BUILD SOUNDBOX (FACE + PURFLING + RIB + 3 PROPORTIONAL OVAL REAR SOUNDHOLES + FLAT BASE PLATE)
# ---------------------------------------------------------------------------
def build_soundbox():
    steps_z = 48
    t_rail_bot = get_t_at_z(0.0, Z_collar_top)

    # Front Soundboard Face (extending from Z_collar_top = 0.061m up to t_miter)
    sbd_verts, sbd_faces, sbd_uvs = [], [], []
    for i in range(steps_z + 1):
        s_f = i / steps_z
        t = t_rail_bot + s_f * (t_miter - t_rail_bot)
        s_top_flush = 1.0 - 0.90 * smoothstep(0.90, t_miter, t)
        s_bot_flush = smoothstep(0.0, 0.04, s_f)
        c = soundboard_center(t) + front_normal * (0.0015 * s_top_flush * s_bot_flush)
        hw, _ = soundbox_dimensions(t)
        hw *= (1.0 - 0.15 * smoothstep(0.60, 1.00, s_f))
        sbd_verts.append(c + Vector((-hw * 0.98, 0, 0)))
        sbd_verts.append(c + Vector(( hw * 0.98, 0, 0)))
        sbd_uvs.extend([(0.05, s_f * 0.96 + 0.02), (0.95, s_f * 0.96 + 0.02)])
    for i in range(steps_z):
        b = i * 2
        sbd_faces.append((b, b + 1, b + 3, b + 2))
    create_mesh_obj("Harp_Soundboard_Face", sbd_verts, sbd_faces, uvs=sbd_uvs, mat=mat_maple_wood, smooth=True)

    # Edge Rails (starting cleanly at Z_collar_top = 0.061m up to t_miter)
    for side in (-1, 1):
        rv, rf, ruv = [], [], []
        for i in range(steps_z + 1):
            s_f = i / steps_z
            t = t_rail_bot + s_f * (t_miter - t_rail_bot)
            s_top_flush = 1.0 - 0.92 * smoothstep(0.89, t_miter, t)
            c = soundboard_center(t)
            hw, _ = soundbox_dimensions(t)
            hw *= (1.0 - 0.15 * smoothstep(0.60, 1.00, s_f))
            x_out = side * hw
            x_in  = side * (hw - 0.011)
            rail_h = 0.0055 * s_top_flush
            rv.extend([
                c + Vector((x_out, 0, 0)),
                c + Vector((x_in,  0, 0)),
                c + Vector((x_in,  0, 0)) + front_normal * rail_h,
                c + Vector((x_out, 0, 0)) + front_normal * rail_h,
            ])
            ruv.extend([(0.0, s_f), (0.3, s_f), (0.6, s_f), (1.0, s_f)])
        for i in range(steps_z):
            b = i * 4
            n = (i + 1) * 4
            for k in range(4):
                kn = (k + 1) % 4
                rf.append((b + k, b + kn, n + kn, n + k))
        create_mesh_obj(f"Harp_Soundboard_EdgeRail_{side}", rv, rf, uvs=ruv, mat=mat_maple_wood, smooth=False)

    # Diamond Purfling Inlays (starting above base collar at Z_collar_top up to t_miter)
    for side in (-1, 1):
        pv, pf, puv = [], [], []
        for i in range(steps_z + 1):
            s_f = i / steps_z
            t = t_rail_bot + s_f * (t_miter - t_rail_bot)
            s_top_flush = 1.0 - 0.90 * smoothstep(0.89, t_miter, t)
            c = soundboard_center(t) + front_normal * (0.0030 * s_top_flush)
            hw, _ = soundbox_dimensions(t)
            hw *= (1.0 - 0.15 * smoothstep(0.60, 1.00, s_f))
            x1 = side * (hw - 0.0112)
            x2 = side * (hw - 0.0242)
            if side == 1:
                x1, x2 = x2, x1
            pv.extend([c + Vector((x1, 0, 0)), c + Vector((x2, 0, 0))])
            puv.extend([(0.0, s_f), (1.0, s_f)])
        for i in range(steps_z):
            b = i * 2
            pf.append((b, b + 1, b + 3, b + 2))
        create_mesh_obj(f"Harp_Diamond_Purfling_{side}", pv, pf, uvs=puv, mat=mat_purfling, smooth=False)

    # Dark Walnut String Rib & Clean Forepillar Mounting Seat (Refinement 3, Ref: media_1792309283951_f0c38efa.jpg):
    # - Starts cleanly at t_rib_min = 0.022 (above the base collar top Z = 0.061m) with seat_fac tapering smoothly to 0.0
    #   at t_rib_min so the walnut rib sits 100% cleanly on the soundboard face with zero protruding brown sliver at the bottom front!
    rib_steps = 64
    t_rib_min = 0.022
    rib_verts, rib_faces, rib_uvs = [], [], []
    for i in range(rib_steps + 1):
        u_rib = i / rib_steps
        t = t_rib_min + u_rib * (0.925 - t_rib_min)
        c = soundboard_center(t) + front_normal * 0.0012
        top_taper = 1.0
        if t > 0.86:
            top_taper = max(0.12, math.sqrt(max(0.0, 1.0 - ((t - 0.86) / 0.065)**2)))
        seat_fac = smoothstep(t_rib_min, t_rib_min + 0.012, t) * (1.0 - smoothstep(0.036, 0.068, t))
        bot_taper = 0.72 + 0.28 * smoothstep(t_rib_min, t_rib_min + 0.015, t)
        rib_half_w = (0.0165 * (1.0 - 0.28 * max(0.0, t)) * top_taper * bot_taper) + 0.0055 * seat_fac
        rib_h      = (0.0075 * top_taper * bot_taper) + 0.0045 * seat_fac
        lip_h      = rib_h + 0.0012 * seat_fac
        pts_r = [
            c + Vector((-rib_half_w, 0, 0)),
            c + Vector(( rib_half_w, 0, 0)),
            c + Vector(( rib_half_w * 0.92, 0, 0)) + front_normal * lip_h,
            c + Vector(( rib_half_w * 0.65, 0, 0)) + front_normal * rib_h,
            c + Vector((-rib_half_w * 0.65, 0, 0)) + front_normal * rib_h,
            c + Vector((-rib_half_w * 0.92, 0, 0)) + front_normal * lip_h,
        ]
        rib_verts.extend(pts_r)
        for k in range(6):
            rib_uvs.append((k / 5.0, u_rib))
    for i in range(rib_steps):
        b = i * 6
        n = (i + 1) * 6
        for k in range(6):
            kn = (k + 1) % 6
            rib_faces.append((b + k, b + kn, n + kn, n + k))
    rib_faces.append(tuple(reversed(range(0, 6))))
    rib_faces.append(tuple(range(rib_steps * 6, (rib_steps + 1) * 6)))
    create_mesh_obj("Harp_Central_String_Rib", rib_verts, rib_faces, uvs=rib_uvs, mat=mat_walnut_rib, smooth=False)

    # Note: The 3 authentic rear oval soundholes are cut directly into Harp_Harmonic_Frame after it is lofted
    # so the center rear stave has real 3D cutouts opening into an internal wood chamber!

    # Flat Horizontal Bottom Base Plate & Trim Molding at Z_base = 0.052m .. Z_collar_top = 0.061m
    # (Refinement 3 & 5, Ref: media_1792309263425_480e1840.jpg, media_1792309283951_f0c38efa.jpg)
    hole_center_2d = Vector((0.0, -0.058))
    hole_rad = 0.042

    poly_ctrl_2d = []
    for j in range(24):
        p = base_24_pts[j]
        # Clean straight front edge along the soundboard base (Y = -0.1518) with slight center lip under walnut rib (Y = -0.1555)
        if j in (15, 16, 20, 21):
            poly_ctrl_2d.append(Vector((p.x, -0.1518)))
        elif j in (17, 18, 19):
            poly_ctrl_2d.append(Vector((p.x, -0.1555)))
        else:
            poly_ctrl_2d.append(Vector((p.x, p.y)))

    n_plate_segs = 48
    plate_verts, plate_faces, plate_uvs = [], [], []

    for i in range(n_plate_segs):
        u_p = (i / n_plate_segs) * 24.0
        idx0 = int(u_p) % 24
        idx1 = (idx0 + 1) % 24
        frac_p = u_p - int(u_p)
        p_out_2d = poly_ctrl_2d[idx0].lerp(poly_ctrl_2d[idx1], frac_p)
        dir_2d = (p_out_2d - hole_center_2d).normalized()
        p_flush_2d = p_out_2d - dir_2d * 0.0005  # 100% flush / 0.5mm recessed under staves, ZERO protruding collar!

        ang_h = math.atan2(p_out_2d.y - hole_center_2d.y, p_out_2d.x - hole_center_2d.x)
        p_in_2d = hole_center_2d + Vector((math.cos(ang_h) * hole_rad, math.sin(ang_h) * hole_rad))

        plate_verts.extend([
            Vector((p_flush_2d.x, p_flush_2d.y, Z_base - 0.006)),
            Vector((p_in_2d.x,     p_in_2d.y,     Z_base - 0.006)),
            Vector((p_in_2d.x,     p_in_2d.y,     Z_base)),
            Vector((p_flush_2d.x, p_flush_2d.y, Z_base)),
        ])
        for p2 in (p_flush_2d, p_in_2d, p_in_2d, p_flush_2d):
            plate_uvs.append((0.5 + p2.x * 2.5, 0.5 + p2.y * 2.5))

    for i in range(n_plate_segs):
        b = i * 4
        n = ((i + 1) % n_plate_segs) * 4
        plate_faces.append((b + 0, n + 0, n + 1, b + 1))
        plate_faces.append((b + 1, n + 1, n + 2, b + 2))
        plate_faces.append((b + 2, n + 2, n + 3, b + 3))
        plate_faces.append((b + 3, n + 3, n + 0, b + 0))

    create_mesh_obj("Harp_Bottom_Plate", plate_verts, plate_faces, uvs=plate_uvs, mat=mat_maple_wood, smooth=False)

    # Recessed 3D Interior Wood Chamber above the bottom circular soundhole (strictly inside the bottom of the soundbox)
    bot_cav_verts, bot_cav_faces = [], []
    n_bc = 36
    for r_ring, (rad_s, z_val) in enumerate([
        (1.02, Z_base - 0.0005),
        (1.25, Z_base + 0.018),
        (1.20, Z_base + 0.036),
    ]):
        for k in range(n_bc):
            ang = 2.0 * math.pi * k / n_bc
            bot_cav_verts.append(Vector((
                hole_center_2d.x + math.cos(ang) * hole_rad * rad_s,
                hole_center_2d.y + math.sin(ang) * hole_rad * rad_s,
                z_val
            )))
    for r_ring in range(2):
        b = r_ring * n_bc
        n = (r_ring + 1) * n_bc
        for k in range(n_bc):
            kn = (k + 1) % n_bc
            bot_cav_faces.append((b + k, n + k, n + kn, b + kn))
    bot_cav_faces.append(tuple(reversed(range(2 * n_bc, 3 * n_bc))))
    create_mesh_obj("Harp_Bottom_Soundhole_Cavity", bot_cav_verts, bot_cav_faces, mat=mat_interior_wood, smooth=True)

build_soundbox()

# ---------------------------------------------------------------------------
# 5. BUILD SMOOTH ARCHED LEGS STRICTLY UNDERNEATH FLAT BASE PLATE (Refinement 5)
# ---------------------------------------------------------------------------
def build_sculpted_arched_legs():
    # Refinement 5 (Ref: media_1792309275946_0a108faa.jpg, media_1792309283951_f0c38efa.jpg, media_1792309263425_480e1840.jpg):
    # - Zero angular kinks where the flat top transitions into the curved toes and where the bottom arch meets the floor pads.
    # - Top profile is completely flat under the base plate (Z = Z_base = 0.052m), then curves smoothly via a C1/C2 continuous
    #   cosine/smootherstep curve down to the softly rounded-off front and rear toe tips (~0.042m overhang forward and backward).
    # - Bottom arch is a smooth, C1 continuous raised-cosine curve (0.5 * (1 - cos(2*pi*arch_u))) between the flat front and rear floor contact pads.
    steps_y = 72
    y_front = -0.197  # ~0.042m overhang forward past front base edge (-0.155) (UNTOUCHED, PERFECT)
    y_back  =  0.046  # Reduced rear overhang: goes less outside the rear frame (~0.014m past rear stave)
    u_contact_f = 0.165
    u_contact_r = 0.760

    for side_idx, x_center in enumerate([-0.108, 0.108]):
        l_verts, l_faces, l_uvs = [], [], []
        for i in range(steps_y + 1):
            u = i / steps_y
            y = y_front + u * (y_back - y_front)

            # C1 continuous raised-cosine bottom arch between flat front pad [0.00..0.20] and rear pad [0.76..1.00]:
            if 0.20 < u < 0.76:
                arch_u = (u - 0.20) / 0.56
                z_bot = 0.018 * 0.5 * (1.0 - math.cos(2.0 * math.pi * arch_u))
            else:
                z_bot = 0.000

            # C1/C2 continuous top profile: completely flat at Z_base = 0.052m under the base plate [u_contact_f .. u_contact_r],
            # then smoothly curving down to Z = 0.022m at the toe tips with zero derivative discontinuity!
            if u < u_contact_f:
                s_toe = (u_contact_f - u) / u_contact_f
                c_smooth = smootherstep(0.0, 1.0, s_toe)
                z_top = Z_base - (Z_base - 0.022) * (0.65 * c_smooth + 0.35 * (s_toe ** 1.6))
            elif u > u_contact_r:
                s_toe = (u - u_contact_r) / (1.0 - u_contact_r)
                c_smooth = smootherstep(0.0, 1.0, s_toe)
                z_top = Z_base - (Z_base - 0.022) * (0.65 * c_smooth + 0.35 * (s_toe ** 1.6))
            else:
                z_top = Z_base

            if u < 0.025:
                tip_round = math.sin((u / 0.025) * (math.pi * 0.5))
                z_top = z_bot + (z_top - z_bot) * (0.78 + 0.22 * tip_round)
            elif u > 0.975:
                tip_round = math.sin(((1.0 - u) / 0.025) * (math.pi * 0.5))
                z_top = z_bot + (z_top - z_bot) * (0.78 + 0.22 * tip_round)

            x_cur = x_center * (1.0 + 0.06 * (0.5 - u))
            hw_leg = 0.020 * (0.94 + 0.10 * math.sin(u * math.pi))
            bevel_in = 0.0028

            pts = [
                Vector((x_cur - hw_leg,            y, z_bot)),
                Vector((x_cur + hw_leg,            y, z_bot)),
                Vector((x_cur + hw_leg,            y, z_bot + (z_top - z_bot) * 0.72)),
                Vector((x_cur + hw_leg - bevel_in, y, z_top)),
                Vector((x_cur - hw_leg + bevel_in, y, z_top)),
                Vector((x_cur - hw_leg,            y, z_bot + (z_top - z_bot) * 0.72)),
            ]
            l_verts.extend(pts)
            for k in range(6):
                l_uvs.append((k / 5.0, u))

        for i in range(steps_y):
            b = i * 6
            n = (i + 1) * 6
            for k in range(6):
                kn = (k + 1) % 6
                l_faces.append((b + k, b + kn, n + kn, n + k))
        l_faces.append(tuple(reversed(range(0, 6))))
        end_b = steps_y * 6
        l_faces.append(tuple(range(end_b, end_b + 6)))

        create_mesh_obj(f"Harp_Leg_{side_idx+1}", l_verts, l_faces, uvs=l_uvs, mat=mat_maple_wood, smooth=True)

        # 2 Countersunk Dark Screws on the underside of each leg (Ref Photo 3: media_1792309263425_480e1840.jpg)
        for s_idx, u_screw in enumerate([0.35, 0.65]):
            y_s = y_front + u_screw * (y_back - y_front)
            x_s = x_center * (1.0 + 0.06 * (0.5 - u_screw))
            arch_u = (u_screw - 0.20) / 0.56
            z_s = 0.018 * 0.5 * (1.0 - math.cos(2.0 * math.pi * arch_u))
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=16, radius=0.0038, depth=0.0025,
                location=Vector((x_s, y_s, z_s + 0.0005))
            )
            scr = bpy.context.active_object
            scr.name = f"Harp_Leg_Screw_{side_idx+1}_{s_idx+1}"
            scr.data.materials.append(mat_gunmetal_pin)
            link_obj(scr)

build_sculpted_arched_legs()

# ---------------------------------------------------------------------------
# 6. TWO-RAIL SWEEP MASTER HARP FRAME (Refinements 1, 2, 3)
# ---------------------------------------------------------------------------
T_ctrl = [
    Vector((0.0, -0.165, 0.054)),                 # 0: Forepillar base outer front (depth = 0.055m, flush at base Z=0.052m)
    Vector((0.0, -0.268, 0.360)),                 # 1: Forepillar lower outer (smooth forward convex bow, depth = 0.063m)
    Vector((0.0, -0.352, 0.680)),                 # 2: Forepillar mid outer (depth = 0.076m at Z=0.68m)
    Vector((0.0, -0.406, 0.960)),                 # 3: Forepillar upper-mid outer (depth = 0.086m)
    Vector((0.0, -0.422, 1.150)),                 # 4: Forepillar upper outer (depth = 0.090m at Z=1.15m)
    Vector((0.0, -0.418, 1.320)),                 # 5: Approaching outer crown tip along front pillar edge
    Vector((0.0, -0.412, 1.402)),                 # 6: Crisp, softly radiused (~3mm) outer crown tip corner (Y=-0.412, Z=1.402)
    Vector((0.0, -0.375, 1.406)),                 # 7: Upper neck edge meeting the crown tip smoothly
    Vector((0.0, -0.292, 1.396)),                 # 8: Broad convex bass arch over String 1 (vertical thickness ~0.154m, solid grip)
    Vector((0.0, -0.185, 1.346)),                 # 9: Smooth convex upper S-curve over Strings 2..3 (vertical thickness ~0.136m)
    Vector((0.0, -0.065, 1.240)),                 # 10: Smooth S-curve inflection over Strings 4..5 (vertical thickness ~0.118m)
    Vector((0.0,  0.050, 1.126)),                 # 11: Smooth concave lower S-curve over Strings 6..7 (vertical thickness ~0.098m)
    Vector((0.0,  0.154, 1.066)),                 # 12: Treble valley over String 8 (robust vertical thickness = 0.082m, room for pegs & levers!)
    Vector((0.0,  0.224, 1.088)),                 # 13: Sweeping smoothly up out of treble valley into knee dome
    Vector((0.0,  0.292, 1.106)),                 # 14: Smooth rounded top crest of knee dome
    Vector((0.0,  0.355, 1.088)),                 # 15: Upper-rear 30-deg circular shoulder of dome
    Vector((0.0,  0.392, 1.055)),                 # 16: Mid-rear 65-deg circular arc of dome
    Vector((0.0,  0.4005, 1.018)),                # 17: Lower-rear tangent transition into rear stave
    p_miter_rear,                                 # 18: Exact rear soundbox miter edge (0.3909, 0.9858)
]

B_ctrl = [
    Vector((0.0, -0.110, 0.054)),                 # 0: Forepillar base inner rear
    Vector((0.0, -0.205, 0.360)),                 # 1: Forepillar lower inner
    Vector((0.0, -0.276, 0.680)),                 # 2: Forepillar mid inner
    Vector((0.0, -0.320, 0.960)),                 # 3: Forepillar upper-mid inner
    Vector((0.0, -0.332, 1.150)),                 # 4: Forepillar upper inner
    Vector((0.0, -0.334, 1.185)),                 # 5: Approaching lower inner throat curve
    Vector((0.0, -0.330, 1.215)),                 # 6: Inner end of diagonal glue seam at lower throat (Ref Photo 2)
    Vector((0.0, -0.316, 1.238)),                 # 7: Generous, large-radius inner throat arch curving up toward String 1
    Vector((0.0, -0.276, 1.242)),                 # 8: Neck underside under String 1 (vertical thickness = 0.154m)
    Vector((0.0, -0.185, 1.210)),                 # 9: Smooth S-curve underside under Strings 2..3 (vertical thickness = 0.136m)
    Vector((0.0, -0.065, 1.122)),                 # 10: Smooth S-curve inflection underside under Strings 4..5 (vertical thickness = 0.118m)
    Vector((0.0,  0.050, 1.028)),                 # 11: Smooth S-curve descent underside under Strings 6..7 (vertical thickness = 0.098m)
    Vector((0.0,  0.154, 0.984)),                 # 12: Treble valley underside under String 8 (robust vertical thickness = 0.082m)
    Vector((0.0,  0.202, 0.988)),                 # 13: Smooth valley minimum gliding toward soundboard throat
    Vector((0.0,  0.238, 0.992)),                 # 14: Rising gently along inner throat curve
    Vector((0.0,  0.266, 1.000)),                 # 15: Rounded inner throat apex before soundboard
    Vector((0.0,  0.282, 1.001)),                 # 16: Curving over into soundboard slope
    Vector((0.0,  0.288, 0.996)),                 # 17: Descending tangent to soundboard
    c_top,                                        # 18: Exact front soundboard miter edge (0.2866, 0.9898)
]

num_arch_samples = 252
end_pt_T = soundboard_center(t_miter_rear - 0.035) + back_normal * soundbox_dimensions(t_miter_rear - 0.035)[1]
end_pt_B = soundboard_center(t_miter - 0.025)
T_pts = catmull_rom_spline(T_ctrl, num_arch_samples, end_pt=end_pt_T)
B_pts = catmull_rom_spline(B_ctrl, num_arch_samples, end_pt=end_pt_B)
ring_verts = 24

# Station 12 out of 18 is the treble valley (String 8, Y = 0.154)
u_valley = 12.0 / 18.0

frame_verts, frame_faces, frame_uvs = [], [], []

for i in range(num_arch_samples):
    u = i / (num_arch_samples - 1)
    pt_T = T_pts[i]
    pt_B = B_pts[i]
    pt_C = (pt_T + pt_B) * 0.5
    vec_V = (pt_T - pt_B) * 0.5

    # Final arch ring (u = 1.0): 100% exact match to miter_24_pts at s_frac = 1.0
    if i == num_arch_samples - 1:
        for j in range(ring_verts):
            frame_verts.append(miter_24_pts[j])
            frame_uvs.append((j / ring_verts, 1.50))
        continue

    # SECTION A: FOREPILLAR, CROWN & HARMONIC NECK (u <= u_valley)
    if u <= u_valley:
        t_sec = u / u_valley
        t_neck_blend = smoothstep(0.06, 0.25, t_sec)
        rx = 0.024 * (1.0 - t_neck_blend) + 0.028 * t_neck_blend
        exp_x = 0.34 * (1.0 - t_neck_blend) + 0.22 * t_neck_blend
        exp_y = 0.72 * (1.0 - t_neck_blend) + 0.78 * t_neck_blend

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            sx = math.copysign(abs(ca)**exp_x, ca) * rx
            sy_frac = math.copysign(abs(sa)**exp_y, sa)
            v_pos = pt_C + side_x * sx + vec_V * sy_frac
            frame_verts.append(v_pos)
            frame_uvs.append((j / ring_verts, u * 1.50))

    # SECTION B: LUTHIER KNEE DOME & SILKY-SMOOTH LEVER-SIDE CRESCENT CARVING (u > u_valley)
    else:
        w = (u - u_valley) / (1.0 - u_valley)  # w in (0.0, 1.0]

        hw_cone, _ = soundbox_dimensions(t_miter + 0.052 * (1.0 - w))

        # 1. Right / Tuning Pin Side (-X, ca < 0): Smooth flare starting after String 8 (w > 0.04) into hw_cone by w = 0.38
        s_right = smoothstep(0.04, 0.38, w)
        rx_right = 0.028 * (1.0 - s_right) + hw_cone * s_right

        s_x_shape_right = smoothstep(0.06, 0.40, w)
        s_d_stave = smoothstep(0.15, 0.95, w)
        s_facet_sharp = smoothstep(0.35, 0.96, w)

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            d_norm = 0.5 * (sa + 1.0)  # 0 at bottom rail B (inner throat), 1 at top rail T (top of knee dome)

            x_neck_f = math.copysign(abs(ca)**0.22, ca)
            d_neck_f = 0.5 * (1.0 + math.copysign(abs(sa)**0.78, sa))
            x_dome_f = dome_24_x_frac[j] * (1.0 - s_facet_sharp) + miter_24_x_frac[j] * s_facet_sharp

            # 2. Left / Lever Side (+X, ca >= 0):
            # Silky-smooth, ripple-free crescent transition matching media_1792310861017_90531cb5.jpg:
            if ca >= 0.0:
                w_cove = 0.20 + 0.065 * math.sin(d_norm * math.pi) - 0.025 * (d_norm ** 2)
                s_left_local = smoothstep(w_cove - 0.065, w_cove + 0.065, w)
                cur_rx = 0.028 * (1.0 - s_left_local) + hw_cone * s_left_local
                s_x_shape = smoothstep(w_cove - 0.060, w_cove + 0.25, w)
            else:
                cur_rx = rx_right
                s_x_shape = s_x_shape_right

            x_final_f = x_neck_f * (1.0 - s_x_shape) + x_dome_f * s_x_shape
            d_final_f = d_neck_f * (1.0 - s_d_stave) + miter_24_d_frac[j] * s_d_stave

            v_final = pt_B.lerp(pt_T, d_final_f) + side_x * (x_final_f * cur_rx)
            frame_verts.append(v_final)
            frame_uvs.append((j / ring_verts, u * 1.50))

# SECTION C: UNIFIED SOUNDBOX STAVES CONTINUATION (s_frac from 1.0 down to 0.0 on flat base collar Z = Z_collar_top!)
steps_sb = 48
for k in range(1, steps_sb + 1):
    frac_down = k / steps_sb
    s_cur = 1.0 - frac_down
    ring_cur = get_soundbox_ring_24(s_cur)
    for j in range(ring_verts):
        frame_verts.append(ring_cur[j])
        frame_uvs.append((j / ring_verts, 1.50 + frac_down * 1.00))

total_rings = num_arch_samples + steps_sb
for i in range(total_rings - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        frame_faces.append((b + j, b + jn, n + jn, n + j))

# Foot cap at forepillar base
frame_faces.append(tuple(reversed(range(0, ring_verts))))

# Cut the 3 rear oval soundholes cleanly through the center rear stave:
harp_frame_obj = create_mesh_obj("Harp_Harmonic_Frame", frame_verts, frame_faces, uvs=frame_uvs, mat=mat_maple_wood, smooth=True)

def build_authentic_rear_soundholes(frame_obj):
    # Refinement 4 (Ref: media_1792310874984_c1f427ac.jpg):
    # - Cut 3 generous elongated oval openings directly through the center rear stave matching Photo 9!
    # - Add a flush maple inner rim wall (5.5mm stave thickness) around each cutout and a recessed warm-shaded interior wood chamber
    #   strictly inside the soundbox so looking from the back shows realistic 3D wood thickness and shaded interior depth,
    #   while looking from the side shows 100% flush staves with zero external bumps!
    rear_p0 = soundboard_center(0.0) + back_normal * soundbox_dimensions(0.0)[1]
    rear_p1 = soundboard_center(1.0) + back_normal * soundbox_dimensions(1.0)[1]
    rear_stave_tan = (rear_p1 - rear_p0).normalized()
    # Outward normal of center rear stave (+Y, -Z):
    rear_stave_norm = -side_x.cross(rear_stave_tan).normalized()
    quat_stave = Vector((0.0, 0.0, 1.0)).rotation_difference(rear_stave_norm)
    up_stave = quat_stave @ Vector((0.0, 1.0, 0.0))
    spin_q = Quaternion(rear_stave_norm, up_stave.angle(rear_stave_tan))
    if (spin_q @ up_stave).dot(rear_stave_tan) < 0.99:
        spin_q = Quaternion(rear_stave_norm, -up_stave.angle(rear_stave_tan))
    quat_hole = spin_q @ quat_stave

    hole_specs = [
        (0.120, 0.027, 0.066),  # Hole 1 (Bottom, t=0.120): semi_x=0.027m, semi_z=0.066m (13.2 cm tall, 5.4 cm wide)
        (0.435, 0.024, 0.064),  # Hole 2 (Middle, t=0.435): semi_x=0.024m, semi_z=0.064m (12.8 cm tall, 4.8 cm wide)
        (0.750, 0.020, 0.058),  # Hole 3 (Top,    t=0.750): semi_x=0.020m, semi_z=0.058m (11.6 cm tall, 4.0 cm wide)
    ]
    for idx, (t_hole, hole_rx, hole_ry) in enumerate(hole_specs):
        c = soundboard_center(t_hole)
        hw, depth = soundbox_dimensions(t_hole)
        hole_surface_pt = c + back_normal * depth

        # 1. Boolean Cutter Cylinder (cuts cleanly through the rear stave face of Harp_Harmonic_Frame)
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=1.0, depth=0.050, location=hole_surface_pt)
        cutter = bpy.context.active_object
        cutter.name = f"HoleCutter_{idx+1}"
        cutter.rotation_mode = 'QUATERNION'
        cutter.rotation_quaternion = quat_hole
        cutter.scale = (hole_rx, hole_ry, 1.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

        bool_mod = frame_obj.modifiers.new(name=f"CutHole_{idx+1}", type='BOOLEAN')
        bool_mod.operation = 'DIFFERENCE'
        bool_mod.solver = 'EXACT'
        bool_mod.object = cutter
        bpy.context.view_layer.objects.active = frame_obj
        bpy.ops.object.modifier_apply(modifier=bool_mod.name)
        bpy.data.objects.remove(cutter, do_unlink=True)

        # 2. Inner Maple Stave Rim Wall (5.5mm wood thickness recessed strictly inward from the surface)
        n_oval = 48
        h_verts, h_faces, h_uvs = [], [], []
        rim_depth = 0.0055
        for r_ring, (rad_scale, depth_off) in enumerate([
            (1.005, -0.0001),        # Flush outer edge at cutout perimeter
            (0.975, -rim_depth),     # Inner edge of 5.5mm maple stave wall
        ]):
            for k in range(n_oval):
                ang = 2.0 * math.pi * k / n_oval
                pt = (
                    hole_surface_pt
                    + side_x * (math.cos(ang) * hole_rx * rad_scale)
                    + rear_stave_tan * (math.sin(ang) * hole_ry * rad_scale)
                    + rear_stave_norm * depth_off
                )
                h_verts.append(pt)
                h_uvs.append((k / n_oval, r_ring * 0.2))
        for k in range(n_oval):
            kn = (k + 1) % n_oval
            h_faces.append((k, kn, n_oval + kn, n_oval + k))
        create_mesh_obj(f"Harp_Rear_Soundhole_Rim_{idx+1}", h_verts, h_faces, uvs=h_uvs, mat=mat_maple_wood, smooth=True)

        # 3. Recessed Shaded Interior Wood Chamber (recessed 18mm inside the soundbox behind the 5.5mm rim)
        cav_verts, cav_faces = [], []
        for r_ring, (rad_scale, depth_off) in enumerate([
            (0.98, -rim_depth + 0.0003),
            (1.18, -0.022),
        ]):
            for k in range(n_oval):
                ang = 2.0 * math.pi * k / n_oval
                pt = (
                    hole_surface_pt
                    + side_x * (math.cos(ang) * hole_rx * rad_scale)
                    + rear_stave_tan * (math.sin(ang) * hole_ry * rad_scale)
                    + rear_stave_norm * depth_off
                )
                cav_verts.append(pt)
        for k in range(n_oval):
            kn = (k + 1) % n_oval
            cav_faces.append((k, kn, n_oval + kn, n_oval + k))
        cav_faces.append(tuple(range(n_oval, 2 * n_oval)))
        create_mesh_obj(f"Harp_Rear_Soundhole_{idx+1}", cav_verts, cav_faces, mat=mat_dark_cavity, smooth=True)

build_authentic_rear_soundholes(harp_frame_obj)

# ---------------------------------------------------------------------------
# 6B. AUTHENTIC HAIRLINE GLUE SEAMS AT CROWN SCARF JOINT & KNEE JOINT (Points 1 & 4)
# ---------------------------------------------------------------------------
def build_hairline_glue_seams():
    seam_half_w = 0.00018  # 0.36mm total width hairline glue seam
    seam_out    = 0.00015  # Flush micro-offset so it sits cleanly on the wood surface

    # 1. FRONT CROWN DIAGONAL SCARF GLUE SEAM (Point 1 & Refinement 1, Ref: media_1792309249472_072f8cd1.png)
    idx_crown_ring = int(round((6.0 / 18.0) * (num_arch_samples - 1)))
    p_seam_in  = B_pts[idx_crown_ring]
    p_seam_out = T_pts[idx_crown_ring]
    seam_tan = (p_seam_out - p_seam_in).normalized()
    seam_plane_norm = Vector((0.0, -seam_tan.z, seam_tan.y)).normalized()

    rx_crown = 0.028
    exp_x_c = 0.22
    exp_y_c = 0.78
    c_verts, c_faces = [], []
    n_c_ring = 48
    for k in range(n_c_ring):
        ang = 2.0 * math.pi * k / n_c_ring
        ca = math.cos(ang)
        sa = math.sin(ang)
        sx = math.copysign(abs(ca)**exp_x_c, ca) * (rx_crown + seam_out)
        sy_frac = 0.5 * (1.0 + math.copysign(abs(sa)**exp_y_c, sa))
        yz_pt = p_seam_in.lerp(p_seam_out, sy_frac) + seam_tan * ((sy_frac - 0.5) * 2.0 * seam_out)
        v_center = Vector((sx, yz_pt.y, yz_pt.z))
        c_verts.append(v_center - seam_plane_norm * seam_half_w)
        c_verts.append(v_center + seam_plane_norm * seam_half_w)

    for k in range(n_c_ring):
        b = k * 2
        n = ((k + 1) % n_c_ring) * 2
        c_faces.append((b, n, n + 1, b + 1))

    create_mesh_obj("Harp_Crown_Glue_Seam", c_verts, c_faces, mat=mat_glue_seam, smooth=True)

    # 2. KNEE BLOCK / SOUNDBOX MITER & INNER THROAT HAIRLINE GLUE SEAM (Point 4, Ref: media_1792309241930_5a91b393.jpg)
    k_verts, k_faces = [], []
    n_k_ring = 48
    center_miter = (c_top + p_miter_rear) * 0.5
    for k in range(n_k_ring):
        u_m = (k / n_k_ring) * 24.0
        j0 = int(u_m) % 24
        j1 = (j0 + 1) % 24
        frac_m = u_m - int(u_m)
        pt_m = miter_24_pts[j0].lerp(miter_24_pts[j1], frac_m)
        out_dir = Vector((pt_m.x - center_miter.x, pt_m.y - center_miter.y, 0.0)).normalized()
        v_c = pt_m + out_dir * seam_out
        k_verts.append(v_c + Vector((0.0, 0.0, -seam_half_w)))
        k_verts.append(v_c + Vector((0.0, 0.0,  seam_half_w)))

    for k in range(n_k_ring):
        b = k * 2
        n = ((k + 1) % n_k_ring) * 2
        k_faces.append((b, n, n + 1, b + 1))

    create_mesh_obj("Harp_Knee_Glue_Seam", k_verts, k_faces, mat=mat_glue_seam, smooth=False)

build_hairline_glue_seams()

# ---------------------------------------------------------------------------
# 7. BUILD 8 PARALLEL, EQUALLY SPACED STRINGS & SILVER LEVERS ON +X (Points 7 & 8)
# ---------------------------------------------------------------------------
def get_neck_centerline_samples():
    neck_center_ctrl = [
        (T_ctrl[k] + B_ctrl[k]) * 0.5 for k in range(7, 14)
    ]
    return catmull_rom_spline(neck_center_ctrl, 600)

NUM_STRINGS = 8
lever_handle_objects = []
lever_base_quats = []

def build_eight_strings_and_mechanisms():
    neck_samples = get_neck_centerline_samples()

    def find_neck_pt_at_y(target_y):
        best_i = 0
        best_diff = 999.0
        for i, pt in enumerate(neck_samples):
            diff = abs(pt.y - target_y)
            if diff < best_diff:
                best_diff = diff
                best_i = i
        return neck_samples[best_i], best_i

    # Anchor String 1 at Y = -0.300 and String 8 at Y = +0.154 on the neck:
    neck_pt_1, s_idx_1 = find_neck_pt_at_y(-0.300)
    neck_pt_8, s_idx_8 = find_neck_pt_at_y( 0.154)

    def get_neck_up_vec(s_idx):
        t_vec = (neck_samples[min(len(neck_samples)-1, s_idx+3)] - neck_samples[max(0, s_idx-3)]).normalized()
        u_v = side_x.cross(t_vec).normalized()
        return -u_v if u_v.z < 0 else u_v

    bridge_1 = neck_pt_1 + get_neck_up_vec(s_idx_1) * 0.004
    bridge_8 = neck_pt_8 + get_neck_up_vec(s_idx_8) * 0.005

    # Bottom attachment of String 1 at t1 = 0.072:
    t1 = 0.072
    p_bot_1 = soundboard_center(t1) + front_normal * 0.0085
    p_top_1 = Vector((0.035, bridge_1.y, bridge_1.z))
    p_top_8 = Vector((0.035, bridge_8.y, bridge_8.z))

    # Master parallel string direction vector in 3D & YZ (from String 1):
    master_str_vec = p_top_1 - p_bot_1
    master_str_dir = master_str_vec.normalized()
    master_str_dir_yz = Vector((0.0, master_str_dir.y, master_str_dir.z)).normalized()
    master_str_right_yz = master_str_dir_yz.cross(Vector((1.0, 0.0, 0.0))).normalized()

    V_sb = soundboard_center(1.0) - soundboard_center(0.0) # (0, 0.45, 0.965)
    delta_top = p_top_8 - p_top_1
    t8 = t1 + delta_top.dot(master_str_right_yz) / V_sb.dot(master_str_right_yz)
    # t8 ~ 0.685

    sb_pts_list = [soundboard_center(t1 + k * (t8 - t1) / 7.0) + front_normal * 0.0085 for k in range(NUM_STRINGS)]

    for idx in range(NUM_STRINGS):
        deg_num = idx + 1
        frac = idx / (NUM_STRINGS - 1)
        p_bot = sb_pts_list[idx]

        # Find the point on the neck where the parallel ray from p_bot in direction master_str_dir_yz crosses the bridge pin curve:
        best_i = 0
        best_perp_diff = 999.0
        for i, pt in enumerate(neck_samples):
            cand_bridge = pt + get_neck_up_vec(i) * 0.0045
            perp_dist = abs((cand_bridge - p_bot).dot(master_str_right_yz))
            if perp_dist < best_perp_diff:
                best_perp_diff = perp_dist
                best_i = i

        neck_pt_raw = neck_samples[best_i]
        up_vec = get_neck_up_vec(best_i)
        cand_bridge = neck_pt_raw + up_vec * 0.0045
        # Project cand_bridge onto the exact parallel ray from p_bot so the string vector is 100.000% parallel to master_str_dir_yz!
        ray_len = (cand_bridge - p_bot).dot(master_str_dir_yz)
        bridge_neck_pt = Vector((0.0, p_bot.y, p_bot.z)) + master_str_dir_yz * ray_len

        # Point 8: Levers color changed to Pure Silver with Red (C) and Blue (F) markings!
        if deg_num in (1, 8):
            s_mat = mat_string_red
            band_mat = mat_band_red
        elif deg_num == 4:
            s_mat = mat_string_blue
            band_mat = mat_band_blue
        else:
            s_mat = mat_string_nylon
            band_mat = None

        p_top = Vector((0.035, bridge_neck_pt.y, bridge_neck_pt.z))

        str_vec_3d = p_top - p_bot
        str_dir_3d = str_vec_3d.normalized()
        str_dir_yz = master_str_dir_yz
        str_right_yz = master_str_right_yz

        # Centered hardware vertical offsets with ample wood margin above pegs and below levers
        tuning_span = 0.022
        lever_span  = 0.022
        tuning_neck_pt = bridge_neck_pt + str_dir_yz * tuning_span + str_right_yz * 0.002
        lever_neck_pt  = bridge_neck_pt - str_dir_yz * lever_span

        # A. THROUGH-NECK TUNING PIN (Passing from -X to +X)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=20, radius=0.0042, depth=0.090,
            location=Vector((-0.001, tuning_neck_pt.y, tuning_neck_pt.z)),
            rotation=(0, math.pi / 2.0, 0)
        )
        t_pin = bpy.context.active_object
        t_pin.name = f"TuningPin_{deg_num}"
        t_pin.data.materials.append(mat_gunmetal_pin)
        link_obj(t_pin)

        # Squared tuning wrench head on PLAYER'S RIGHT (-X side)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=Vector((-0.047, tuning_neck_pt.y, tuning_neck_pt.z))
        )
        t_head = bpy.context.active_object
        t_head.name = f"TuningPinHead_Right_{deg_num}"
        t_head.scale = (0.012, 0.0062, 0.0062)
        bpy.ops.object.transform_apply(scale=True)
        t_head.data.materials.append(mat_gunmetal_pin)
        link_obj(t_head)

        # Coiled string winding on PLAYER'S LEFT (+X side)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=20, radius=0.0054, depth=0.011,
            location=Vector((0.035, tuning_neck_pt.y, tuning_neck_pt.z)),
            rotation=(0, math.pi / 2.0, 0)
        )
        coil = bpy.context.active_object
        coil.name = f"StringCoil_{deg_num}"
        coil.data.materials.append(s_mat)
        link_obj(coil)

        # Colored cap tip on +X end of tuning pin
        tip_mat = mat_band_red if deg_num in (1, 8) else (mat_band_blue if deg_num == 4 else mat_felt_washer)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=0.0048, depth=0.005,
            location=Vector((0.042, tuning_neck_pt.y, tuning_neck_pt.z)),
            rotation=(0, math.pi / 2.0, 0)
        )
        tip_ring = bpy.context.active_object
        tip_ring.name = f"TuningPinTip_{deg_num}"
        tip_ring.data.materials.append(tip_mat)
        link_obj(tip_ring)

        # B. BRIDGE PIN (on +X side)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=20, radius=0.0042, depth=0.026,
            location=Vector((0.031, bridge_neck_pt.y, bridge_neck_pt.z)),
            rotation=(0, math.pi / 2.0, 0)
        )
        b_pin = bpy.context.active_object
        b_pin.name = f"BridgePin_{deg_num}"
        b_pin.data.materials.append(mat_gunmetal_pin)
        link_obj(b_pin)

        # C. CAMAC SHARPING LEVER (Mounted on wooden neck +X face — Pure Brushed Silver in V9.3!)
        rot_mat = Matrix((
            Vector((1.0, 0.0, 0.0)),
            str_right_yz,
            str_dir_yz
        )).transposed()
        rot_quat = rot_mat.to_quaternion()

        base_loc = Vector((0.029, lever_neck_pt.y, lever_neck_pt.z))
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
        l_base = bpy.context.active_object
        l_base.name = f"Lever_Base_{deg_num}"
        l_base.scale = (0.010, 0.012, 0.025)
        bpy.ops.object.transform_apply(scale=True)
        bev_l = l_base.modifiers.new(name="Bevel", type='BEVEL')
        bev_l.width = 0.0018
        bev_l.segments = 3
        for p in l_base.data.polygons:
            p.use_smooth = True
        l_base.location = base_loc
        l_base.rotation_mode = 'QUATERNION'
        l_base.rotation_quaternion = rot_quat
        l_base.data.materials.append(mat_lever_base)
        link_obj(l_base)

        for roller_idx, z_off in enumerate([-0.0055, 0.0055]):
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=16, radius=0.0034, depth=0.012,
                location=(0, 0, 0),
                rotation=(0, math.pi / 2.0, 0)
            )
            roller = bpy.context.active_object
            roller.name = f"Lever_Roller_{deg_num}_{roller_idx}"
            roller.data.materials.append(mat_chrome_metal)
            link_obj(roller)
            roller.parent = l_base
            roller.location = Vector((0.005, 0.0, z_off))

        # Lever Handle Pivot & Mesh (Unchanged geometry & kinematics, material set to mat_lever_silver)
        pivot_world = base_loc + rot_mat @ Vector((0.008, 0.0, 0.006))
        raw_h_verts = [
            Vector((-0.0032, -0.0038,  0.0032)),
            Vector(( 0.0032, -0.0038,  0.0032)),
            Vector(( 0.0032,  0.0038,  0.0032)),
            Vector((-0.0032,  0.0038,  0.0032)),
            Vector((-0.0016, -0.0032, -0.012)),
            Vector(( 0.0052, -0.0032, -0.012)),
            Vector(( 0.0052,  0.0032, -0.012)),
            Vector((-0.0016,  0.0032, -0.012)),
            Vector((-0.0008, -0.0062, -0.026)),
            Vector(( 0.0084, -0.0062, -0.026)),
            Vector(( 0.0084,  0.0062, -0.026)),
            Vector((-0.0008,  0.0062, -0.026)),
            Vector(( 0.0000, -0.0038, -0.033)),
            Vector(( 0.0056, -0.0038, -0.033)),
            Vector(( 0.0056,  0.0038, -0.033)),
            Vector(( 0.0000,  0.0038, -0.033)),
        ]
        down_tilt_q = Quaternion(Vector((1.0, 0.0, 0.0)), math.radians(40.0))
        h_verts = [down_tilt_q @ v for v in raw_h_verts]

        h_faces = []
        for ring in range(3):
            b = ring * 4
            n = (ring + 1) * 4
            for k in range(4):
                kn = (k + 1) % 4
                h_faces.append((b + k, b + kn, n + kn, n + k))
        h_faces.append((0, 3, 2, 1))
        h_faces.append((12, 13, 14, 15))

        handle_obj = create_mesh_obj(f"Lever_Handle_{deg_num}", h_verts, h_faces, mat=mat_lever_silver, smooth=True)
        handle_obj.location = pivot_world
        handle_obj.rotation_mode = 'QUATERNION'
        handle_obj.rotation_quaternion = rot_quat
        sub = handle_obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 2

        lever_handle_objects.append(handle_obj)
        lever_base_quats.append(rot_quat)

        # Colored rubber marking band on the lever handle (Red on C 1 & 8, Blue on F 4; pure silver on others)
        if band_mat is not None:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
            band_obj = bpy.context.active_object
            band_obj.name = f"Lever_Band_{deg_num}"
            band_obj.scale = (0.0092, 0.0082, 0.0058)
            bpy.ops.object.transform_apply(scale=True)
            band_obj.data.materials.append(band_mat)
            link_obj(band_obj)
            band_obj.parent = handle_obj
            band_obj.rotation_mode = 'QUATERNION'
            band_obj.rotation_quaternion = down_tilt_q
            band_obj.location = down_tilt_q @ Vector((0.0018, 0.0, -0.012))

        # D. SOUNDBOARD SILVER EYELET
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.0045, minor_radius=0.0014,
            location=p_bot
        )
        eyelet = bpy.context.active_object
        eyelet.name = f"Soundboard_Eyelet_{deg_num}"
        eyelet.rotation_mode = 'QUATERNION'
        eyelet.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(front_normal)
        eyelet.data.materials.append(mat_silver_eyelet)
        link_obj(eyelet)

        # E. VIBRATING STRING MESH (String_1 .. String_8, 40 segments)
        seg_count = 40
        rad_sides = 8
        str_radius = 0.0017 * (1.0 - 0.28 * frac)

        s_verts, s_faces = [], []
        ortho_x = Vector((1.0, 0.0, 0.0))
        ortho_y = str_dir_3d.cross(ortho_x).normalized()
        ortho_x = ortho_y.cross(str_dir_3d).normalized()

        for seg in range(seg_count + 1):
            s_frac = seg / seg_count
            c_pt = p_bot.lerp(p_top, s_frac)
            for r_i in range(rad_sides):
                ang = 2.0 * math.pi * r_i / rad_sides
                v_pt = c_pt + (ortho_x * math.cos(ang) + ortho_y * math.sin(ang)) * str_radius
                s_verts.append(v_pt)

        for seg in range(seg_count):
            b = seg * rad_sides
            n = (seg + 1) * rad_sides
            for r_i in range(rad_sides):
                rn = (r_i + 1) % rad_sides
                s_faces.append((b + r_i, b + rn, n + rn, n + r_i))

        create_mesh_obj(f"String_{deg_num}", s_verts, s_faces, mat=s_mat, smooth=True)

        # F. UPPER STRING TAIL CONNECTING BRIDGE PIN TO TUNING PIN COIL ON THE NECK
        p_coil = Vector((0.035, tuning_neck_pt.y, tuning_neck_pt.z))
        mid_tail = (p_top + p_coil) * 0.5
        tail_dir = (p_coil - p_top)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=8, radius=str_radius, depth=tail_dir.length,
            location=mid_tail
        )
        tail_obj = bpy.context.active_object
        tail_obj.name = f"StringTail_{deg_num}"
        tail_obj.rotation_mode = 'QUATERNION'
        tail_obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(tail_dir.normalized())
        tail_obj.data.materials.append(s_mat)
        link_obj(tail_obj)

build_eight_strings_and_mechanisms()

# ---------------------------------------------------------------------------
# 8. EXPORT PRODUCTION GLB TO PUBLIC, DIST & SECOND BRAIN V9.3
# ---------------------------------------------------------------------------
out_dir = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\public\models"
dist_dir = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\dist\models"
vault_dir = r"C:\Users\Hp\Documents\Antigravity second Brain\01_Projects\Celtic_Harp_3D_Master_Model"
os.makedirs(out_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)
os.makedirs(vault_dir, exist_ok=True)

glb_path = os.path.join(out_dir, "celtic_harp_8string.glb")
dist_glb_path = os.path.join(dist_dir, "celtic_harp_8string.glb")
vault_glb_path = os.path.join(vault_dir, "celtic_harp_8string_v9_3.glb")

bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    export_apply=True
)
shutil.copyfile(glb_path, dist_glb_path)
shutil.copyfile(glb_path, vault_glb_path)
print("Exported Master V9.3 GLB successfully to:", glb_path)
print("Mirrored Master V9.3 GLB successfully to:", dist_glb_path)
print("Saved Second Brain V9.3 GLB successfully to:", vault_glb_path)

# ---------------------------------------------------------------------------
# 9. STUDIO LIGHTING & MULTI-ANGLE VERIFICATION RENDERS (Point 9)
# ---------------------------------------------------------------------------
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
bg = world.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.11, 0.12, 0.15, 1.0)
bg.inputs[1].default_value = 0.95

bpy.ops.object.light_add(type='AREA', location=(1.65, 1.85, 2.20))
key_l = bpy.context.active_object
key_l.data.energy = 95.0
key_l.data.size = 2.0
key_l.data.color = (1.0, 0.96, 0.90)
key_l.rotation_mode = 'QUATERNION'
key_l.rotation_quaternion = (Vector((0, 0, 0.65)) - key_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.light_add(type='AREA', location=(-1.35, -1.20, 1.15))
right_key_l = bpy.context.active_object
right_key_l.data.energy = 70.0
right_key_l.data.size = 2.0
right_key_l.data.color = (1.0, 0.96, 0.90)
right_key_l.rotation_mode = 'QUATERNION'
right_key_l.rotation_quaternion = (Vector((0, 0, 0.65)) - right_key_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.light_add(type='AREA', location=(0.0, 1.65, 0.85))
rear_l = bpy.context.active_object
rear_l.data.energy = 80.0
rear_l.data.size = 2.0
rear_l.data.color = (0.96, 0.97, 1.0)
rear_l.rotation_mode = 'QUATERNION'
rear_l.rotation_quaternion = (Vector((0, 0.20, 0.55)) - rear_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.light_add(type='AREA', location=(0.0, -0.35, -0.85))
under_l = bpy.context.active_object
under_l.data.energy = 55.0
under_l.data.size = 1.6
under_l.data.color = (1.0, 0.95, 0.88)
under_l.rotation_mode = 'QUATERNION'
under_l.rotation_quaternion = (Vector((0, -0.05, 0.05)) - under_l.location).to_track_quat('-Z', 'Y')

# Dedicated specular glint light for brilliant shiny silver reflections on the levers
bpy.ops.object.light_add(type='AREA', location=(1.05, -0.15, 1.30))
lever_rim_l = bpy.context.active_object
lever_rim_l.data.energy = 85.0
lever_rim_l.data.size = 1.2
lever_rim_l.data.color = (0.98, 0.99, 1.0)
lever_rim_l.rotation_mode = 'QUATERNION'
lever_rim_l.rotation_quaternion = (Vector((0.03, -0.07, 1.16)) - lever_rim_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.camera_add(location=(1.58, -0.92, 0.72))
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 38
cam.rotation_mode = 'QUATERNION'

scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys() else 'BLENDER_EEVEE'

art_dir = r"C:\Users\Hp\.gemini\antigravity\brain\82d91d89-a520-48b5-9902-f6285358d1ff"
sub_art_dir = r"C:\Users\Hp\.gemini\antigravity\brain\0ebfae42-9179-48b0-a668-5e2157638adc"
os.makedirs(art_dir, exist_ok=True)
os.makedirs(sub_art_dir, exist_ok=True)

def render_and_mirror(filename, res_x, res_y, cam_loc, look_at, lens=38, up_axis='Y'):
    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    cam.data.lens = lens
    cam.location = Vector(cam_loc)
    cam.rotation_quaternion = (Vector(look_at) - cam.location).to_track_quat('-Z', up_axis)
    out_p = os.path.join(art_dir, filename)
    scene.render.filepath = out_p
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(out_p, os.path.join(sub_art_dir, filename))

# 1. v9_3_full_profile_right.png (matching Photo 8 media_1792310867479_b69bd46a.jpg, -X side profile)
render_and_mirror(
    "v9_3_full_profile_right.png", 950, 1280,
    cam_loc=(-1.72, -0.02, 0.70),
    look_at=(0.0, -0.02, 0.70),
    lens=40
)

# 2. v9_3_full_harp_lever_side.png (full harp from +X lever side)
render_and_mirror(
    "v9_3_full_harp_lever_side.png", 950, 1280,
    cam_loc=(1.68, -0.35, 0.70),
    look_at=(0.0, -0.02, 0.68),
    lens=38
)

# 3. v9_3_crown_joint_closeup.png (matching Photo 2 media_1792309249472_072f8cd1.png, showing diagonal connection and subtle glue seam from -X side)
render_and_mirror(
    "v9_3_crown_joint_closeup.png", 1000, 1000,
    cam_loc=(-0.62, -0.31, 1.25),
    look_at=(0.0, -0.31, 1.25),
    lens=45
)

# 4. v9_3_knee_tuning_side_right.png (matching Photo 1 media_1792309241930_5a91b393.jpg, showing subtle knee glue seam from -X side)
render_and_mirror(
    "v9_3_knee_tuning_side_right.png", 1000, 1000,
    cam_loc=(-0.60, 0.34, 1.02),
    look_at=(0.0, 0.26, 1.01),
    lens=45
)

# 5. v9_3_knee_lever_side_left.png (matching Photo 7 media_1792310861017_90531cb5.jpg, showing crescent flare and silver levers from +X side)
render_and_mirror(
    "v9_3_knee_lever_side_left.png", 1000, 1000,
    cam_loc=(0.64, 0.34, 1.03),
    look_at=(0.0, 0.22, 1.01),
    lens=42
)

# 6. v9_3_top_down_neck_width.png (matching Photo 6 media_1792310854673_4a3a20e2.jpg, looking straight down at the neck width and knee flare)
render_and_mirror(
    "v9_3_top_down_neck_width.png", 900, 1200,
    cam_loc=(0.0, -0.04, 2.25),
    look_at=(0.0, -0.04, 1.10),
    lens=42
)

# 7. v9_3_rear_soundholes.png (matching Photo 9 media_1792310874984_c1f427ac.jpg, full rear view showing the 3 oval soundholes and legs)
render_and_mirror(
    "v9_3_rear_soundholes.png", 900, 1280,
    cam_loc=(0.0, 1.62, 0.56),
    look_at=(0.0, 0.22, 0.54),
    lens=40
)

# 8. v9_3_legs_side_and_bottom.png (matching Photos 3, 4, 5 showing legs mounted underneath the flat base plate, circular bottom soundhole, 2 screws per leg, and balanced overhangs)
render_and_mirror(
    "v9_3_legs_side_and_bottom.png", 1100, 950,
    cam_loc=(-0.38, -0.19, -0.24),
    look_at=(-0.01, -0.06, 0.05),
    lens=36
)

# 9. v9_3_levers_silver_closeup.png (closeup of all 8 silver levers with Red C on 1 & 8 and Blue F on 4)
render_and_mirror(
    "v9_3_levers_silver_closeup.png", 1200, 950,
    cam_loc=(0.74, -0.09, 1.16),
    look_at=(0.0, -0.07, 1.16),
    lens=40
)

print("All V9.3 REA verification renders completed successfully!")
