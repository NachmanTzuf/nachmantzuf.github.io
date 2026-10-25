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

# 2. HARMONIC NECK & FOREPILLAR (AUTHENTIC FLAT SIDES WITH ROUNDED EDGES)
p_base = soundboard_center(0.042) + front_normal * 0.020
c_top  = soundboard_center(1.0)
hw_top, depth_top = soundbox_dimensions(1.0)

ctrl_pts = [
    p_base,
    Vector((0.0, -0.215, 0.360)),
    Vector((0.0, -0.295, 0.680)),
    Vector((0.0, -0.345, 1.000)),
    Vector((0.0, -0.358, 1.240)),
    Vector((0.0, -0.335, 1.328)),
    Vector((0.0, -0.245, 1.295)),
    Vector((0.0, -0.105, 1.200)),
    Vector((0.0,  0.025, 1.095)),
    Vector((0.0,  0.155, 1.035)),
    Vector((0.0,  0.250, 1.075)),
    Vector((0.0,  0.335, 1.130)),
    Vector((0.0,  0.360, 1.075)),
    Vector((0.0,  0.345, 1.035)),
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

    # Along the harmonic neck, use a rectangular cross-section with flat sides and rounded corners!
    # Approaching the knee (s > 0.72), widen the right side to EXACTLY hw_top (0.0486)
    if s > 0.72:
        w_fac = (s - 0.72) / 0.28
        rx_right = rx * (1.0 - w_fac) + (hw_top * 0.99) * w_fac
        rx_left  = rx * (1.0 - w_fac) + (hw_top * 0.99) * w_fac
        ry_top = ry * (1.0 + 0.25 * (w_fac**1.2))
        ry_bot = ry * (1.0 + 0.40 * (w_fac**1.2))
    else:
        rx_right = rx
        rx_left  = rx
        ry_top = ry
        ry_bot = ry

    # Authentic harp neck profile: flat vertical sides + rounded top and bottom caps
    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca, sa = math.cos(ang), math.sin(ang)
        
        # Super-ellipse with very flat sides: exponent 0.18 on X makes sides completely flat!
        sx_unit = math.copysign(abs(ca)**0.18, ca)
        sy_unit = math.copysign(abs(sa)**0.85, sa)
        
        cur_rx = rx_left if ca >= 0 else rx_right
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

neck_obj = create_mesh_obj("Harp_Neck_And_Forepillar", neck_verts, neck_faces, mat=mat_maple, smooth=True)

# 3. KNEE CHEEK BLOCK WITH MATCHING HW_TOP AND EXTENDED FRONT
knee_layers = 24
k_verts, k_faces = [], []
total_knee_h = 0.115

for layer in range(knee_layers + 1):
    h_fac = layer / knee_layers
    h_vec = sb_dir * (h_fac * total_knee_h)
    c_layer = c_top + h_vec

    w_scale = 1.0 - 0.04 * (h_fac**1.5)
    hw = hw_top * w_scale
    back_curl = 1.0 - 0.38 * (h_fac**1.6)
    crescent_sweep = (math.sin(h_fac * math.pi * 0.85)**1.3) * 0.034
    top_bevel = 1.0 - 0.04 * (max(0.0, (h_fac - 0.80) / 0.20)**1.5)

    front_fill = (1.0 - h_fac)**1.0 * 0.090

    p0 = c_layer + Vector((-hw * top_bevel, 0, 0)) + front_normal * front_fill
    p1 = c_layer + Vector(( hw * top_bevel, 0, 0)) + back_normal * crescent_sweep + front_normal * (front_fill * 0.5)
    p2 = c_layer + Vector(( hw * 0.88 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl + crescent_sweep * 0.5)
    p3 = c_layer + Vector(( hw * 0.58 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p4 = c_layer + Vector(( hw * 0.22 * top_bevel, 0, 0)) + back_normal * (depth_top * back_curl)
    p5 = c_layer + Vector((-hw * 0.22 * top_bevel, 0, 0)) + back_normal * (depth_top * back_curl)
    p6 = c_layer + Vector((-hw * 0.58 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p7 = c_layer + Vector((-hw * 0.88 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl)

    k_verts.extend([p0, p1, p2, p3, p4, p5, p6, p7])

for layer in range(knee_layers):
    b = layer * 8
    n = (layer + 1) * 8
    for j in range(8):
        jn = (j + 1) % 8
        k_faces.append((b + j, b + jn, n + jn, n + j))

k_faces.append(tuple(reversed(range(0, 8))))
top_b = knee_layers * 8
k_faces.append(tuple(range(top_b, top_b + 8)))

knee_obj = create_mesh_obj("Harp_Knee_Cheek_Block", k_verts, k_faces, mat=mat_maple, smooth=True)

# 4. JOIN + VOXEL REMESH + SMOOTH
bpy.ops.object.select_all(action='DESELECT')
neck_obj.select_set(True)
knee_obj.select_set(True)
bpy.context.view_layer.objects.active = neck_obj
bpy.ops.object.join()

remesh = neck_obj.modifiers.new(name="VoxelRemesh", type='REMESH')
remesh.mode = 'VOXEL'
remesh.voxel_size = 0.0032  # 3.2mm fine voxels
remesh.adaptivity = 0.0
bpy.ops.object.modifier_apply(modifier="VoxelRemesh")

smooth = neck_obj.modifiers.new(name="SurfaceSmooth", type='SMOOTH')
smooth.factor = 0.40
smooth.iterations = 2
bpy.ops.object.modifier_apply(modifier="SurfaceSmooth")

for p in neck_obj.data.polygons:
    p.use_smooth = True
neck_obj.data.update()

# 5. LIGHTING & CAMERAS
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
scene.render.filepath = os.path.join(out_dir, "test_flat_right_side.png")
bpy.ops.render.render(write_still=True)

# Render 2: Lever Side (+X) Close-up
cam.location = Vector((0.75, 0.12, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.22, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_flat_lever_side.png")
bpy.ops.render.render(write_still=True)

# Render 3: Rear-Right Perspective
scene.render.resolution_x = 960
scene.render.resolution_y = 780
cam.location = Vector((-0.82, 0.92, 1.22))
cam.rotation_quaternion = (Vector((0.0, 0.26, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_flat_rear_right.png")
bpy.ops.render.render(write_still=True)

# Render 4: Top-Down Shoulder
cam.location = Vector((-0.45, 0.52, 1.52))
cam.rotation_quaternion = (Vector((0.0, 0.28, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_flat_top_down.png")
bpy.ops.render.render(write_still=True)

print("Flat sides test completed and all renders saved.")
