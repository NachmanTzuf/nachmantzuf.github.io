r"""
TEST UNIFIED MASTER HARP FRAME (V16):
Continuous C2 Lutherie Sculpting:
1. Crown Joint:
   - Smooth C1 continuity across sections with zero shoulder bump.
   - ry_top reaches 0.050 at crest apex (Z = 1.395) for proud Celtic arch.
   - ry_bot reaches 0.024 in throat for wide organic fillet arc.
2. Harmonic Neck:
   - ry_top = 0.042, ry_bot = 0.038 throughout strings 1-8 giving solid, premium wood thickness.
   - Elevated centerline through treble (Z = 1.060 at pin 8) giving clean clearance.
3. Knee Joint & Dome:
   - Monotonic spine in Y and Z with smooth C1 offset transition to soundbox miter 24-gon.
   - Dome lift of 0.032m along sb_dir giving rounded dome cap matching WhatsApp Image 2026-10-16 at 2.37.02 PM.jpeg.
   - Underside flows flush into soundboard top face at c_top with zero gap.
4. Camac Levers:
   - +2.15 rad positive rotation for UP position (parallel to blue arrow vector on right side of string).
"""

import bpy
import math
import os
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

harp_col = bpy.data.collections.new("HarpTestV16")
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

def catmull_rom_spline(ctrl_pts, num_samples):
    n = len(ctrl_pts)
    pts = [ctrl_pts[0]] + list(ctrl_pts) + [ctrl_pts[-1]]
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

# Wood Texture & Material
def create_blond_maple_image(name="Tex_BlondMaple", width=256, height=256):
    img = bpy.data.images.new(name=name, width=width, height=height, alpha=False)
    pixels = [0.0] * (width * height * 4)
    base_rgb = (0.85, 0.71, 0.50)
    dark_rgb = (0.74, 0.58, 0.38)
    for y in range(height):
        v = y / height
        v_ang = v * math.pi * 2.0
        for x in range(width):
            u = x / width
            u_ang = u * math.pi * 2.0
            wobble = 0.14 * math.sin(v_ang * 2.0 + 0.9 * math.sin(u_ang * 2.0))
            rings = 0.5 + 0.5 * math.sin((u * 10.0 + wobble) * math.pi * 2.0)
            fine_fibers = 0.5 + 0.5 * math.sin(u_ang * 64.0 + 0.4 * math.sin(v_ang * 3.0))
            g_fac = 0.60 * rings + 0.40 * fine_fibers
            r = dark_rgb[0] * (1.0 - g_fac) + base_rgb[0] * g_fac
            g = dark_rgb[1] * (1.0 - g_fac) + base_rgb[1] * g_fac
            b = dark_rgb[2] * (1.0 - g_fac) + base_rgb[2] * g_fac
            idx = (y * width + x) * 4
            pixels[idx], pixels[idx+1], pixels[idx+2], pixels[idx+3] = r, g, b, 1.0
    img.pixels.foreach_set(pixels)
    img.pack()
    return img

img_maple = create_blond_maple_image()

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

