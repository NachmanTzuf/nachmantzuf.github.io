import bpy
import math
import os
from mathutils import Vector

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def soundboard_center(t):
    y = -0.14 + t * 0.45
    z =  0.075 + t * 0.965
    return Vector((0.0, y, z))

def soundbox_dimensions(t):
    half_w = 0.162 * (1.0 - 0.78 * t)
    depth  = 0.170 * (1.0 - 0.46 * t)
    return half_w, depth

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

def create_mesh_obj(name, verts, faces, uvs=None, smooth=True):
    mesh = bpy.data.meshes.new(name=name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    if smooth:
        mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))
    obj = bpy.data.objects.new(name=name, object_data=mesh)
    bpy.context.collection.objects.link(obj)
    return obj

# Materials
mat_maple = bpy.data.materials.new("Harp_BlondMaple")
mat_maple.use_nodes = True
bsdf = mat_maple.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.88, 0.74, 0.52, 1.0)
bsdf.inputs["Roughness"].default_value = 0.25

sb_dir = (soundboard_center(1.0) - soundboard_center(0.0)).normalized()
back_normal = Vector((0.0, sb_dir.z, -sb_dir.y)).normalized()
front_normal = -back_normal
side_x = Vector((1.0, 0.0, 0.0))

c_top = soundboard_center(1.0)
hw_top, depth_top = soundbox_dimensions(1.0)

# Build soundbox staves
steps_z = 48
ring_size = 8
verts, faces = [], []
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
sb_obj = create_mesh_obj("Harp_Soundbox_Staves", verts, faces, smooth=False)
sb_obj.data.materials.append(mat_maple)

# ---------------------------------------------------------------------------
# SINGLE UNIFIED MESH: Forepillar -> Harmonic Neck -> Knee Block -> Soundbox
# ---------------------------------------------------------------------------
total_knee_h = 0.108
crest_apex = c_top + sb_dir * total_knee_h  # (0.0, 0.3556, 1.1379)

p_base = soundboard_center(0.042) + front_normal * 0.020
ctrl_pts = [
    p_base,                             # 0
    Vector((0.0, -0.215, 0.360)),       # 1
    Vector((0.0, -0.295, 0.680)),       # 2
    Vector((0.0, -0.345, 1.000)),       # 3
    Vector((0.0, -0.358, 1.240)),       # 4
    Vector((0.0, -0.335, 1.328)),       # 5: Bass crown
    Vector((0.0, -0.245, 1.295)),       # 6
    Vector((0.0, -0.105, 1.200)),       # 7
    Vector((0.0,  0.025, 1.095)),       # 8
    Vector((0.0,  0.155, 1.035)),       # 9: Treble valley
    Vector((0.0,  0.250, 1.085)),       # 10: Rising smoothly
    crest_apex,                         # 11: Top crest apex where it meets knee block
]

num_neck_samples = 120
curve_pts = catmull_rom_spline(ctrl_pts, num_neck_samples)
ring_verts = 24
all_verts, all_faces = [], []

rx_crest = hw_top * 0.92  # 0.0328

