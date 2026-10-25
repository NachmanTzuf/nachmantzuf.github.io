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

# 2. SEAMLESS UNIFIED NECK + KNEE (v2: FULL DOME, FLUSH MITER, CONTINUOUS RIGHT CHEEK)
hw_top, depth_top = soundbox_dimensions(1.0)
c_top = soundboard_center(1.0) # (0, 0.310, 1.040)
p_rear_top = c_top + back_normal * depth_top # (0, 0.3963, 0.9998)

# Top spine curve: From Bass Crown Apex to Rear Soundbox Stave
spine_ctrl = [
    Vector((0.0, -0.335, 1.328)),  # Bass crown apex
    Vector((0.0, -0.245, 1.295)),  # High arch
    Vector((0.0, -0.105, 1.200)),  # Upper slope
    Vector((0.0,  0.025, 1.095)),  # Mid neck slope
    Vector((0.0,  0.155, 1.035)),  # Treble gentle valley
    Vector((0.0,  0.250, 1.075)),  # Neck rising toward knee
    Vector((0.0,  0.330, 1.138)),  # Knee shoulder apex (full bulbous dome)
    Vector((0.0,  0.375, 1.095)),  # Rear shoulder curve
    Vector((0.0,  0.396, 1.000)),  # Meeting soundbox rear stave flush
]

# Bottom belly curve: From Bass Crown Inside to Soundboard Front Top (0.310, 1.040)
belly_ctrl = [
    Vector((0.0, -0.265, 1.230)),  # Inside bass crown
    Vector((0.0, -0.190, 1.190)),  # Neck belly
    Vector((0.0, -0.065, 1.105)),  # Mid neck belly
    Vector((0.0,  0.065, 1.005)),  # Lower neck belly
    Vector((0.0,  0.185, 0.965)),  # Treble dip belly
    Vector((0.0,  0.260, 0.995)),  # Rising toward soundboard top
    Vector((0.0,  0.310, 1.040)),  # Meeting soundboard front edge flush
]

num_neck_slices = 50
num_knee_slices = 25
total_slices = num_neck_slices + num_knee_slices

spine_pts = catmull_rom_spline(spine_ctrl, total_slices)
belly_neck_pts = catmull_rom_spline(belly_ctrl, num_neck_slices)

ring_verts = 20
unified_verts, unified_faces = [], []

for i in range(total_slices):
    p_spine = spine_pts[i]
    frac_total = i / (total_slices - 1)

    if i < num_neck_slices:
        p_belly = belly_neck_pts[i]
        frac_neck = i / (num_neck_slices - 1)
        base_hw = 0.024 * (1.0 - 0.12 * math.sin(frac_neck * math.pi))
        
        # Smooth transition to hw_top starting at 65% of the neck:
        if frac_neck > 0.60:
            w_blend = (frac_neck - 0.60) / 0.40
            # Right side widens to EXACTLY hw_top (0.0486)
            rx_right = base_hw * (1.0 - w_blend) + hw_top * w_blend
            # Left side widens gently to provide string 8 clearance
            rx_left  = base_hw * (1.0 - w_blend) + (hw_top * 0.72) * w_blend
        else:
            rx_right = base_hw
            rx_left  = base_hw
        
        c_pt = (p_spine + p_belly) * 0.5
        h_half = (p_spine.z - p_belly.z) * 0.5
        is_knee = False
    else:
        knee_idx = i - num_neck_slices
        knee_frac = (knee_idx + 1) / num_knee_slices
        
        # Point on the soundbox top cut plane:
        p_bot = c_top + (p_rear_top - c_top) * knee_frac
        
        # In the knee block:
        # Right cheek is a continuous solid wall of width hw_top, tapering slightly at the rear stave
        stave_taper = 1.0 - 0.55 * (knee_frac**2.0)
        rx_right = hw_top * stave_taper
        
        # Left side has the sculpted crescent cutout hollow in the lower half
        crescent_sweep = (math.sin(knee_frac * math.pi * 0.85)**1.3) * (hw_top * 0.40)
        rx_left = max(0.020, hw_top * stave_taper - crescent_sweep)
        
        c_pt = (p_spine + p_bot) * 0.5
        h_half = (p_spine.z - p_bot.z) * 0.5
        is_knee = True

    # Build 20-gon ring:
    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca = math.cos(ang)
        sa = math.sin(ang)

        # Super-ellipse for flat vertical sides:
        sx_unit = math.copysign(abs(ca)**0.22, ca)
        sy_unit = math.copysign(abs(sa)**0.75, sa)

        cur_rx = rx_left if ca >= 0 else rx_right
        
        x = sx_unit * cur_rx

        if is_knee:
            # Flatten bottom to sit flush on soundbox top miter cut plane
            if sa < 0:
                y_vert = p_bot.y
                # Miter plane height at this Y:
                z_plane = 1.040 - 0.4662 * (p_bot.y - 0.310)
                # Blend upwards from the plane:
                z_vert = z_plane + (sa + 1.0) * h_half * 0.45
            else:
                y_vert = c_pt.y
                z_vert = c_pt.z + sy_unit * h_half
        else:
            y_vert = c_pt.y
            z_vert = c_pt.z + sy_unit * h_half

        unified_verts.append(Vector((x, y_vert, z_vert)))