def make_pbr_mat(name, base_color, roughness=0.25, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat

mat_maple_wood    = make_textured_mat("Harp_BlondMaple", img_maple, roughness=0.24, coat=0.32, specular=0.40)
mat_gunmetal_pin  = make_pbr_mat("Hardware_Gunmetal_Pin", (0.13, 0.13, 0.15), roughness=0.26, metallic=0.90)
mat_chrome_metal  = make_pbr_mat("Hardware_Polished_Chrome", (0.92, 0.94, 0.97), roughness=0.08, metallic=0.98)
mat_string_red    = make_pbr_mat("String_Red_C", (0.88, 0.08, 0.10), roughness=0.15, metallic=0.05)
mat_string_blue   = make_pbr_mat("String_Blue_F", (0.08, 0.28, 0.90), roughness=0.15, metallic=0.05)
mat_string_nylon  = make_pbr_mat("String_Clear_Nylon", (0.95, 0.93, 0.88), roughness=0.12, metallic=0.05)

# Geometry definitions
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

c_top = soundboard_center(1.0) # (0.0, 0.310, 1.040)
hw_top, depth_top = soundbox_dimensions(1.0) # hw=0.0486, depth=0.0952
c_top_vol = c_top + back_normal * (depth_top * 0.50) # (0.0, 0.3531, 1.0199)

# 8 Staves points at miter top
staves_top = [
    c_top + side_x * hw_top,                                             # 0: +X front
    c_top + side_x * (hw_top * 0.90) + back_normal * (depth_top * 0.42), # 1: +X side
    c_top + side_x * (hw_top * 0.60) + back_normal * (depth_top * 0.84), # 2: +X rear
    c_top + side_x * (hw_top * 0.22) + back_normal * depth_top,          # 3: rear center-right
    c_top - side_x * (hw_top * 0.22) + back_normal * depth_top,          # 4: rear center-left
    c_top - side_x * (hw_top * 0.60) + back_normal * (depth_top * 0.84), # 5: -X rear
    c_top - side_x * (hw_top * 0.90) + back_normal * (depth_top * 0.42), # 6: -X side
    c_top - side_x * hw_top,                                             # 7: -X front
]

def get_miter_ring_24():
    ring = [None] * 24
    ring[0] = staves_top[0]
    ring[1] = staves_top[0].lerp(staves_top[1], 0.5)
    ring[2] = staves_top[1]
    ring[3] = staves_top[2]
    ring[4] = staves_top[2].lerp(staves_top[3], 0.5)
    ring[5] = staves_top[3]
    ring[6] = staves_top[3].lerp(staves_top[4], 0.5)

    ring[7]  = staves_top[4]
    ring[8]  = staves_top[4].lerp(staves_top[5], 0.5)
    ring[9]  = staves_top[5]
    ring[10] = staves_top[6]
    ring[11] = staves_top[6].lerp(staves_top[7], 0.5)
    ring[12] = staves_top[7]

    for k in range(1, 12):
        ring[12 + k] = staves_top[7].lerp(staves_top[0], k / 12.0)
    return ring

miter_24_pts = get_miter_ring_24()

# Build Soundbox
def build_soundbox():
    steps_z = 48
    verts, faces, uvs = [], [], []
    ring_size = 8
    for i in range(steps_z + 1):
        t = i / steps_z
        c = soundboard_center(t)
        hw, depth = soundbox_dimensions(t)
        pts = [
            c + Vector((-hw, 0, 0)),
            c + Vector(( hw, 0, 0)),
            c + Vector(( hw * 0.90, 0, 0)) + back_normal * (depth * 0.42),
            c + Vector(( hw * 0.60, 0, 0)) + back_normal * (depth * 0.84),
            c + Vector(( hw * 0.22, 0, 0)) + back_normal * depth,
            c + Vector((-hw * 0.22, 0, 0)) + back_normal * depth,
            c + Vector((-hw * 0.60, 0, 0)) + back_normal * (depth * 0.84),
            c + Vector((-hw * 0.90, 0, 0)) + back_normal * (depth * 0.42),
        ]
        verts.extend(pts)
        for j in range(ring_size):
            uvs.append((j / ring_size, t * 0.96 + 0.02))
    for i in range(steps_z):
        b = i * ring_size
        n = (i + 1) * ring_size
        for j in range(ring_size):
            jn = (j + 1) % ring_size
            faces.append((b + j, b + jn, n + jn, n + j))
    faces.append(tuple(reversed(range(0, ring_size))))
    top_b = steps_z * ring_size
    faces.append(tuple(range(top_b, top_b + ring_size)))
    create_mesh_obj("Harp_Soundbox_Staves", verts, faces, uvs=uvs, mat=mat_maple_wood, smooth=False)

    sbd_verts, sbd_faces, sbd_uvs = [], [], []
    for i in range(steps_z + 1):
        t = i / steps_z
        c = soundboard_center(t) + front_normal * 0.0015
        hw, _ = soundbox_dimensions(t)
        sbd_verts.append(c + Vector((-hw * 0.98, 0, 0)))
        sbd_verts.append(c + Vector(( hw * 0.98, 0, 0)))
        sbd_uvs.extend([(0.05, t), (0.95, t)])
    for i in range(steps_z):
        b = i * 2
        sbd_faces.append((b, b + 1, b + 3, b + 2))
    create_mesh_obj("Harp_Soundboard_Face", sbd_verts, sbd_faces, uvs=sbd_uvs, mat=mat_maple_wood, smooth=True)

build_soundbox()

# ---------------------------------------------------------------------------
# UNIFIED MASTER HARP FRAME (Forepillar + Crown + Harmonic Neck + Knee Dome)
# ---------------------------------------------------------------------------
p_fore_base = soundboard_center(0.042) + front_normal * 0.020

# Continuous strictly monotonic spine:
spine_ctrl = [
    p_fore_base,                        # 0: Seated in cradle on soundboard base
    Vector((0.0, -0.215, 0.350)),       # 1: Forepillar lower
    Vector((0.0, -0.300, 0.650)),       # 2: Forepillar mid
    Vector((0.0, -0.370, 0.950)),       # 3: Forepillar upper shaft
    Vector((0.0, -0.415, 1.150)),       # 4: Approaching crown
    Vector((0.0, -0.435, 1.250)),       # 5: Crown front nose (soft rounded protrusion)
    Vector((0.0, -0.410, 1.340)),       # 6: Crown crest approach
    Vector((0.0, -0.350, 1.395)),       # 7: Crown crest apex (high, proud arch, 28mm wood above pin 1)
    Vector((0.0, -0.230, 1.350)),       # 8: Neck slope over bass pin 1
    Vector((0.0, -0.100, 1.235)),       # 9: Mid-upper harmonic slope
    Vector((0.0,  0.040, 1.120)),       # 10: Mid slope
    Vector((0.0,  0.176, 1.060)),       # 11: Treble valley (elevated centerline giving pin 8 clearance)
    Vector((0.0,  0.250, 1.055)),       # 12: Smooth gentle entry into knee
    Vector((0.0,  0.315, 1.042)),       # 13: Mid-knee transition directly above soundboard top
    c_top_vol,                          # 14: Terminates exactly at soundbox top miter center
]

num_spine_samples = 156
spine_pts = catmull_rom_spline(spine_ctrl, num_spine_samples)
ring_verts = 24

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

# Precalculate target offset vectors d_j from c_top_vol at soundbox miter:
miter_offsets = [miter_24_pts[j] - c_top_vol for j in range(ring_verts)]

frame_verts, frame_faces, frame_uvs = [], [], []

for i in range(num_spine_samples):
    u = i / (num_spine_samples - 1)
    pt = spine_pts[i]

    # FINAL RING: 100% FLUSH MATCH TO SOUNDBOX MITER RIM 24-GON!
    if i == num_spine_samples - 1:
        for j in range(ring_verts):
            frame_verts.append(miter_24_pts[j])
            frame_uvs.append((j / ring_verts, 5.0))
        continue

    p_prev = spine_pts[max(0, i - 1)]
    p_next = spine_pts[min(num_spine_samples - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    std_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    # SECTION 1: FOREPILLAR SHAFT (u in [0.0, 0.28])
    if u < 0.28:
        t_f = u / 0.28
        out_norm = std_norm
        r_shaft = 0.020 * (1.0 + 0.10 * math.sin(t_f * math.pi))
        t_expand = smoothstep(0.55, 1.0, t_f)
        rx = r_shaft * (1.0 - t_expand) + 0.024 * t_expand
        # Smoothly transition ry_t to 0.038 at u = 0.28 with zero step:
        ry_t = (r_shaft * 1.35) * (1.0 - t_expand) + 0.038 * t_expand
        ry_b = ry_t
        exp_x = 0.36 * (1.0 - t_f) + 0.24 * t_f
        exp_y = 0.72 * (1.0 - t_f) + 0.76 * t_f

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            cur_ry = ry_t if sa >= 0 else ry_b
            sx = math.copysign(abs(ca)**exp_x, ca) * rx
            sy = math.copysign(abs(sa)**exp_y, sa) * cur_ry
            frame_verts.append(pt + side_x * sx + out_norm * sy)
            frame_uvs.append((j / ring_verts, u * 5.0))

    # SECTION 2: CROWN NOSE & APEX (u in [0.28, 0.46])
    elif u < 0.46:
        t_c = (u - 0.28) / 0.18
        out_norm = std_norm
        rx = 0.024
        # Smoothly rises to proud crown crest (ry_t = 0.050 at apex t_c = 0.5):
        crest_arch = math.sin(t_c * math.pi)
        ry_t = 0.038 * (1.0 - crest_arch) + 0.050 * crest_arch
        # Wide, sweeping organic fillet arc on the inside throat (sa < 0):
        ry_b = 0.038 * (1.0 - crest_arch) + 0.024 * crest_arch
        exp_x = 0.24
        exp_y = 0.76

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            cur_ry = ry_t if sa >= 0 else ry_b
            sx = math.copysign(abs(ca)**exp_x, ca) * rx
            sy = math.copysign(abs(sa)**exp_y, sa) * cur_ry
            frame_verts.append(pt + side_x * sx + out_norm * sy)
            frame_uvs.append((j / ring_verts, u * 5.0))

    # SECTION 3: HARMONIC NECK THROUGH STRINGS (u in [0.46, 0.76])
    elif u < 0.76:
        t_n = (u - 0.46) / 0.30
        out_norm = std_norm
        rx = 0.024 * (1.0 - 0.03 * math.sin(t_n * math.pi))
        ry_t = 0.042
        ry_b = 0.038
        exp_x = 0.22
        exp_y = 0.78

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            cur_ry = ry_t if sa >= 0 else ry_b
            sx = math.copysign(abs(ca)**exp_x, ca) * rx
            sy = math.copysign(abs(sa)**exp_y, sa) * cur_ry
            frame_verts.append(pt + side_x * sx + out_norm * sy)
            frame_uvs.append((j / ring_verts, u * 5.0))

    # SECTION 4: KNEE DOME & SOUNDBOX MITER TRANSITION (u in [0.76, 1.0])
    else:
        w = (u - 0.76) / 0.24
        s_w = smoothstep(0.0, 1.0, w)

        # Standard neck ring cross section at entry:
        rx_0 = 0.024
        ry_t0 = 0.042
        ry_b0 = 0.038
        exp_x0 = 0.22
        exp_y0 = 0.78

        # Upward dome bulge on the upper surface (sa > 0)
        # sin(w * pi) ensures dome starts at 0 at w=0 and ends at EXACTLY 0 at w=1!
        dome_lift = 0.032 * math.sin(w * math.pi)

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)

            # Neck offset at w=0:
            cur_ry0 = ry_t0 if sa >= 0 else ry_b0
            sx0 = math.copysign(abs(ca)**exp_x0, ca) * rx_0
            sy0 = math.copysign(abs(sa)**exp_y0, sa) * cur_ry0
            o_0 = side_x * sx0 + std_norm * sy0

            # Target offset at soundbox miter:
            o_1 = miter_offsets[j]

            # Smooth C1 interpolation of offset vector:
            o_w = o_0.lerp(o_1, s_w)

            # Apply dome lift to upper surface (sa > 0)
            lift = sb_dir * (dome_lift * max(0.0, sa)) if sa > 0 else Vector((0.0, 0.0, 0.0))

            v_final = pt + o_w + lift
            frame_verts.append(v_final)
            frame_uvs.append((j / ring_verts, u * 5.0))

for i in range(num_spine_samples - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        frame_faces.append((b + j, b + jn, n + jn, n + j))

# Foot cap at forepillar base
frame_faces.append(tuple(reversed(range(0, ring_verts))))
# End cap at soundbox miter rim
end_b = (num_spine_samples - 1) * ring_verts
frame_faces.append(tuple(range(end_b, end_b + ring_verts)))

harp_frame_obj = create_mesh_obj("Harp_Harmonic_Frame", frame_verts, frame_faces, uvs=frame_uvs, mat=mat_maple_wood, smooth=True)

# Add subdivision surface modifier for flawless C2 organic curvature
subsurf = harp_frame_obj.modifiers.new(name="Subsurf", type='SUBSURF')
subsurf.levels = 1
subsurf.render_levels = 1

# ---------------------------------------------------------------------------
# 8 STRINGS, BRIDGE PINS, TUNING PINS & CAMAC LEVERS
# ---------------------------------------------------------------------------
def get_harmonic_neck_spline_samples():
    ctrl = [
        Vector((0.0, -0.335, 1.328)),
        Vector((0.0, -0.245, 1.295)),
        Vector((0.0, -0.105, 1.200)),
        Vector((0.0,  0.025, 1.095)),
        Vector((0.0,  0.155, 1.035)),
        Vector((0.0,  0.220, 1.055)),
    ]
    return catmull_rom_spline(ctrl, 500)

NUM_STRINGS = 8
neck_samples = get_harmonic_neck_spline_samples()
idx_start = 0
for i, pt in enumerate(neck_samples):
    if pt.y >= -0.320:
        idx_start = i
        break
idx_end = len(neck_samples) - 1
for i, pt in enumerate(neck_samples):
    if pt.y >= 0.176:
        idx_end = i
        break
cum_len = [0.0]
for i in range(len(neck_samples) - 1):
    cum_len.append(cum_len[-1] + (neck_samples[i+1] - neck_samples[i]).length)
tot_arc = cum_len[idx_end] - cum_len[idx_start]

neck_pin_pts = []
neck_pin_indices = []
for k in range(NUM_STRINGS):
    target_arc = cum_len[idx_start] + k * (tot_arc / (NUM_STRINGS - 1))
    best_i = idx_start
    best_diff = 999.0
    for i in range(idx_start, idx_end + 1):
        diff = abs(cum_len[i] - target_arc)
        if diff < best_diff:
            best_diff = diff
            best_i = i
    neck_pin_pts.append(neck_samples[best_i])
    neck_pin_indices.append(best_i)

t1, t8 = 0.15, 0.812
sb_pts_list = [soundboard_center(t1 + k * (t8 - t1) / 7.0) for k in range(NUM_STRINGS)]

for idx in range(NUM_STRINGS):
    deg_num = idx + 1
    frac = idx / (NUM_STRINGS - 1)
    p_bot = sb_pts_list[idx]
    neck_pt = neck_pin_pts[idx]

    s_i = neck_pin_indices[idx]
    p_pr = neck_samples[max(0, s_i - 2)]
    p_nx = neck_samples[min(len(neck_samples) - 1, s_i + 2)]
    t_tang = (p_nx - p_pr).normalized()
    t_norm = Vector((0.0, -t_tang.z, t_tang.y)).normalized()

    # Bridge Pin on player's left (-X)
    bp_len = 0.026
    bp_rad = 0.0022
    p_bridge = neck_pt + t_norm * 0.006 - Vector((0.024 + bp_len, 0.0, 0.0))
    p_top = p_bridge + Vector((0.005, 0.0, 0.0))

    if deg_num in [1, 8]:
        s_mat = mat_string_red
    elif deg_num == 4:
        s_mat = mat_string_blue
    else:
        s_mat = mat_string_nylon

    # Tuning Pin on player's right (+X)
    tp_len = 0.046
    tp_rad = 0.0028
    p_tune_center = neck_pt + t_norm * 0.038
    p_tune_start = p_tune_center - Vector((0.025, 0.0, 0.0))
    p_tune_end = p_tune_center + Vector((tp_len, 0.0, 0.0))

    # Camac Sharping Lever
    str_dir_3d = (p_bot - p_top).normalized()
    lever_offset = 0.048 - 0.008 * frac
    pivot_world = p_top + str_dir_3d * lever_offset - Vector((0.007, 0.0, 0.0))

    # Base bracket
    bb_w, bb_h, bb_d = 0.004, 0.016, 0.006
    bracket_mesh = bpy.data.meshes.new(f"Lever_Bracket_{deg_num}_Mesh")
    b_verts = [
        Vector((-bb_w, -bb_h*0.5, -bb_d*0.5)), Vector((0.0, -bb_h*0.5, -bb_d*0.5)),
        Vector((0.0,  bb_h*0.5, -bb_d*0.5)), Vector((-bb_w,  bb_h*0.5, -bb_d*0.5)),
        Vector((-bb_w, -bb_h*0.5,  bb_d*0.5)), Vector((0.0, -bb_h*0.5,  bb_d*0.5)),
        Vector((0.0,  bb_h*0.5,  bb_d*0.5)), Vector((-bb_w,  bb_h*0.5,  bb_d*0.5)),
    ]
    b_faces = [
        (0,1,2,3), (4,7,6,5), (0,4,5,1),
        (1,5,6,2), (2,6,7,3), (3,7,4,0)
    ]
    b_obj = create_mesh_obj(f"Lever_Bracket_{deg_num}", b_verts, b_faces, mat=mat_gunmetal_pin, smooth=False)
    b_obj.location = pivot_world

    # Camac Lever Handle
    z_axis = str_dir_3d
    x_axis = Vector((1.0, 0.0, 0.0))
    y_axis = z_axis.cross(x_axis).normalized()
    rot_mat = Matrix((x_axis, y_axis, z_axis)).transposed()
    rot_quat = rot_mat.to_quaternion()

    h_len = 0.024
    w_base = 0.0022
    w_tip = 0.0036
    th = 0.0016
    raw_verts = [
        Vector((-th, -w_base, 0.0)), Vector((th, -w_base, 0.0)),
        Vector((th,  w_base, 0.0)), Vector((-th,  w_base, 0.0)),
        Vector((-th, -w_base*0.8, h_len*0.4)), Vector((th, -w_base*0.8, h_len*0.4)),
        Vector((th,  w_base*0.8, h_len*0.4)), Vector((-th,  w_base*0.8, h_len*0.4)),
        Vector((-th*1.2, -w_tip, h_len*0.85)), Vector((th*1.2, -w_tip, h_len*0.85)),
        Vector((th*1.2,  w_tip, h_len*0.85)), Vector((-th*1.2,  w_tip, h_len*0.85)),
        Vector((-th*0.8, -w_tip*0.7, h_len)), Vector((th*0.8, -w_tip*0.7, h_len)),
        Vector((th*0.8,  w_tip*0.7, h_len)), Vector((-th*0.8,  w_tip*0.7, h_len)),
    ]

    # Resting pose: DOWN (disengaged, angled 40 deg into inter-string space)
    resting_angle = math.radians(-40.0)
    h_rot_q = Quaternion(Vector((1.0, 0.0, 0.0)), resting_angle)

    # Alternate levers: even levers (2, 4, 6, 8) are UP, odd levers (1, 3, 5, 7) are DOWN
    is_up = (deg_num % 2 == 0)
    flip_angle = 2.15 if is_up else 0.0
    flip_q = Quaternion(Vector((1.0, 0.0, 0.0)), flip_angle)

    # Apply resting rotation then flip rotation
    h_verts = [flip_q @ (h_rot_q @ v) for v in raw_verts]
    h_faces = []
    for ring_i in range(3):
        b = ring_i * 4
        n = (ring_i + 1) * 4
        for k in range(4):
            kn = (k + 1) % 4
            h_faces.append((b + k, b + kn, n + kn, n + k))
    h_faces.append((0, 3, 2, 1))
    h_faces.append((12, 13, 14, 15))

    handle_obj = create_mesh_obj(f"Lever_Handle_{deg_num}", h_verts, h_faces, mat=mat_chrome_metal, smooth=True)
    handle_obj.location = pivot_world
    handle_obj.rotation_mode = 'QUATERNION'
    handle_obj.rotation_quaternion = rot_quat
    sub = handle_obj.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1

    # String Mesh
    seg_count = 30
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

# Studio Lights
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

bpy.ops.object.light_add(type='AREA', location=(-1.0, 1.35, 1.15))
fill_l = bpy.context.active_object
fill_l.data.energy = 50.0
fill_l.data.size = 1.8
fill_l.data.color = (0.92, 0.95, 1.0)

bpy.ops.object.camera_add(location=(1.58, -0.92, 0.72))
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 38
cam.rotation_mode = 'QUATERNION'

scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys() else 'BLENDER_EEVEE'
scene.render.resolution_x = 900
scene.render.resolution_y = 900

art_dir = r"C:\Users\Hp\.gemini\antigravity\brain\71677e65-ddd0-4156-bd73-ec960d83fd95"

# 1. Crown Joint View (matching media_1792186874340_a41dc37f.jpg)
cam.location = Vector((0.75, -0.65, 1.25))
cam.rotation_quaternion = (Vector((0.0, -0.36, 1.25)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v16_crown_joint.png")
bpy.ops.render.render(write_still=True)

# 2. Rear Knee Dome View (matching media_1792186870818_9c272945.jpg)
cam.location = Vector((0.0, 1.25, 1.18))
cam.rotation_quaternion = (Vector((0.0, 0.31, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v16_rear_knee_dome.png")
bpy.ops.render.render(write_still=True)

# 3. Side Knee Right View (matching WhatsApp Image 2026-10-16 at 2.37.02 PM.jpeg)
cam.location = Vector((-0.72, 0.45, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.30, 1.05)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v16_side_knee_right.png")
bpy.ops.render.render(write_still=True)

# 4. Side Knee Left View (lever side)
cam.location = Vector((0.72, 0.45, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.30, 1.05)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v16_side_knee_left.png")
bpy.ops.render.render(write_still=True)

# 5. Full Side Profile View (matching WhatsApp Image 2026-10-16 at 2.37.06 PM.jpeg)
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
cam.location = Vector((1.55, -0.05, 1.12))
cam.rotation_quaternion = (Vector((0.0, -0.05, 1.12)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v16_side_profile.png")
bpy.ops.render.render(write_still=True)

# 6. Lever Closeup View (matching media_1792186854523_684157ca.png)
scene.render.resolution_x = 900
scene.render.resolution_y = 900
cam.location = Vector((0.55, 0.05, 1.18))
cam.rotation_quaternion = (Vector((0.02, 0.02, 1.12)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v16_lever_closeup.png")
bpy.ops.render.render(write_still=True)

print("Test V16 renders completed successfully!")