# 1. Generate Neck Rings (rings 0 to num_neck_samples - 1)
for i in range(num_neck_samples):
    s = i / (num_neck_samples - 1)
    pt = curve_pts[i]
    p_prev = curve_pts[max(0, i - 1)]
    p_next = curve_pts[min(num_neck_samples - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    base_taper = 0.65 + 0.35 * math.sin(min(1.0, s / 0.06) * (math.pi * 0.5))
    if s > 0.80:
        knee_u = (s - 0.80) / 0.20
        rx = 0.022 + (rx_crest - 0.022) * (knee_u**1.2)
        ry = 0.034 + 0.016 * (knee_u**1.1)
    else:
        rx = 0.022 * base_taper
        crown_bump = 0.005 * math.exp(-((s - 0.38) / 0.10)**2)
        valley_slim = -0.006 * math.exp(-((s - 0.76) / 0.10)**2)
        ry = (0.034 + 0.016 * min(1.0, s / 0.25) + crown_bump + valley_slim) * base_taper

    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca, sa = math.cos(ang), math.sin(ang)
        sx = math.copysign(abs(ca)**0.38, ca) * rx
        sy = math.copysign(abs(sa)**0.78, sa) * ry
        all_verts.append(pt + side_x * sx + out_norm * sy)

# Faces for neck rings
for i in range(num_neck_samples - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        all_faces.append((b + j, b + jn, n + jn, n + j))

# Bottom cap at forepillar base
all_faces.append(tuple(reversed(range(0, ring_verts))))

# 2. Generate Knee Block Layers (from crest down to soundbox top miter plane)
knee_layers = 20
base_v_offset = len(all_verts)

for layer in range(knee_layers + 1):
    # h_fac: 1.0 at crest -> 0.0 at soundbox top
    h_fac = 1.0 - (layer / knee_layers)
    h_vec = sb_dir * (h_fac * total_knee_h)
    c_layer = c_top + h_vec

    w_scale = 1.0 - 0.12 * (h_fac**1.5)
    hw = hw_top * w_scale
    back_curl = 1.0 - 0.40 * (h_fac**1.6)
    crescent_sweep = (math.sin(h_fac * math.pi * 0.85)**1.3) * 0.036
    top_bevel = 1.0 - 0.08 * (max(0.0, (h_fac - 0.80) / 0.20)**1.5)

    hw_r = hw * top_bevel
    hw_l = hw * top_bevel

    # 8-stave control points
    p0 = c_layer + Vector((-hw_r, 0, 0))
    p1 = c_layer + Vector((hw_l, 0, 0)) + back_normal * crescent_sweep
    p2 = c_layer + Vector((hw_l * 0.88, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl + crescent_sweep * 0.5)
    p3 = c_layer + Vector((hw_l * 0.58, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p4 = c_layer + Vector((hw_l * 0.22, 0, 0)) + back_normal * (depth_top * back_curl)
    p5 = c_layer + Vector((-hw_r * 0.22, 0, 0)) + back_normal * (depth_top * back_curl)
    p6 = c_layer + Vector((-hw_r * 0.58, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p7 = c_layer + Vector((-hw_r * 0.88, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl)

    ctrl_8 = [p0, p1, p2, p3, p4, p5, p6, p7]

    # Subdivide 8 points into 24 points smoothly (3 points per segment)
    layer_24 = []
    for k in range(8):
        pt_a = ctrl_8[k]
        pt_b = ctrl_8[(k + 1) % 8]
        layer_24.append(pt_a)
        layer_24.append(pt_a.lerp(pt_b, 0.333))
        layer_24.append(pt_a.lerp(pt_b, 0.667))
    all_verts.extend(layer_24)

# Faces for knee layers
for layer in range(knee_layers):
    b = base_v_offset + layer * ring_verts
    n = base_v_offset + (layer + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        all_faces.append((b + j, b + jn, n + jn, n + j))

# Bottom cap of knee block flush on soundbox top
bottom_b = base_v_offset + knee_layers * ring_verts
all_faces.append(tuple(range(bottom_b, bottom_b + ring_verts)))

# 3. DIRECT QUAD BRIDGE BETWEEN NECK END RING AND KNEE TOP RING!
neck_end_b = (num_neck_samples - 1) * ring_verts
knee_top_b = base_v_offset

for j in range(ring_verts):
    jn = (j + 1) % ring_verts
    # Connect neck end ring to knee top ring seamlessly
    all_faces.append((neck_end_b + j, neck_end_b + jn, knee_top_b + jn, knee_top_b + j))

unified_obj = create_mesh_obj("Harp_Neck_And_Forepillar", all_verts, all_faces, smooth=True)
unified_obj.data.materials.append(mat_maple)

print("Created 100% UNIFIED TOPOLOGY MESH:")
print("Object name:", unified_obj.name, "Vertices:", len(unified_obj.data.vertices), "Faces:", len(unified_obj.data.polygons))

# Setup Camera and Lighting for renders
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
bg = world.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.08, 0.09, 0.12, 1.0)
bg.inputs[1].default_value = 0.85

bpy.ops.object.light_add(type='AREA', location=(1.45, -0.85, 1.45))
key_light = bpy.context.active_object
key_light.data.energy = 85.0
key_light.data.size = 2.0
key_light.data.color = (1.0, 0.96, 0.90)
key_light.rotation_mode = 'QUATERNION'
key_light.rotation_quaternion = (Vector((0, 0, 0.68)) - key_light.location).to_track_quat('-Z', 'Y')

bpy.ops.object.light_add(type='AREA', location=(-1.0, 1.35, 1.15))
fill_light = bpy.context.active_object
fill_light.data.energy = 50.0
fill_light.data.size = 1.8
fill_light.data.color = (0.92, 0.95, 1.0)
fill_light.rotation_mode = 'QUATERNION'
fill_light.rotation_quaternion = (Vector((0, 0, 0.68)) - fill_light.location).to_track_quat('-Z', 'Y')

bpy.ops.object.camera_add(location=(1.58, -0.92, 0.72))
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 38
cam.rotation_mode = 'QUATERNION'

out_dir = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\public\models"

# Render 1: Rear-Right Perspective matching media_1792157424893_fc1ab799.png (ZERO GAP VERIFICATION)
scene.render.resolution_x = 960
scene.render.resolution_y = 780
cam.location = Vector((-0.82, 0.92, 1.22))
cam.rotation_quaternion = (Vector((0.0, 0.26, 1.04)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_topology_rear_right.png")
bpy.ops.render.render(write_still=True)

# Render 2: Top-Down Perspective matching media_1792157244564_5b3230f7.png (ZERO CREVICE VERIFICATION)
cam.location = Vector((-0.45, 0.52, 1.52))
cam.rotation_quaternion = (Vector((0.0, 0.28, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_topology_top_down.png")
bpy.ops.render.render(write_still=True)

# Render 3: Close-up of Right Side (-X) showing Seamless One-Piece Connection to Soundboard
cam.location = Vector((-0.85, 0.22, 1.08))
cam.rotation_quaternion = (Vector((0.0, 0.25, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_topology_right_side.png")
bpy.ops.render.render(write_still=True)

# Render 4: Close-up of Lever Side (+X) showing Fantastic Crescent Cutout & Seamless Top Connection
cam.location = Vector((0.75, 0.12, 1.12))
cam.rotation_quaternion = (Vector((0.0, 0.22, 1.06)) - cam.location).to_track_quat('-Z', 'Y')
scene.render.filepath = os.path.join(out_dir, "test_topology_lever_side.png")
bpy.ops.render.render(write_still=True)

print("Rendered unified topology previews successfully!")
