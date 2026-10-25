import os, sys, math, shutil
import bpy
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def make_pbr_mat(name, color_rgb, roughness=0.28, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color_rgb, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_maple = make_pbr_mat("Mat_Maple", (0.85, 0.72, 0.52), roughness=0.24)
mat_soundboard = make_pbr_mat("Mat_Soundboard", (0.92, 0.84, 0.68), roughness=0.30)
mat_walnut = make_pbr_mat("Mat_Walnut", (0.15, 0.08, 0.04), roughness=0.45)
mat_chrome = make_pbr_mat("Mat_Chrome", (0.9, 0.9, 0.95), roughness=0.1, metallic=0.98)
mat_red = make_pbr_mat("Mat_Red", (0.85, 0.08, 0.1), roughness=0.2)
mat_blue = make_pbr_mat("Mat_Blue", (0.08, 0.25, 0.85), roughness=0.2)
mat_clear = make_pbr_mat("Mat_Clear", (0.95, 0.95, 0.92), roughness=0.15)

def create_mesh_obj(name, verts, faces, mat=None, smooth=True):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    if smooth:
        for p in mesh.polygons:
            p.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    bpy.context.collection.objects.link(obj)
    return obj

def soundboard_center(t):
    y = -0.14 + t * 0.45
    z =  0.075 + t * 0.965
    return Vector((0.0, y, z))

def soundbox_dimensions(t):
    half_w = 0.162 * (1.0 - 0.70 * t)
    depth  = 0.170 * (1.0 - 0.44 * t)
    return half_w, depth

def catmull_rom_spline(ctrl_pts, num_samples):
    n = len(ctrl_pts)
    pts = [ctrl_pts[0]] + list(ctrl_pts) + [ctrl_pts[-1]]
    out = []
    for i in range(num_samples):
        t = i / (num_samples - 1) * (n - 1)
        seg = min(int(t), n - 2)
        u = t - seg
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

# 1. BUILD SOUNDBOX
steps_z = 48
sb_dir = (soundboard_center(1.0) - soundboard_center(0.0)).normalized()
back_normal = Vector((0.0, sb_dir.z, -sb_dir.y)).normalized()
front_normal = -back_normal

verts, faces = [], []
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
for i in range(steps_z):
    b = i * ring_size
    n = (i + 1) * ring_size
    for j in range(ring_size):
        jn = (j + 1) % ring_size
        faces.append((b + j, b + jn, n + jn, n + j))
faces.append(tuple(reversed(range(0, ring_size))))
top_b = steps_z * ring_size
faces.append(tuple(range(top_b, top_b + ring_size)))
create_mesh_obj("Harp_Soundbox_Staves", verts, faces, mat=mat_maple, smooth=False)

# Soundboard face
sbd_verts, sbd_faces = [], []
for i in range(steps_z + 1):
    t = i / steps_z
    c = soundboard_center(t) + front_normal * 0.0015
    hw, _ = soundbox_dimensions(t)
    sbd_verts.append(c + Vector((-hw * 0.98, 0, 0)))
    sbd_verts.append(c + Vector(( hw * 0.98, 0, 0)))
for i in range(steps_z):
    b = i * 2
    sbd_faces.append((b, b + 1, b + 3, b + 2))
create_mesh_obj("Harp_Soundboard_Face", sbd_verts, sbd_faces, mat=mat_soundboard, smooth=True)

# 2. PURE SEWN SINGLE-MESH HARMONIC NECK + KNEE
hw_top, depth_top = soundbox_dimensions(1.0)
c_top = soundboard_center(1.0)
side_x = Vector((1.0, 0.0, 0.0))

# Knee dimensions: 20 layers rising along sb_dir
knee_layers = 20
total_knee_h = 0.108
knee_rings = [] # knee_rings[layer] = [p0, p1, p2, p3, p4, p5, p6, p7]

for layer in range(knee_layers + 1):
    h_fac = layer / knee_layers
    h_vec = sb_dir * (h_fac * total_knee_h)
    c_layer = c_top + h_vec

    w_scale = 1.0 - 0.28 * (h_fac**1.5)
    hw = hw_top * w_scale
    back_curl = 1.0 - 0.42 * (h_fac**1.6)
    crescent_sweep = (math.sin(h_fac * math.pi * 0.85)**1.3) * 0.035
    top_bevel = 1.0 - 0.15 * (max(0.0, (h_fac - 0.80) / 0.20)**1.5)

    p0 = c_layer + Vector((-hw * top_bevel, 0, 0))
    p1 = c_layer + Vector(( hw * top_bevel, 0, 0)) + back_normal * crescent_sweep
    p2 = c_layer + Vector(( hw * 0.88 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl + crescent_sweep * 0.5)
    p3 = c_layer + Vector(( hw * 0.58 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p4 = c_layer + Vector(( hw * 0.22 * top_bevel, 0, 0)) + back_normal * (depth_top * back_curl)
    p5 = c_layer + Vector((-hw * 0.22 * top_bevel, 0, 0)) + back_normal * (depth_top * back_curl)
    p6 = c_layer + Vector((-hw * 0.58 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p7 = c_layer + Vector((-hw * 0.88 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl)

    knee_rings.append([p0, p1, p2, p3, p4, p5, p6, p7])

# The Harmonic Neck spline: From Bass Crown Apex to Knee Front Boundary
neck_spline_ctrl = [
    Vector((0.0, -0.335, 1.328)),  # 0: Bass crown apex
    Vector((0.0, -0.245, 1.295)),  # 1: Start of S-curve
    Vector((0.0, -0.105, 1.200)),  # 2: Neck descent
    Vector((0.0,  0.025, 1.095)),  # 3: Mid neck slope
    Vector((0.0,  0.155, 1.035)),  # 4: Treble gentle valley
    Vector((0.0,  0.235, 1.065)),  # 5: Approaching knee
    Vector((0.0,  0.305, 1.095)),  # 6: Joining knee front wall
]

num_neck_slices = 50
neck_spine_pts = catmull_rom_spline(neck_spline_ctrl, num_neck_slices)

# We construct the entire Neck & Forepillar and Knee as a unified mesh:
# Neck slices: each slice has 20 vertices around a loop:
# 10 vertices on the right side, 10 on the left side
ring_verts = 16
unified_verts, unified_faces = [], []

# 1. FOREPILLAR RINGS: 35 rings from cradle to bass crown
fore_ctrl = [
    soundboard_center(0.042) + front_normal * 0.020,
    Vector((0.0, -0.215, 0.360)),
    Vector((0.0, -0.295, 0.680)),
    Vector((0.0, -0.345, 1.000)),
    Vector((0.0, -0.358, 1.240)),
    Vector((0.0, -0.335, 1.328)), # Meets bass crown apex
]
fore_pts = catmull_rom_spline(fore_ctrl, 35)

for i in range(len(fore_pts)):
    s = i / (len(fore_pts) - 1)
    pt = fore_pts[i]
    p_prev = fore_pts[max(0, i - 1)]
    p_next = fore_pts[min(len(fore_pts) - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    r = 0.022 * (0.85 + 0.35 * math.sin(s * math.pi))
    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca, sa = math.cos(ang), math.sin(ang)
        sx = math.copysign(abs(ca)**0.30, ca) * r
        sy = math.copysign(abs(sa)**0.75, sa) * (r * 1.25)
        unified_verts.append(pt + side_x * sx + out_norm * sy)

for i in range(len(fore_pts) - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        unified_faces.append((b + j, b + jn, n + jn, n + j))
# Forepillar bottom cap
unified_faces.append(tuple(reversed(range(0, ring_verts))))

# 2. HARMONIC NECK RINGS: 50 rings continuing from forepillar apex directly to the knee
fore_end_idx = len(fore_pts) - 1
start_ring = fore_end_idx * ring_verts

for i in range(1, num_neck_slices):
    s = i / (num_neck_slices - 1)
    pt = neck_spine_pts[i]
    p_prev = neck_spine_pts[max(0, i - 1)]
    p_next = neck_spine_pts[min(num_neck_slices - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    base_taper = 0.80 + 0.20 * math.sin(s * math.pi)
    rx_base = 0.022 * base_taper
    ry = 0.040 * base_taper

    # Smooth blend approaching the knee front:
    if s > 0.60:
        blend = (s - 0.60) / 0.40
        # Right side widens to match p0 of the knee
        rx_right = rx_base * (1.0 - blend) + hw_top * blend
        # Left side stays slim for string 8 clearance
        rx_left  = rx_base * (1.0 - blend) + (hw_top * 0.70) * blend
        # Belly extends downward towards the soundboard front
        ry_bot = ry * (1.0 + 0.60 * blend)
        ry_top = ry * (1.0 + 0.25 * blend)
    else:
        rx_right = rx_base
        rx_left  = rx_base
        ry_top   = ry
        ry_bot   = ry

    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca, sa = math.cos(ang), math.sin(ang)

        sx_unit = math.copysign(abs(ca)**0.22, ca)
        sy_unit = math.copysign(abs(sa)**0.78, sa)

        cur_rx = rx_left if ca >= 0 else rx_right
        cur_ry = ry_top if sa >= 0 else ry_bot

        sx = sx_unit * cur_rx
        sy = sy_unit * cur_ry

        unified_verts.append(pt + side_x * sx + out_norm * sy)

total_rings = len(fore_pts) + num_neck_slices - 1
for i in range(len(fore_pts) - 1, total_rings - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        unified_faces.append((b + j, b + jn, n + jn, n + j))

# End of neck is at ring: total_rings - 1
last_neck_ring = (total_rings - 1) * ring_verts

# 3. KNEE CHEEK BLOCK RINGS
# We add the knee layers:
knee_base_vert = len(unified_verts)
for layer in range(knee_layers + 1):
    unified_verts.extend(knee_rings[layer])

for layer in range(knee_layers):
    b = knee_base_vert + layer * 8
    n = knee_base_vert + (layer + 1) * 8
    # Stave faces around back and sides (1..7)
    for j in range(1, 7):
        unified_faces.append((b + j, b + j + 1, n + j + 1, n + j))
    # Right side stave transition (7 -> 0)
    unified_faces.append((b + 7, b + 0, n + 0, n + 7))

# Bottom miter cut of knee rests flush on soundbox top:
b0 = knee_base_vert
unified_faces.append((b0+0, b0+7, b0+6, b0+5, b0+4, b0+3, b0+2, b0+1))

# Top dome cap of knee:
btop = knee_base_vert + knee_layers * 8
unified_faces.append((btop+0, btop+1, btop+2, btop+3, btop+4, btop+5, btop+6, btop+7))

# 4. BRIDGE / SEW THE HARMONIC NECK LAST RING DIRECTLY INTO THE KNEE BLOCK FRONT!
# Last neck ring has 16 vertices:
# Top spine is around vertex 4, bottom belly is around vertex 12, right side is vertex 8, left side is vertex 0
# The front of the knee has vertices p0[layer] (right) and p1[layer] (left) for layer=0..knee_layers
# Let's sew the neck perimeter to the knee front perimeter:
# Front-right seam: neck right side to knee p0
# Front-left seam: neck left side to knee p1
# Top seam: neck top to knee top (p0[20], p1[20])
# Bottom seam: neck bottom to knee bottom (p0[0], p1[0])

# To ensure seamless luthier continuity, we also bridge the neck end to the knee front wall:
for k in range(knee_layers):
    kp_curr_r = knee_base_vert + k * 8 + 0
    kp_next_r = knee_base_vert + (k + 1) * 8 + 0
    kp_curr_l = knee_base_vert + k * 8 + 1
    kp_next_l = knee_base_vert + (k + 1) * 8 + 1

    # Map k to neck ring vertices
    frac1 = k / knee_layers
    frac2 = (k + 1) / knee_layers
    
    # Quad on the right side connecting neck to knee right cheek:
    idx_neck_r1 = last_neck_ring + int(round(frac1 * 4 + 6)) % ring_verts
    idx_neck_r2 = last_neck_ring + int(round(frac2 * 4 + 6)) % ring_verts
    unified_faces.append((idx_neck_r1, kp_curr_r, kp_next_r, idx_neck_r2))

    # Quad on the left side connecting neck to knee left cheek:
    idx_neck_l1 = last_neck_ring + int(round((1.0 - frac1) * 4 + 14)) % ring_verts
    idx_neck_l2 = last_neck_ring + int(round((1.0 - frac2) * 4 + 14)) % ring_verts
    unified_faces.append((kp_curr_l, idx_neck_l1, idx_neck_l2, kp_next_l))

# Sew top of neck to top of knee:
unified_faces.append((last_neck_ring + 4, last_neck_ring + 5, btop + 1, btop + 0))
# Sew bottom of neck to soundboard top:
unified_faces.append((last_neck_ring + 12, last_neck_ring + 13, b0 + 0, b0 + 1))

unified_obj = create_mesh_obj("Harp_Unified_Pillar_Neck_Knee", unified_verts, unified_faces, mat=mat_maple, smooth=True)

bpy.context.view_layer.objects.active = unified_obj
weld = unified_obj.modifiers.new(name="Weld", type='WELD')
weld.merge_threshold = 0.003
bpy.ops.object.modifier_apply(modifier="Weld")

# 5. 8 STRINGS AND MECHANISMS (PRESERVE EXACT 9.492 CM SPACING)
neck_ctrl = [
    Vector((0.0, -0.335, 1.328)),
    Vector((0.0, -0.245, 1.295)),
    Vector((0.0, -0.105, 1.200)),
    Vector((0.0,  0.025, 1.095)),
    Vector((0.0,  0.155, 1.035)),
    Vector((0.0,  0.250, 1.075)),
    Vector((0.0,  0.355, 1.120)),
]
neck_samples = catmull_rom_spline(neck_ctrl, 100)
L_sb = (soundboard_center(1.0) - soundboard_center(0.0)).length
t8 = 0.812
margin = (1.0 - t8) * L_sb
t1 = margin / L_sb
span = (t8 - t1) * L_sb
d_step = span / 7.0

s8 = 0.835
idx8 = int(round(s8 * (len(neck_samples) - 1)))
cum_dist = [0.0]
for i in range(1, idx8 + 1):
    d = (neck_samples[i] - neck_samples[i - 1]).length
    cum_dist.append(cum_dist[-1] + d)

neck_step_indices = []
for deg_idx in range(8):
    target_d = deg_idx * d_step
    best_idx = 0
    best_diff = 999.0
    for i, cd in enumerate(cum_dist):
        diff = abs(cd - target_d)
        if diff < best_diff:
            best_diff = diff
            best_idx = i
    neck_step_indices.append(best_idx)

string_configs = [
    (1, "C", mat_red,   0.0016),
    (2, "D", mat_clear, 0.0014),
    (3, "E", mat_clear, 0.0013),
    (4, "F", mat_blue,  0.0012),
    (5, "G", mat_clear, 0.0011),
    (6, "A", mat_clear, 0.0010),
    (7, "B", mat_clear, 0.0009),
    (8, "C", mat_red,   0.00085),
]

for idx, (deg_num, note_name, s_mat, str_radius) in enumerate(string_configs):
    t_sb = t1 + idx * (d_step / L_sb)
    p_bot = soundboard_center(t_sb) + front_normal * 0.008
    neck_idx = neck_step_indices[idx]
    neck_pt = neck_samples[neck_idx]
    p_bridge = Vector((0.026, neck_pt.y, neck_pt.z - 0.016))
    p_top = p_bridge

    # Eyelet
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.0042, depth=0.004, location=p_bot)
    ey = bpy.context.active_object
    ey.name = f"Eyelet_{deg_num}"
    ey.data.materials.append(mat_chrome)

    # String body
    str_len = (p_top - p_bot).length
    s_verts, s_faces = [], []
    steps = 16
    for s_step in range(steps + 1):
        frac = s_step / steps
        c_pos = p_bot + (p_top - p_bot) * frac
        for ring_idx in range(8):
            ang = 2.0 * math.pi * ring_idx / 8
            sx = math.cos(ang) * str_radius
            sz = math.sin(ang) * str_radius
            s_verts.append(c_pos + Vector((sx, 0, sz)))
    for s_step in range(steps):
        b = s_step * 8
        n = (s_step + 1) * 8
        for k in range(8):
            kn = (k + 1) % 8
            s_faces.append((b + k, b + kn, n + kn, n + k))
    create_mesh_obj(f"String_{deg_num}", s_verts, s_faces, mat=s_mat, smooth=True)

# 6. LIGHTING & CAMERAS
bpy.ops.object.light_add(type='AREA', location=(1.45, -0.85, 1.45))
key_light = bpy.context.active_object
key_light.data.energy = 85.0
key_light.data.size = 2.0

bpy.ops.object.light_add(type='AREA', location=(-1.0, 1.35, 1.15))
fill_light = bpy.context.active_object
fill_light.data.energy = 50.0

bpy.ops.object.light_add(type='AREA', location=(-1.25, -0.60, 1.20))
back_light = bpy.context.active_object
back_light.data.energy = 60.0

bpy.ops.object.camera_add(location=(-0.85, 0.22, 1.08))
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 38
cam.rotation_mode = 'QUATERNION'

out_dir = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\public\models"

# Render 1: Tuning Pins Side (-X) Close-up
scene.render.resolution_x = 900
scene.render.resolution_y = 900
cam.location = Vector((-0.85, 0.22, 1.08))
cam.rotation_quaternion = (Vector((0.0, 0.25, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_sewn_right_side.png")
bpy.ops.render.render(write_still=True)

# Render 2: Lever Side (+X) Close-up
cam.location = Vector((0.75, 0.12, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.22, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_sewn_lever_side.png")
bpy.ops.render.render(write_still=True)

# Render 3: Rear-Right Perspective matching media_1792157424893_fc1ab799.png
scene.render.resolution_x = 960
scene.render.resolution_y = 780
cam.location = Vector((-0.82, 0.92, 1.22))
cam.rotation_quaternion = (Vector((0.0, 0.26, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_sewn_rear_right.png")
bpy.ops.render.render(write_still=True)

# Render 4: Top-Down Shoulder matching media_1792157244564_5b3230f7.png
cam.location = Vector((-0.45, 0.52, 1.52))
cam.rotation_quaternion = (Vector((0.0, 0.28, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_sewn_top_down.png")
bpy.ops.render.render(write_still=True)

print("Sewn luthier test completed successfully.")
