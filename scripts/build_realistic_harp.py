r"""
BLENDER 5.2 PHOTOREALISTIC 8-STRING CELTIC LEVER HARP GENERATOR (V9.2 REA MASTER)
Engineered via Reverse Engineering Anything (REA) Blueprint:
1. Unchanged Verified Soundbox, Soundboard, Purfling, Walnut Rib, Base Cradle, and Arched Legs.
2. Two-Rail Sweep Master Lutherie Frame (Harp_Harmonic_Frame) with Zero-Twist Miter Topology:
   - Explicit Outer/Top Rail T(u) and Inner/Bottom Rail B(u) eliminating normal twist and inner-radius kinks.
   - Angularly aligned 24-vertex miter ring (j=0 at +X side, j=6 at rear center, j=12 at -X side,
     j=15 at -X front corner, j=18 at front center c_top, j=21 at +X front corner) eliminating the 45-deg twist pinch.
   - Soundbox top miter plane placed at the authentic luthier throat level (t_miter = 0.948, Z = 0.990),
     right at the level of the underside of the harmonic neck, above the tapered walnut rib tip.
   - Seamless Crown Joint: Pure convex forepillar outer contour and smooth inner throat arch (apex at Y = -0.316,
     well to the left of String 1, with constant neck thickness under Strings 1..8).
   - Authentic Luthier Knee Joint:
     * Right/Tuning Side (-X): Smooth, continuous 1-piece taper into the rounded knee dome, 100% flush with soundbox staves.
     * Left/Lever Side (+X): Authentic carved crescent cove cutout where the flat neck face meets the rounded knee cheek.
     * Rear View (+Y): 100% symmetrical rounded dome crowning the 5 rear staves with zero overhang and zero gap.
     * Underside: Smooth, horizontal-to-concave throat curve meeting the soundboard top face with zero hole or gap.
3. Authentic V7.1 3-Tier Neck-Mounted Hardware on Player's Left (+X):
   - Through-neck TuningPin with square wrench head on Player's Right (-X).
   - Coiled StringCoil, colored TuningPinTip (Red C, Blue F, Felt others), and StringTail on Player's Left (+X).
   - Gunmetal BridgePin in the center of the neck face (+X).
   - Dark anodized Camac Lever_Base with bevel, dual chrome Lever_Rollers, brushed metallic Lever_Handle, and colored Lever_Band (+X).
4. Verified Lever Kinematics:
   - Resting DOWN pose: angled +40 deg to the right of the downward string into inter-string space.
   - Engaged UP pose: rotates +1.75 rad (+100.3 deg) around local +X to point +39.7 deg to the right of the upward string (collinear with user's blue UP line).
5. Equidistant Parallel Strings (1 C to 8 C):
   - t1 = 0.195, t8 = 0.775 on the soundboard and equidistant arc steps on the neck (String 1 at Y = -0.302 to String 8 at Y = 0.154).
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

# ---------------------------------------------------------------------------
# 2. WOOD TEXTURES & PBR MATERIALS
# ---------------------------------------------------------------------------
def create_blond_maple_image(name="Tex_BlondMaple", width=512, height=512):
    img = bpy.data.images.new(name=name, width=width, height=height, alpha=False)
    pixels = [0.0] * (width * height * 4)
    base_rgb      = (0.85, 0.71, 0.50)
    dark_rgb      = (0.74, 0.58, 0.38)
    highlight_rgb = (0.92, 0.80, 0.60)

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

def make_pbr_mat(name, base_color, roughness=0.25, metallic=0.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission and "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

mat_maple_wood    = make_textured_mat("Harp_BlondMaple", img_maple, roughness=0.24, coat=0.32, specular=0.40)
mat_purfling      = make_textured_mat("Harp_Inlaid_Purfling", img_purfling, roughness=0.22, coat=0.40, specular=0.45)
mat_walnut_rib    = make_pbr_mat("Harp_DarkWalnut_Rib", (0.12, 0.065, 0.035), roughness=0.32, metallic=0.02)
mat_dark_cavity   = make_pbr_mat("Harp_Interior_DarkCavity", (0.015, 0.012, 0.010), roughness=0.95, metallic=0.0)
mat_gunmetal_pin  = make_pbr_mat("Hardware_Gunmetal_Pin", (0.14, 0.14, 0.16), roughness=0.26, metallic=0.90)
mat_lever_black   = make_pbr_mat("Hardware_Anodized_Black", (0.06, 0.06, 0.07), roughness=0.24, metallic=0.88)
mat_lever_handle  = make_pbr_mat("Hardware_Brushed_BrassChrome", (0.76, 0.72, 0.62), roughness=0.16, metallic=0.94)
mat_chrome_metal  = make_pbr_mat("Hardware_Polished_Chrome", (0.92, 0.94, 0.97), roughness=0.08, metallic=0.98)
mat_silver_eyelet = make_pbr_mat("Hardware_Silver_Eyelet", (0.85, 0.86, 0.88), roughness=0.18, metallic=0.92)
mat_felt_washer   = make_pbr_mat("Hardware_Felt_Washer", (0.38, 0.38, 0.40), roughness=0.75, metallic=0.10)
mat_band_red      = make_pbr_mat("Lever_ColorBand_Red", (0.90, 0.06, 0.08), roughness=0.22, metallic=0.05, emission=(0.4, 0.02, 0.02), emission_strength=0.2)
mat_band_blue     = make_pbr_mat("Lever_ColorBand_Blue", (0.06, 0.28, 0.92), roughness=0.22, metallic=0.05, emission=(0.02, 0.08, 0.4), emission_strength=0.2)
mat_string_red    = make_pbr_mat("String_Red_C", (0.88, 0.08, 0.10), roughness=0.15, metallic=0.05, emission=(0.35, 0.02, 0.02), emission_strength=0.18)
mat_string_blue   = make_pbr_mat("String_Blue_F", (0.08, 0.28, 0.90), roughness=0.15, metallic=0.05, emission=(0.02, 0.08, 0.40), emission_strength=0.18)
mat_string_nylon  = make_pbr_mat("String_Clear_Nylon", (0.95, 0.93, 0.88), roughness=0.12, metallic=0.05, emission=(0.22, 0.20, 0.16), emission_strength=0.12)

# ---------------------------------------------------------------------------
# 3. SOUNDBOX PARAMETRIC GEOMETRY (VERIFIED & LOCKED)
# ---------------------------------------------------------------------------
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

# Horizontal Luthier Miter Plane at Z ~ 0.988m (t_front = 0.948 at d=0, t_rear = 0.986 at d=1):
# Because soundboard_center(t), hw(t), and depth(t) are pure linear functions of t, each stave edge is a straight 3D line,
# so extending t from 0.948 at the front throat to 0.986 at the rear stave keeps the exact same 3D stave planes
# while making the miter joint horizontally level (matching WhatsApp Image 2026-10-16 at 2.36.59 PM (1).jpeg)!
t_miter = 0.948
t_miter_rear = 0.986
c_top = soundboard_center(t_miter) # (0.0, 0.2866, 0.9898)
hw_top, depth_top = soundbox_dimensions(t_miter) # hw=0.0545, depth=0.0991
c_rear_top = soundboard_center(t_miter_rear)
hw_rear_top, depth_rear_top = soundbox_dimensions(t_miter_rear)
p_miter_rear = c_rear_top + back_normal * depth_rear_top # (0.0, 0.3909, 0.9858)

# Base normalized cross-section fractions (constant for all t):
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
    c_f = soundboard_center(t_miter * s_frac)
    t_r = t_miter_rear * s_frac
    c_r = soundboard_center(t_r) + back_normal * soundbox_dimensions(t_r)[1]
    throat_taper = 0.15 * smoothstep(0.60, 1.00, s_frac)
    ring = [None] * 24
    for j in range(24):
        d_f = base_24_d_frac[j]
        front_fac = max(0.0, (0.42 - d_f) / 0.42)
        x_f = base_24_x_frac[j] * (1.0 - throat_taper * front_fac)
        t_j = (t_miter + (t_miter_rear - t_miter) * d_f) * s_frac
        hw_j, _ = soundbox_dimensions(t_j)
        ring[j] = c_f.lerp(c_r, d_f) + side_x * (hw_j * x_f)
    return ring

miter_24_pts = get_soundbox_ring_24(1.0)
miter_24_x_frac = []
miter_24_d_frac = list(base_24_d_frac)
for j in range(24):
    # Scale x_frac relative to hw_top so at u=1.0, cur_rx * miter_24_x_frac[j] == miter_24_pts[j].x!
    miter_24_x_frac.append(miter_24_pts[j].x / hw_top)

# 2-pass Laplacian-smoothed stave profile for the rounded knee dome:
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
# 4. BUILD SOUNDBOX (FACE + PURFLING + RIB + SOUNDHOLES; STAVES WELDED INTO FRAME)
# ---------------------------------------------------------------------------
def build_soundbox():
    steps_z = 48
    # Note: The 8-stave maple soundbox body is lofted directly as one unbroken 24-vertex mesh
    # with Harp_Harmonic_Frame so there is zero mesh/normal/UV seam at the knee joint!

    # Front Soundboard Face
    sbd_verts, sbd_faces, sbd_uvs = [], [], []
    for i in range(steps_z + 1):
        s_f = i / steps_z
        t = s_f * t_miter
        s_top_flush = 1.0 - 0.90 * smoothstep(0.90, t_miter, t)
        c = soundboard_center(t) + front_normal * (0.0015 * s_top_flush)
        hw, _ = soundbox_dimensions(t)
        hw *= (1.0 - 0.15 * smoothstep(0.60, 1.00, s_f))
        sbd_verts.append(c + Vector((-hw * 0.98, 0, 0)))
        sbd_verts.append(c + Vector(( hw * 0.98, 0, 0)))
        sbd_uvs.extend([(0.05, t * 0.96 + 0.02), (0.95, t * 0.96 + 0.02)])
    for i in range(steps_z):
        b = i * 2
        sbd_faces.append((b, b + 1, b + 3, b + 2))
    create_mesh_obj("Harp_Soundboard_Face", sbd_verts, sbd_faces, uvs=sbd_uvs, mat=mat_maple_wood, smooth=True)

    # Edge Rails (tapering flush at t_miter so zero 5.5mm block protrudes at the knee throat)
    for side in (-1, 1):
        rv, rf, ruv = [], [], []
        for i in range(steps_z + 1):
            s_f = i / steps_z
            t = s_f * t_miter
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
            ruv.extend([(0.0, t), (0.3, t), (0.6, t), (1.0, t)])
        for i in range(steps_z):
            b = i * 4
            n = (i + 1) * 4
            for k in range(4):
                kn = (k + 1) % 4
                rf.append((b + k, b + kn, n + kn, n + k))
        create_mesh_obj(f"Harp_Soundboard_EdgeRail_{side}", rv, rf, uvs=ruv, mat=mat_maple_wood, smooth=False)

    # Diamond Purfling Inlays
    for side in (-1, 1):
        pv, pf, puv = [], [], []
        for i in range(steps_z + 1):
            s_f = i / steps_z
            t = s_f * t_miter
            s_top_flush = 1.0 - 0.90 * smoothstep(0.89, t_miter, t)
            c = soundboard_center(t) + front_normal * (0.0030 * s_top_flush)
            hw, _ = soundbox_dimensions(t)
            hw *= (1.0 - 0.15 * smoothstep(0.60, 1.00, s_f))
            x1 = side * (hw - 0.0112)
            x2 = side * (hw - 0.0242)
            if side == 1:
                x1, x2 = x2, x1
            pv.extend([c + Vector((x1, 0, 0)), c + Vector((x2, 0, 0))])
            puv.extend([(0.0, t), (1.0, t)])
        for i in range(steps_z):
            b = i * 2
            pf.append((b, b + 1, b + 3, b + 2))
        create_mesh_obj(f"Harp_Diamond_Purfling_{side}", pv, pf, uvs=puv, mat=mat_purfling, smooth=False)

    # Dark Walnut String Rib (tapering cleanly to a point at t = 0.925 just below the neck throat)
    rib_steps = 52
    rib_verts, rib_faces, rib_uvs = [], [], []
    for i in range(rib_steps + 1):
        t = (i / rib_steps) * 0.925
        c = soundboard_center(t) + front_normal * 0.0015
        top_taper = 1.0
        if t > 0.86:
            top_taper = max(0.12, math.sqrt(max(0.0, 1.0 - ((t - 0.86) / 0.065)**2)))
        cradle_fac = max(0.0, (0.14 - t) / 0.14)
        rib_half_w = (0.0165 * (1.0 - 0.28 * t) * top_taper) + 0.0085 * cradle_fac
        rib_h      = (0.0075 * top_taper) + 0.0055 * cradle_fac
        lip_h      = rib_h + 0.0095 * (cradle_fac**1.2)
        rib_verts.extend([
            c + Vector((-rib_half_w, 0, 0)),
            c + Vector(( rib_half_w, 0, 0)),
            c + Vector(( rib_half_w * 0.92, 0, 0)) + front_normal * lip_h,
            c + Vector(( rib_half_w * 0.62, 0, 0)) + front_normal * rib_h,
            c + Vector((-rib_half_w * 0.62, 0, 0)) + front_normal * rib_h,
            c + Vector((-rib_half_w * 0.92, 0, 0)) + front_normal * lip_h,
        ])
        for k in range(6):
            rib_uvs.append((k / 5.0, t))
    for i in range(rib_steps):
        b = i * 6
        n = (i + 1) * 6
        for k in range(6):
            kn = (k + 1) % 6
            rib_faces.append((b + k, b + kn, n + kn, n + k))
    rib_faces.append(tuple(reversed(range(0, 6))))
    rib_faces.append(tuple(range(rib_steps * 6, (rib_steps + 1) * 6)))
    create_mesh_obj("Harp_Central_String_Rib", rib_verts, rib_faces, uvs=rib_uvs, mat=mat_walnut_rib, smooth=False)

    # 3 Rear Soundholes
    for idx, (t_hole, r_scale) in enumerate([(0.12, 0.72), (0.34, 0.90), (0.63, 1.05)]):
        c = soundboard_center(t_hole)
        hw, depth = soundbox_dimensions(t_hole)
        hole_pos = c + back_normal * (depth + 0.0008)
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.026 * r_scale, depth=0.006, location=hole_pos)
        hole = bpy.context.active_object
        hole.name = f"Harp_Rear_Soundhole_{idx+1}"
        hole.rotation_mode = 'QUATERNION'
        hole.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(back_normal)
        hole.scale = (0.72, 1.48, 1.0)
        hole.data.materials.append(mat_dark_cavity)
        link_obj(hole)

build_soundbox()

# ---------------------------------------------------------------------------
# 5. BUILD ARCHED LEGS (VERIFIED & LOCKED)
# ---------------------------------------------------------------------------
def build_sculpted_arched_legs():
    steps_y = 32
    y_front = -0.235
    y_back  =  0.125

    for side_idx, x_center in enumerate([-0.115, 0.115]):
        l_verts, l_faces, l_uvs = [], [], []
        for i in range(steps_y + 1):
            u = i / steps_y
            y = y_front + u * (y_back - y_front)
            if 0.20 < u < 0.80:
                arch_u = (u - 0.20) / 0.60
                z_bot = 0.032 * math.sin(arch_u * math.pi)
            else:
                z_bot = 0.0
            toe_curve = math.sin(u * math.pi)
            z_top = 0.034 + 0.056 * (toe_curve**0.75)
            if u < 0.08:
                tip_fac = math.sin((u / 0.08) * (math.pi * 0.5))
                z_top = z_bot + (z_top - z_bot) * (0.35 + 0.65 * tip_fac)
            elif u > 0.92:
                tip_fac = math.sin(((1.0 - u) / 0.08) * (math.pi * 0.5))
                z_top = z_bot + (z_top - z_bot) * (0.35 + 0.65 * tip_fac)

            x_cur = x_center * (1.0 + 0.08 * (1.0 - u))
            hw_leg = 0.022 * (0.92 + 0.12 * math.sin(u * math.pi))
            bevel_in = 0.004

            pts = [
                Vector((x_cur - hw_leg,            y, z_bot)),
                Vector((x_cur + hw_leg,            y, z_bot)),
                Vector((x_cur + hw_leg - bevel_in, y, z_top)),
                Vector((x_cur - hw_leg + bevel_in, y, z_top)),
            ]
            l_verts.extend(pts)
            for k in range(4):
                l_uvs.append((k / 3.0, u))

        for i in range(steps_y):
            b = i * 4
            n = (i + 1) * 4
            for k in range(4):
                kn = (k + 1) % 4
                l_faces.append((b + k, b + kn, n + kn, n + k))
        l_faces.append((0, 3, 2, 1))
        end_b = steps_y * 4
        l_faces.append((end_b, end_b + 1, end_b + 2, end_b + 3))

        create_mesh_obj(f"Harp_Leg_{side_idx+1}", l_verts, l_faces, uvs=l_uvs, mat=mat_maple_wood, smooth=True)

build_sculpted_arched_legs()

# ---------------------------------------------------------------------------
# 6. TWO-RAIL SWEEP MASTER HARP FRAME (Forepillar + Crown + Neck + Knee Dome)
# ---------------------------------------------------------------------------
p_fore_base = soundboard_center(0.042) + front_normal * 0.020

# 16 Synchronized Control Stations:
# Outer / Top Rail Control Points (T_ctrl):
T_ctrl = [
    p_fore_base + Vector((0.0, -0.024, -0.005)),  # 0: Forepillar base outer front
    Vector((0.0, -0.242, 0.360)),                 # 1: Forepillar lower outer
    Vector((0.0, -0.326, 0.680)),                 # 2: Forepillar mid outer
    Vector((0.0, -0.378, 1.000)),                 # 3: Forepillar upper outer
    Vector((0.0, -0.394, 1.215)),                 # 4: Crown approach outer (pure convex curve)
    Vector((0.0, -0.382, 1.328)),                 # 5: Crown front nose rounding
    Vector((0.0, -0.335, 1.368)),                 # 6: Crown crest apex over String 1
    Vector((0.0, -0.222, 1.328)),                 # 7: Neck top over String 2
    Vector((0.0, -0.080, 1.232)),                 # 8: Neck mid-upper top
    Vector((0.0,  0.048, 1.132)),                 # 9: Neck mid-lower top
    Vector((0.0,  0.155, 1.078)),                 # 10: Treble valley top (over String 8)
    Vector((0.0,  0.222, 1.090)),                 # 11: Rising out of valley into knee dome
    Vector((0.0,  0.292, 1.102)),                 # 12: Smooth rounded top crest of knee dome
    Vector((0.0,  0.355, 1.088)),                 # 13: Upper-rear 30-deg circular shoulder of dome
    Vector((0.0,  0.392, 1.055)),                 # 14: Mid-rear 65-deg circular arc of dome
    Vector((0.0,  0.4005, 1.018)),                # 15: Lower-rear tangent transition into rear stave
    p_miter_rear,                                 # 16: Exact rear soundbox miter edge (0.3909, 0.9858)
]

# Inner / Bottom Rail Control Points (B_ctrl):
# Synchronized 17 stations (0..16) rotating the cross-section uniformly (+83 -> +75 -> +63 -> +45 -> +25 -> +12 -> -2 deg)
B_ctrl = [
    p_fore_base + Vector((0.0,  0.024,  0.005)),  # 0: Forepillar base inner rear
    Vector((0.0, -0.188, 0.360)),                 # 1: Forepillar lower inner
    Vector((0.0, -0.264, 0.680)),                 # 2: Forepillar mid inner
    Vector((0.0, -0.312, 1.000)),                 # 3: Forepillar upper inner
    Vector((0.0, -0.326, 1.200)),                 # 4: Approaching inner crown throat
    Vector((0.0, -0.328, 1.268)),                 # 5: Inner throat upper curve
    Vector((0.0, -0.310, 1.282)),                 # 6: Inner throat apex (left of String 1)
    Vector((0.0, -0.245, 1.246)),                 # 7: Neck bottom under String 2 (parallel to T_ctrl[7])
    Vector((0.0, -0.115, 1.152)),                 # 8: Neck mid-upper bottom
    Vector((0.0,  0.025, 1.045)),                 # 9: Neck mid-lower bottom
    Vector((0.0,  0.145, 0.992)),                 # 10: Treble valley bottom (under String 8)
    Vector((0.0,  0.198, 0.990)),                 # 11: Smooth valley minimum gliding toward throat
    Vector((0.0,  0.238, 0.995)),                 # 12: Rising gently along inner throat curve
    Vector((0.0,  0.266, 1.001)),                 # 13: Rounded inner throat apex before soundboard
    Vector((0.0,  0.282, 1.002)),                 # 14: Curving over into soundboard slope
    Vector((0.0,  0.288, 0.997)),                 # 15: Descending tangent to soundboard
    c_top,                                        # 16: Exact front soundboard miter edge (0.2866, 0.9898)
]

num_arch_samples = 192
# True stave continuation phantom endpoints below t_miter_rear and t_miter for 100% C1 tangent continuity:
end_pt_T = soundboard_center(t_miter_rear - 0.035) + back_normal * soundbox_dimensions(t_miter_rear - 0.035)[1]
end_pt_B = soundboard_center(t_miter - 0.025)
T_pts = catmull_rom_spline(T_ctrl, num_arch_samples, end_pt=end_pt_T)
B_pts = catmull_rom_spline(B_ctrl, num_arch_samples, end_pt=end_pt_B)
ring_verts = 24

u_valley = 10.0 / 16.0

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

    # SECTION A: FOREPILLAR & CROWN & HARMONIC NECK (u <= u_valley)
    if u <= u_valley:
        t_sec = u / u_valley
        t_neck_blend = smoothstep(0.18, 0.36, t_sec)
        rx = 0.020 * (1.0 - t_neck_blend) + 0.025 * t_neck_blend
        exp_x = 0.38 * (1.0 - t_neck_blend) + 0.22 * t_neck_blend
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

    # SECTION B: LUTHIER KNEE DOME & SOUNDBOX CONE CONTINUATION (u > u_valley)
    else:
        w = (u - u_valley) / (1.0 - u_valley)  # w in (0.0, 1.0]

        # Upward continuation of the soundbox cone half-width so the knee walls match the exact 6.1 deg stave slope:
        hw_cone, _ = soundbox_dimensions(t_miter + 0.052 * (1.0 - w))

        # 1. Right / Tuning Pin Side (-X, ca < 0): Smooth 1-piece expansion from 0.025 to hw_cone by w = 0.36
        s_right = smoothstep(0.02, 0.36, w)
        rx_right = 0.025 * (1.0 - s_right) + hw_cone * s_right

        # X-width transitions quickly to the stave-tapered dome_24_x_frac (so zero rear side ears),
        # while D-depth transitions smoothly across the circular dome into miter_24_d_frac:
        s_x_shape = smoothstep(0.04, 0.38, w)
        s_d_stave = smoothstep(0.15, 0.95, w)
        s_facet_sharp = smoothstep(0.35, 0.96, w)

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            d_norm = 0.5 * (sa + 1.0)  # 0 at bottom rail B, 1 at top rail T

            # 2. Left / Lever Side (+X, ca >= 0):
            # Sculpted crescent cove cutout (matching WhatsApp Image 2026-10-16 at 2.36.59 PM.jpeg):
            # Holds flat neck width (0.025) past String 8, then steps out along crescent w_cove(d_norm)
            # so by w = 0.36 both +X and -X are 100% symmetrical at hw_cone!
            if ca >= 0.0:
                w_cove = 0.20 + 0.07 * math.sin(d_norm * math.pi) - 0.03 * (d_norm ** 2)
                s_left_local = smoothstep(w_cove - 0.05, w_cove + 0.05, w)
                cur_rx = 0.025 * (1.0 - s_left_local) + hw_cone * s_left_local
            else:
                cur_rx = rx_right

            # Neck normalized coordinates at u_valley:
            x_neck_f = math.copysign(abs(ca)**0.22, ca)
            d_neck_f = 0.5 * (1.0 + math.copysign(abs(sa)**0.78, sa))

            # Stave-matched X-width (zero rear bulge!) + smooth D-depth across the dome:
            x_dome_f = dome_24_x_frac[j] * (1.0 - s_facet_sharp) + miter_24_x_frac[j] * s_facet_sharp

            x_final_f = x_neck_f * (1.0 - s_x_shape) + x_dome_f * s_x_shape
            d_final_f = d_neck_f * (1.0 - s_d_stave) + miter_24_d_frac[j] * s_d_stave

            v_final = pt_B.lerp(pt_T, d_final_f) + side_x * (x_final_f * cur_rx)
            frame_verts.append(v_final)
            frame_uvs.append((j / ring_verts, u * 1.50))

# SECTION C: UNIFIED SOUNDBOX STAVES CONTINUATION (s_frac from 1.0 down to 0.0 in the exact same mesh!)
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

# Foot cap at forepillar base and bottom cap at soundbox base (t = 0.0)
frame_faces.append(tuple(reversed(range(0, ring_verts))))
bot_sb_b = (total_rings - 1) * ring_verts
frame_faces.append(tuple(range(bot_sb_b, bot_sb_b + ring_verts)))

harp_frame_obj = create_mesh_obj("Harp_Harmonic_Frame", frame_verts, frame_faces, uvs=frame_uvs, mat=mat_maple_wood, smooth=True)

# ---------------------------------------------------------------------------
# 7. BUILD 8 STRINGS, EQUIDISTANT PINS & PHYSICAL CAMAC SHARPING LEVERS ON +X
# ---------------------------------------------------------------------------
def get_neck_centerline_samples():
    neck_center_ctrl = [
        (T_ctrl[k] + B_ctrl[k]) * 0.5 for k in range(5, 12)
    ]
    return catmull_rom_spline(neck_center_ctrl, 500)

NUM_STRINGS = 8
lever_handle_objects = []
lever_base_quats = []

def build_eight_strings_and_mechanisms():
    neck_samples = get_neck_centerline_samples()

    # Anchor String 1 at Y = -0.302 (clearly to the right of the forepillar inner throat at Y = -0.326)
    # and String 8 at Y = 0.154 (right in the center of the treble valley), equally spaced by arc length!
    idx_start = 0
    for i, pt in enumerate(neck_samples):
        if pt.y >= -0.302:
            idx_start = i
            break

    idx_end = len(neck_samples) - 1
    for i, pt in enumerate(neck_samples):
        if pt.y >= 0.154:
            idx_end = i
            break

    cum_len = [0.0]
    for i in range(len(neck_samples) - 1):
        cum_len.append(cum_len[-1] + (neck_samples[i+1] - neck_samples[i]).length)
    tot_arc = cum_len[idx_end] - cum_len[idx_start]

    top_neck_pts = []
    top_neck_indices = []
    for k in range(NUM_STRINGS):
        target_arc = cum_len[idx_start] + k * (tot_arc / (NUM_STRINGS - 1))
        best_i = idx_start
        best_diff = 999.0
        for i in range(idx_start, idx_end + 1):
            diff = abs(cum_len[i] - target_arc)
            if diff < best_diff:
                best_diff = diff
                best_i = i
        top_neck_pts.append(neck_samples[best_i])
        top_neck_indices.append(best_i)

    # Equidistant soundboard attachment points:
    # t1 = 0.195, t8 = 0.775 gives parallel strings with generous plucking length on High C (String 8)!
    t1 = 0.195
    t8 = 0.775
    sb_pts_list = [soundboard_center(t1 + k * (t8 - t1) / 7.0) for k in range(NUM_STRINGS)]

    for idx in range(NUM_STRINGS):
        deg_num = idx + 1
        frac = idx / (NUM_STRINGS - 1)
        neck_pt = top_neck_pts[idx]
        s_idx = top_neck_indices[idx]
        t_vec = (neck_samples[min(len(neck_samples)-1, s_idx+2)] - neck_samples[max(0, s_idx-2)]).normalized()
        up_vec = side_x.cross(t_vec).normalized()
        if up_vec.z < 0:
            up_vec = -up_vec

        sb_pt = sb_pts_list[idx] + front_normal * 0.0085
        # Place BridgePin slightly above centerline (+0.003m) so Lever_Base (-0.022m) has generous wood below it across all 8 strings!
        bridge_neck_pt = neck_pt + up_vec * 0.003

        if deg_num in (1, 8):
            s_mat = mat_string_red
            band_mat = mat_band_red
        elif deg_num == 4:
            s_mat = mat_string_blue
            band_mat = mat_band_blue
        else:
            s_mat = mat_string_nylon
            band_mat = mat_lever_black

        p_top = Vector((0.032, bridge_neck_pt.y, bridge_neck_pt.z))
        p_bot = sb_pt

        str_vec_3d = p_top - p_bot
        str_dir_3d = str_vec_3d.normalized()
        str_dir_yz = Vector((0.0, str_dir_3d.y, str_dir_3d.z)).normalized()

        # Right-handed local basis on +X face:
        # X_local = (1, 0, 0)
        # Z_local = str_dir_yz (upward along string)
        # Y_local = Z_local x X_local (pointing RIGHTWARD toward soundbox, +Y > 0)
        str_right_yz = str_dir_yz.cross(Vector((1.0, 0.0, 0.0))).normalized()

        tuning_neck_pt = bridge_neck_pt + str_dir_yz * 0.022 + str_right_yz * 0.002
        lever_neck_pt  = bridge_neck_pt - str_dir_yz * 0.022

        # A. THROUGH-NECK TUNING PIN (Passing from -X to +X)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=20, radius=0.0042, depth=0.082,
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
            location=Vector((-0.044, tuning_neck_pt.y, tuning_neck_pt.z))
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
            location=Vector((0.032, tuning_neck_pt.y, tuning_neck_pt.z)),
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
            location=Vector((0.039, tuning_neck_pt.y, tuning_neck_pt.z)),
            rotation=(0, math.pi / 2.0, 0)
        )
        tip_ring = bpy.context.active_object
        tip_ring.name = f"TuningPinTip_{deg_num}"
        tip_ring.data.materials.append(tip_mat)
        link_obj(tip_ring)

        # B. BRIDGE PIN (on +X side)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=20, radius=0.0042, depth=0.026,
            location=Vector((0.028, bridge_neck_pt.y, bridge_neck_pt.z)),
            rotation=(0, math.pi / 2.0, 0)
        )
        b_pin = bpy.context.active_object
        b_pin.name = f"BridgePin_{deg_num}"
        b_pin.data.materials.append(mat_gunmetal_pin)
        link_obj(b_pin)

        # C. CAMAC SHARPING LEVER (Mounted on wooden neck +X face)
        rot_mat = Matrix((
            Vector((1.0, 0.0, 0.0)),
            str_right_yz,
            str_dir_yz
        )).transposed()
        rot_quat = rot_mat.to_quaternion()

        base_loc = Vector((0.026, lever_neck_pt.y, lever_neck_pt.z))
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
        l_base = bpy.context.active_object
        l_base.name = f"Lever_Base_{deg_num}"
        l_base.scale = (0.010, 0.012, 0.025)
        bpy.ops.object.transform_apply(scale=True)
        bev_l = l_base.modifiers.new(name="Bevel", type='BEVEL')
        bev_l.width = 0.0018
        bev_l.segments = 3
        l_base.location = base_loc
        l_base.rotation_mode = 'QUATERNION'
        l_base.rotation_quaternion = rot_quat
        l_base.data.materials.append(mat_lever_black)
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

        # Lever Handle Pivot & Mesh
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

        handle_obj = create_mesh_obj(f"Lever_Handle_{deg_num}", h_verts, h_faces, mat=mat_lever_handle, smooth=True)
        handle_obj.location = pivot_world
        handle_obj.rotation_mode = 'QUATERNION'
        handle_obj.rotation_quaternion = rot_quat
        sub = handle_obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 2

        lever_handle_objects.append(handle_obj)
        lever_base_quats.append(rot_quat)

        # Colored marker band on the lever handle
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
            location=sb_pt
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
        p_coil = Vector((0.032, tuning_neck_pt.y, tuning_neck_pt.z))
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
# 8. EXPORT PRODUCTION GLB TO PUBLIC & DIST (WITH LEVERS IN RESTING DOWN POSE)
# ---------------------------------------------------------------------------
out_dir = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\public\models"
dist_dir = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\dist\models"
os.makedirs(out_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)

glb_path = os.path.join(out_dir, "celtic_harp_8string.glb")
dist_glb_path = os.path.join(dist_dir, "celtic_harp_8string.glb")

bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    export_apply=True
)
shutil.copyfile(glb_path, dist_glb_path)
print("Exported Master V9.2 GLB successfully to:", glb_path)
print("Mirrored Master V9.2 GLB successfully to:", dist_glb_path)

# ---------------------------------------------------------------------------
# 9. STUDIO LIGHTING & MULTI-ANGLE VERIFICATION RENDERS
# ---------------------------------------------------------------------------
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
bg = world.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.08, 0.09, 0.12, 1.0)
bg.inputs[1].default_value = 0.85

bpy.ops.object.light_add(type='AREA', location=(1.45, -0.85, 1.45))
key_l = bpy.context.active_object
key_l.data.energy = 85.0
key_l.data.size = 2.0
key_l.data.color = (1.0, 0.96, 0.90)
key_l.rotation_mode = 'QUATERNION'
key_l.rotation_quaternion = (Vector((0, 0, 0.68)) - key_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.light_add(type='AREA', location=(-1.0, 1.35, 1.15))
fill_l = bpy.context.active_object
fill_l.data.energy = 55.0
fill_l.data.size = 1.8
fill_l.data.color = (0.92, 0.95, 1.0)
fill_l.rotation_mode = 'QUATERNION'
fill_l.rotation_quaternion = (Vector((0, 0, 0.68)) - fill_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.light_add(type='AREA', location=(-1.25, -0.60, 1.20))
back_l = bpy.context.active_object
back_l.data.energy = 60.0
back_l.data.size = 1.5
back_l.rotation_mode = 'QUATERNION'
back_l.rotation_quaternion = (Vector((0, 0, 0.68)) - back_l.location).to_track_quat('-Z', 'Y')

bpy.ops.object.camera_add(location=(1.58, -0.92, 0.72))
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 38
cam.rotation_mode = 'QUATERNION'

scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys() else 'BLENDER_EEVEE'

art_dir = r"C:\Users\Hp\.gemini\antigravity\brain\71677e65-ddd0-4156-bd73-ec960d83fd95"

# 1. Full Harp Lever Side View (+X)
scene.render.resolution_x = 900
scene.render.resolution_y = 1200
cam.location = Vector((1.56, -0.88, 0.68))
cam.rotation_quaternion = (Vector((0.0, -0.02, 0.66)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "v9_2_full_harp_lever_side.png")
bpy.ops.render.render(write_still=True)

# 2. Forepillar Crown Joint Closeup (+X)
scene.render.resolution_x = 900
scene.render.resolution_y = 900
cam.location = Vector((0.72, -0.58, 1.24))
cam.rotation_quaternion = (Vector((0.0, -0.28, 1.24)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "v9_2_crown_joint_closeup.png")
bpy.ops.render.render(write_still=True)

# 3. Knee Joint Left/Lever Side (+X)
cam.location = Vector((0.72, 0.42, 1.06))
cam.rotation_quaternion = (Vector((0.0, 0.25, 1.02)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "v9_2_knee_lever_side_left.png")
bpy.ops.render.render(write_still=True)

# 4. Knee Joint Right/Tuning Side (-X)
cam.location = Vector((-0.72, 0.42, 1.06))
cam.rotation_quaternion = (Vector((0.0, 0.25, 1.02)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "v9_2_knee_tuning_side_right.png")
bpy.ops.render.render(write_still=True)

# 5. Rear Knee Dome & Staves View (+Y)
cam.location = Vector((0.0, 1.22, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.30, 1.00)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "v9_2_knee_rear_dome.png")
bpy.ops.render.render(write_still=True)

# 6. Neck & Levers Closeup — ALL DOWN
cam.location = Vector((0.92, -0.20, 1.16))
cam.rotation_quaternion = (Vector((0.0, -0.02, 1.14)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "v9_2_levers_all_down.png")
bpy.ops.render.render(write_still=True)

# 7. Neck & Levers Closeup — ALL UP (+1.75 rad)
up_flip_q = Quaternion(Vector((1.0, 0.0, 0.0)), 1.75)
for h_obj, base_q in zip(lever_handle_objects, lever_base_quats):
    h_obj.rotation_quaternion = base_q @ up_flip_q

scene.render.filepath = os.path.join(art_dir, "v9_2_levers_all_up.png")
bpy.ops.render.render(write_still=True)

print("All V9.2 REA verification renders completed successfully!")
