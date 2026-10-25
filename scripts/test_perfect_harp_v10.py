r"""
TEST PERFECT HARP V10:
Complete seamless lutherie frame:
- Crown: Smooth, organic loft from forepillar through crown nose and apex.
- Harmonic neck: Elegant S-curve, 100% preserving all 8 strings and pin locations.
- Knee dome: Symmetrical, sculpted dome cap sitting 100% flush on the soundbox top miter rim.
- Front soundboard joint: Underside of neck meets the soundboard top with ZERO gap.
- Multi-angle renders to artifacts directory.
"""

import bpy
import math
import os
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

harp_col = bpy.data.collections.new("HarpTestV10")
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
hw_top, depth_top = soundbox_dimensions(1.0)
c_top_vol = c_top + back_normal * (depth_top * 0.50)

# Staves top rim vertices
staves_top = [
    c_top + Vector(( hw_top, 0, 0)),
    c_top + Vector(( hw_top * 0.90, 0, 0)) + back_normal * (depth_top * 0.42),
    c_top + Vector(( hw_top * 0.60, 0, 0)) + back_normal * (depth_top * 0.84),
    c_top + Vector(( hw_top * 0.22, 0, 0)) + back_normal * depth_top,
    c_top + Vector((-hw_top * 0.22, 0, 0)) + back_normal * depth_top,
    c_top + Vector((-hw_top * 0.60, 0, 0)) + back_normal * (depth_top * 0.84),
    c_top + Vector((-hw_top * 0.90, 0, 0)) + back_normal * (depth_top * 0.42),
    c_top + Vector((-hw_top, 0, 0)),
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

# Continuous Frame: Forepillar + Crown + Neck terminating directly into Knee Dome
# ---------------------------------------------------------------------------
p_fore_base = soundboard_center(0.042) + front_normal * 0.020
p_dome_apex = c_top_vol + sb_dir * 0.082

# Spine begins at soundboard top (c_top_vol), ascends through dome apex,
# sweeps across harmonic neck, over crown apex, and down forepillar to base:
spine_ctrl = [
    c_top_vol,                          # 0: Seated 100% on top miter of soundbox
    c_top_vol + sb_dir * 0.038,         # 1: Rising straight along staves axis
    p_dome_apex,                        # 2: Knee dome crest apex
    Vector((0.0,  0.275, 1.075)),       # 3: Sweeping forward into treble valley
    Vector((0.0,  0.176, 1.036)),       # 4: Treble gentle valley (pin 8 location)
    Vector((0.0,  0.025, 1.095)),       # 5: Mid slope
    Vector((0.0, -0.105, 1.205)),       # 6: Mid-upper slope
    Vector((0.0, -0.250, 1.300)),       # 7: High slope
    Vector((0.0, -0.360, 1.338)),       # 8: Crown apex peak
    Vector((0.0, -0.415, 1.275)),       # 9: Crown front nose
    Vector((0.0, -0.405, 1.190)),       # 10: Forepillar upper curve
    Vector((0.0, -0.370, 1.000)),       # 11: Forepillar mid
    Vector((0.0, -0.305, 0.680)),       # 12: Forepillar lower-mid
    Vector((0.0, -0.215, 0.360)),       # 13: Forepillar lower
    p_fore_base,                        # 14: Forepillar foot on soundboard
]

num_spine_samples = 140
spine_pts = catmull_rom_spline(spine_ctrl, num_spine_samples)
ring_verts = 24

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def build_continuous_frame():
    verts, faces, uvs = [], [], []

    for i in range(num_spine_samples):
        u = i / (num_spine_samples - 1)
        pt = spine_pts[i]

        # Ring 0: EXACT 100% FLUSH MATCH TO SOUNDBOX MITER RIM 24-GON!
        if i == 0:
            for j in range(ring_verts):
                verts.append(miter_24_pts[j])
                uvs.append((j / ring_verts, 0.0))
            continue

        p_prev = spine_pts[max(0, i - 1)]
        p_next = spine_pts[min(num_spine_samples - 1, i + 1)]
        tang = (p_next - p_prev).normalized()
        out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

        if u < 0.20:
            # Knee Dome: lofting from soundbox top miter ring up into dome apex
            t_k = u / 0.20
            s_k = smoothstep(0.0, 1.0, t_k)
            # Width transitions smoothly from hw_top to neck width 0.024
            rx = hw_top * (1.0 - s_k) + 0.024 * s_k
            ry = (depth_top * 0.50) * (1.0 - s_k) + 0.040 * s_k
            exp_x = 0.35 * (1.0 - s_k) + 0.22 * s_k
            exp_y = 0.50 * (1.0 - s_k) + 0.78 * s_k

            # Near base (u < 0.08), blend smoothly into miter ring to ensure zero step
            if u < 0.08:
                blend_b = u / 0.08
                for j in range(ring_verts):
                    ang = 2.0 * math.pi * j / ring_verts
                    ca, sa = math.cos(ang), math.sin(ang)
                    sx = math.copysign(abs(ca)**exp_x, ca) * rx
                    sy = math.copysign(abs(sa)**exp_y, sa) * ry
                    p_std = pt + side_x * sx + out_norm * sy
                    p_mit = miter_24_pts[j] + sb_dir * (u * 0.08)
                    p_fin = p_mit.lerp(p_std, blend_b**1.2)
                    verts.append(p_fin)
                    uvs.append((j / ring_verts, u * 4.5))
                continue

        elif u < 0.55:
            # Harmonic Neck: uniform cross-section with rounded filleted corners
            t_n = (u - 0.20) / 0.35
            rx = 0.024 * (1.0 - 0.06 * math.sin(t_n * math.pi))
            ry = 0.040
            exp_x = 0.22
            exp_y = 0.78

        elif u < 0.70:
            # Crown nose & apex: seamless flowing transition into forepillar
            t_c = (u - 0.55) / 0.15
            rx = 0.024
            ry = 0.040 + 0.005 * math.sin(t_c * math.pi)
            exp_x = 0.24
            exp_y = 0.76

        else:
            # Forepillar shaft: slender, gently tapering and widening at crown
            t_f = (u - 0.70) / 0.30
            r_shaft = 0.020 * (1.0 + 0.15 * math.sin(t_f * math.pi))
            t_expand = smoothstep(0.0, 0.30, 1.0 - t_f)
            rx = r_shaft * (1.0 - t_expand) + 0.024 * t_expand
            ry = (r_shaft * 1.35) * (1.0 - t_expand) + 0.038 * t_expand
            exp_x = 0.24 * (1.0 - t_f) + 0.38 * t_f
            exp_y = 0.76 * (1.0 - t_f) + 0.72 * t_f

        for j in range(ring_verts):
            ang = 2.0 * math.pi * j / ring_verts
            ca = math.cos(ang)
            sa = math.sin(ang)
            sx = math.copysign(abs(ca)**exp_x, ca) * rx
            sy = math.copysign(abs(sa)**exp_y, sa) * ry
            verts.append(pt + side_x * sx + out_norm * sy)
            uvs.append((j / ring_verts, u * 4.5))

    for i in range(num_spine_samples - 1):
        b = i * ring_verts
        n = (i + 1) * ring_verts
        for j in range(ring_verts):
            jn = (j + 1) % ring_verts
            faces.append((b + j, b + jn, n + jn, n + j))

    # Base cap (at soundbox miter rim)
    faces.append(tuple(reversed(range(0, ring_verts))))
    # Forepillar foot cap
    end_b = (num_spine_samples - 1) * ring_verts
    faces.append(tuple(range(end_b, end_b + ring_verts)))

    create_mesh_obj("Harp_Harmonic_Frame", verts, faces, uvs=uvs, mat=mat_maple_wood, smooth=True)

build_continuous_frame()

# 8 Strings, Bridge Pins, Tuning Pins & Levers (100% PRESERVED)
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
    bridge_pt = neck_pin_pts[idx]
    s_idx = neck_pin_indices[idx]
    t_vec = (neck_samples[min(len(neck_samples)-1, s_idx+1)] - neck_samples[max(0, s_idx-1)]).normalized()
    up_vec = side_x.cross(t_vec).normalized()
    if up_vec.z < 0:
        up_vec = -up_vec

    sb_pt = sb_pts_list[idx] + front_normal * 0.0085
    bridge_neck_pt = bridge_pt - up_vec * 0.004

    s_mat = mat_string_red if deg_num in (1, 8) else (mat_string_blue if deg_num == 4 else mat_string_nylon)

    p_top = Vector((0.032, bridge_neck_pt.y, bridge_neck_pt.z))
    p_bot = sb_pt

    str_vec_3d = p_top - p_bot
    str_dir_3d = str_vec_3d.normalized()
    str_dir_yz = Vector((0.0, str_dir_3d.y, str_dir_3d.z)).normalized()
    str_perp_yz = Vector((0.0, str_dir_yz.z, -str_dir_yz.y)).normalized()
    if str_perp_yz.y < 0:
        str_perp_yz = -str_perp_yz

    tuning_neck_pt = bridge_neck_pt + str_dir_yz * 0.025 - str_perp_yz * 0.003
    lever_neck_pt  = bridge_neck_pt - str_dir_yz * 0.026

    # Tuning Pin
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=0.0042, depth=0.082,
        location=Vector((-0.001, tuning_neck_pt.y, tuning_neck_pt.z)),
        rotation=(0, math.pi / 2.0, 0)
    )
    t_pin = bpy.context.active_object
    t_pin.name = f"TuningPin_{deg_num}"
    t_pin.data.materials.append(mat_gunmetal_pin)
    link_obj(t_pin)

    # Bridge Pin
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=0.0042, depth=0.026,
        location=Vector((0.028, bridge_neck_pt.y, bridge_neck_pt.z)),
        rotation=(0, math.pi / 2.0, 0)
    )
    b_pin = bpy.context.active_object
    b_pin.name = f"BridgePin_{deg_num}"
    b_pin.data.materials.append(mat_chrome_metal)
    link_obj(b_pin)

    # Lever
    rot_mat = Matrix((
        Vector((1.0, 0.0, 0.0)),
        str_perp_yz,
        str_dir_yz
    )).transposed()
    rot_quat = rot_mat.to_quaternion()

    base_loc = Vector((0.026, lever_neck_pt.y, lever_neck_pt.z))
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    l_base = bpy.context.active_object
    l_base.name = f"Lever_Base_{deg_num}"
    l_base.scale = (0.010, 0.013, 0.028)
    bpy.ops.object.transform_apply(scale=True)
    l_base.location = base_loc
    l_base.rotation_mode = 'QUATERNION'
    l_base.rotation_quaternion = rot_quat
    l_base.data.materials.append(mat_chrome_metal)
    link_obj(l_base)

    pivot_world = base_loc + rot_mat @ Vector((0.008, 0.0, 0.007))
    h_dir_local = Vector((0.0, math.sin(math.radians(38)), -math.cos(math.radians(38))))
    from_vec = Vector((0.0, 0.0, -1.0))
    h_rot_q = from_vec.rotation_difference(h_dir_local.normalized())

    raw_verts = [
        Vector((-0.0035, -0.0040,  0.0035)),
        Vector(( 0.0035, -0.0040,  0.0035)),
        Vector(( 0.0035,  0.0040,  0.0035)),
        Vector((-0.0035,  0.0040,  0.0035)),
        Vector((-0.0018, -0.0034, -0.013)),
        Vector(( 0.0055, -0.0034, -0.013)),
        Vector(( 0.0055,  0.0034, -0.013)),
        Vector((-0.0018,  0.0034, -0.013)),
        Vector((-0.0010, -0.0068, -0.028)),
        Vector(( 0.0090, -0.0068, -0.028)),
        Vector(( 0.0090,  0.0068, -0.028)),
        Vector((-0.0010,  0.0068, -0.028)),
        Vector(( 0.0000, -0.0042, -0.036)),
        Vector(( 0.0060, -0.0042, -0.036)),
        Vector(( 0.0060,  0.0042, -0.036)),
        Vector(( 0.0000,  0.0042, -0.036)),
    ]
    h_verts = [h_rot_q @ v for v in raw_verts]
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