for i in range(total_slices - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        unified_faces.append((b + j, b + jn, n + jn, n + j))

# End caps
unified_faces.append(tuple(reversed(range(0, ring_verts))))
end_b = (total_slices - 1) * ring_verts
unified_faces.append(tuple(range(end_b, end_b + ring_verts)))

unified_neck_knee = create_mesh_obj("Harp_Unified_Neck_Knee", unified_verts, unified_faces, mat=mat_maple, smooth=True)

# FOREPILLAR (from cradle shoe to bass crown)
fore_ctrl = [
    soundboard_center(0.042) + front_normal * 0.020,
    Vector((0.0, -0.215, 0.360)),
    Vector((0.0, -0.295, 0.680)),
    Vector((0.0, -0.345, 1.000)),
    Vector((0.0, -0.358, 1.240)),
    Vector((0.0, -0.335, 1.328)), # Meets bass crown apex
]
fore_pts = catmull_rom_spline(fore_ctrl, 40)
fore_verts, fore_faces = [], []
for i in range(len(fore_pts)):
    s = i / (len(fore_pts) - 1)
    pt = fore_pts[i]
    r = 0.022 * (0.85 + 0.35 * math.sin(s * math.pi))
    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        sx = math.cos(ang) * r
        sz = math.sin(ang) * r * 1.25
        fore_verts.append(pt + Vector((sx, 0, sz)))
for i in range(len(fore_pts) - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        fore_faces.append((b + j, b + jn, n + jn, n + j))
fore_faces.append(tuple(reversed(range(0, ring_verts))))
fore_faces.append(tuple(range((len(fore_pts) - 1) * ring_verts, len(fore_pts) * ring_verts)))
create_mesh_obj("Harp_Forepillar", fore_verts, fore_faces, mat=mat_maple, smooth=True)

# 3. 8 STRINGS AND MECHANISMS (EXACT 9.492 CM SPACING)
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

# 4. LIGHTING & CAMERAS
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
scene.render.filepath = os.path.join(out_dir, "test_v2_right_side.png")
bpy.ops.render.render(write_still=True)

# Render 2: Lever Side (+X) Close-up
cam.location = Vector((0.75, 0.12, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.22, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_v2_lever_side.png")
bpy.ops.render.render(write_still=True)

# Render 3: Rear-Right Perspective matching media_1792157424893_fc1ab799.png
scene.render.resolution_x = 960
scene.render.resolution_y = 780
cam.location = Vector((-0.82, 0.92, 1.22))
cam.rotation_quaternion = (Vector((0.0, 0.26, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_v2_rear_right.png")
bpy.ops.render.render(write_still=True)

# Render 4: Top-Down Shoulder matching media_1792157244564_5b3230f7.png
cam.location = Vector((-0.45, 0.52, 1.52))
cam.rotation_quaternion = (Vector((0.0, 0.28, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_v2_top_down.png")
bpy.ops.render.render(write_still=True)

print("Unified v2 test completed successfully.")
