import os, sys, math, shutil
import bpy
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def make_pbr_mat(name, color_rgb, roughness=0.3, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color_rgb, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_maple = make_pbr_mat("Mat_Maple", (0.85, 0.72, 0.52), roughness=0.25)
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

# 5-stave soundbox
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

# Central string rib
rib_steps = 52
rib_verts, rib_faces = [], []
for i in range(rib_steps + 1):
    t = (i / rib_steps) * 0.965
    c = soundboard_center(t) + front_normal * 0.0015
    top_taper = 1.0
    if t > 0.90:
        top_taper = max(0.15, math.sqrt(max(0.0, 1.0 - ((t - 0.90) / 0.065)**2)))
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
for i in range(rib_steps):
    b = i * 6
    n = (i + 1) * 6
    for k in range(6):
        kn = (k + 1) % 6
        rib_faces.append((b + k, b + kn, n + kn, n + k))
rib_faces.append(tuple(reversed(range(0, 6))))
rib_faces.append(tuple(range(rib_steps * 6, (rib_steps + 1) * 6)))
create_mesh_obj("Harp_Central_String_Rib", rib_verts, rib_faces, mat=mat_walnut, smooth=False)

# 2. PURE LUTHIER UNIFIED HARMONIC NECK & KNEE AS ONE SEAMLESS PIECE
p_base = soundboard_center(0.042) + front_normal * 0.020
c_top  = soundboard_center(1.0)
hw_top, depth_top = soundbox_dimensions(1.0)

# Spline controls: Belly descends smoothly to meet soundboard top at c_top,
# and spine curves gracefully over dome crest and lands flush on soundbox top back stave
ctrl_pts = [
    p_base,                             # 0: Base seated in cradle
    Vector((0.0, -0.215, 0.360)),       # 1: Lower forepillar
    Vector((0.0, -0.295, 0.680)),       # 2: Mid forepillar
    Vector((0.0, -0.345, 1.000)),       # 3: Upper forepillar
    Vector((0.0, -0.358, 1.240)),       # 4: Approaching top bass crown
    Vector((0.0, -0.335, 1.328)),       # 5: Smooth rounded bass tip apex
    Vector((0.0, -0.245, 1.295)),       # 6: Start of harmonic neck S-curve
    Vector((0.0, -0.105, 1.200)),       # 7: Harmonic neck descent
    Vector((0.0,  0.025, 1.095)),       # 8: Mid neck inflection
    Vector((0.0,  0.155, 1.035)),       # 9: Treble gentle valley
    Vector((0.0,  0.245, 1.065)),       # 10: Smooth transition into knee
    Vector((0.0,  0.335, 1.130)),       # 11: Top knee crest apex
    Vector((0.0,  0.365, 1.075)),       # 12: Rear dome shoulder
    c_top + back_normal * (depth_top * 0.5)  # 13: Centered on soundbox top cut plane
]

num_samples = 150
curve_pts = catmull_rom_spline(ctrl_pts, num_samples)

ring_verts = 24
neck_verts, neck_faces = [], []
side_x = Vector((1.0, 0.0, 0.0))

for i in range(num_samples):
    s = i / (num_samples - 1)
    pt = curve_pts[i]
    p_prev = curve_pts[max(0, i - 1)]
    p_next = curve_pts[min(num_samples - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    base_taper = 0.65 + 0.35 * math.sin(min(1.0, s / 0.06) * (math.pi * 0.5))
    rx = 0.022 * base_taper
    crown_bump = 0.005 * math.exp(-((s - 0.38) / 0.10)**2)
    valley_slim = -0.006 * math.exp(-((s - 0.76) / 0.10)**2)
    ry = (0.032 + 0.016 * min(1.0, s / 0.25) + crown_bump + valley_slim) * base_taper

    # Width and height adaptation approaching the soundbox knee:
    if s > 0.72:
        w_fac = (s - 0.72) / 0.28
        # Right side widens smoothly to match hw_top (0.0486)
        rx_right = rx * (1.0 - w_fac) + (hw_top * 0.99) * w_fac
        # Left side widens but has crescent cutout sculpted in
        crescent_sweep = (math.sin(w_fac * math.pi * 0.85)**1.3) * 0.034
        rx_left  = (rx * (1.0 - w_fac) + (hw_top * 0.99) * w_fac)
        ry_top   = ry * (1.0 + 0.22 * (w_fac**1.2))
        
        # Belly extends directly down toward the soundboard/soundbox top
        t_sb = min(1.0, max(0.0, (pt.y - (-0.14)) / 0.45))
        sb_pt = soundboard_center(t_sb)
        vert_drop = max(0.0, pt.z - sb_pt.z)
        ry_bot   = ry * (1.0 - w_fac) + (vert_drop * 0.95) * w_fac
    else:
        rx_right = rx
        rx_left  = rx
        crescent_sweep = 0.0
        ry_top   = ry
        ry_bot   = ry

    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca, sa = math.cos(ang), math.sin(ang)

        # Profile: Flat vertical sides, rounded top and bottom
        sx_unit = math.copysign(abs(ca)**0.22, ca)
        sy_unit = math.copysign(abs(sa)**0.82, sa)

        if ca < 0:
            # Right side (-X): Smooth flat wooden plane, zero step
            cur_rx = rx_right
        else:
            # Left side (+X): Crescent cutout
            cur_rx = rx_left - crescent_sweep * math.sin(ang)**2

        cur_ry = ry_top if sa >= 0 else ry_bot
        sx = sx_unit * cur_rx
        sy = sy_unit * cur_ry

        neck_verts.append(pt + side_x * sx + out_norm * sy)

for i in range(num_samples - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        neck_faces.append((b + j, b + jn, n + jn, n + j))

neck_faces.append(tuple(reversed(range(0, ring_verts))))
top_b = (num_samples - 1) * ring_verts
neck_faces.append(tuple(range(top_b, top_b + ring_verts)))

# Subdivision Surface + Smooth Shading for absolute fluid luthier curvature
neck_obj = create_mesh_obj("Harp_Pure_Luthier_Neck", neck_verts, neck_faces, mat=mat_maple, smooth=True)

subsurf = neck_obj.modifiers.new(name="Subdivision", type='SUBSURF')
subsurf.levels = 1
subsurf.render_levels = 1
bpy.context.view_layer.objects.active = neck_obj
bpy.ops.object.modifier_apply(modifier="Subdivision")

for p in neck_obj.data.polygons:
    p.use_smooth = True
neck_obj.data.update()

# 3. 8 STRINGS AND MECHANISMS (PRESERVE EXACT VERIFIED SPACING)
def get_neck_s_curve_samples():
    neck_ctrl = [
        Vector((0.0, -0.335, 1.328)),
        Vector((0.0, -0.245, 1.295)),
        Vector((0.0, -0.105, 1.200)),
        Vector((0.0,  0.025, 1.095)),
        Vector((0.0,  0.155, 1.035)),
        Vector((0.0,  0.250, 1.075)),
        Vector((0.0,  0.355, 1.120)),
    ]
    return catmull_rom_spline(neck_ctrl, 100)

neck_samples = get_neck_s_curve_samples()
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

tot_dist = cum_dist[-1]
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
scene.render.filepath = os.path.join(out_dir, "test_luthier_right_side.png")
bpy.ops.render.render(write_still=True)

# Render 2: Lever Side (+X) Close-up
cam.location = Vector((0.75, 0.12, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.22, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_luthier_lever_side.png")
bpy.ops.render.render(write_still=True)

# Render 3: Rear-Right Perspective matching media_1792157424893_fc1ab799.png
scene.render.resolution_x = 960
scene.render.resolution_y = 780
cam.location = Vector((-0.82, 0.92, 1.22))
cam.rotation_quaternion = (Vector((0.0, 0.26, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_luthier_rear_right.png")
bpy.ops.render.render(write_still=True)

# Render 4: Top-Down Shoulder matching media_1792157244564_5b3230f7.png
cam.location = Vector((-0.45, 0.52, 1.52))
cam.rotation_quaternion = (Vector((0.0, 0.28, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_luthier_top_down.png")
bpy.ops.render.render(write_still=True)

print("Pure luthier test completed and all renders saved.")