# Lighting & Camera Setup
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
scene.render.filepath = os.path.join(art_dir, "test_v10_crown_joint.png")
bpy.ops.render.render(write_still=True)

# 2. Rear Knee Dome View (matching media_1792186870818_9c272945.jpg)
cam.location = Vector((0.0, 1.25, 1.18))
cam.rotation_quaternion = (Vector((0.0, 0.31, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v10_rear_knee_dome.png")
bpy.ops.render.render(write_still=True)

# 3. Side Knee Right View (matching WhatsApp Image 2026-10-16 at 2.37.02 PM.jpeg)
cam.location = Vector((-0.72, 0.45, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.30, 1.05)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v10_side_knee_right.png")
bpy.ops.render.render(write_still=True)

# 4. Side Knee Left View (lever side)
cam.location = Vector((0.72, 0.45, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.30, 1.05)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v10_side_knee_left.png")
bpy.ops.render.render(write_still=True)

# 5. Full Side Profile (matching WhatsApp Image 2026-10-16 at 2.37.06 PM.jpeg)
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
cam.location = Vector((1.55, -0.05, 1.12))
cam.rotation_quaternion = (Vector((0.0, -0.05, 1.12)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(art_dir, "test_v10_side_profile.png")
bpy.ops.render.render(write_still=True)

print("Test V10 renders completed successfully!")
