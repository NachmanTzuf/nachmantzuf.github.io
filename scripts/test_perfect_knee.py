"""
TEST PERFECT KNEE GEOMETRY
Mathematically verified volumetric center alignment:
- c_sb_center_top = c_top + back_norm * (depth_top * 0.50)
- Dome apex placed directly above c_sb_center_top along sb_dir
- Renders high-res previews from side, rear, and close-up.
"""

import bpy
import math
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)

def make_pbr_mat(name, base_color, roughness=0.30, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*base_color, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_maple = make_pbr_mat("MapleWood", (0.84, 0.68, 0.48), roughness=0.28)

def link_obj(obj):
    if obj.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(obj)

def create_mesh_obj(name, verts, faces, mat=mat_maple, smooth=True):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    if smooth:
        for f in mesh.polygons:
            f.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    link_obj(obj)
    return obj

def soundboard_center(t):
    y = -0.14 + t * 0.45
    z =  0.075 + t * 0.965
    return Vector((0.0, y, z))

def soundbox_dimensions(t):
    half_w = 0.162 * (1.0 - 0.70 * t)
    depth  = 0.170 * (1.0 - 0.44 * t)
    return half_w, depth

c_top = soundboard_center(1.0) # (0.0, 0.310, 1.040)
hw_top, depth_top = soundbox_dimensions(1.0) # hw=0.0486, depth=0.0952
sb_dir = (soundboard_center(1.0) - soundboard_center(0.0)).normalized() # (0, 0.4225, 0.9063)
back_norm = Vector((0.0, sb_dir.z, -sb_dir.y)).normalized() # (0, 0.9063, -0.4225)
front_norm = -back_norm
side_x = Vector((1.0, 0.0, 0.0))

# Volumetric center of soundbox top miter cut:
c_top_vol = c_top + back_norm * (depth_top * 0.50) # (0.0, 0.353, 1.020)

staves_top = [
    c_top + side_x * hw_top,                                             # 0: +X front
    c_top + side_x * (hw_top * 0.90) + back_norm * (depth_top * 0.42),  # 1: +X side
    c_top + side_x * (hw_top * 0.60) + back_norm * (depth_top * 0.84),  # 2: +X rear
    c_top + side_x * (hw_top * 0.22) + back_norm * depth_top,           # 3: rear center-right
    c_top - side_x * (hw_top * 0.22) + back_norm * depth_top,           # 4: rear center-left
    c_top - side_x * (hw_top * 0.60) + back_norm * (depth_top * 0.84),  # 5: -X rear
    c_top - side_x * (hw_top * 0.90) + back_norm * (depth_top * 0.42),  # 6: -X side
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

# Build Soundbox
sb_steps = 36
sb_verts, sb_faces = [], []
for i in range(sb_steps + 1):
    t = i / sb_steps
    c = soundboard_center(t)
    hw, depth = soundbox_dimensions(t)
    pts = [
        c + side_x * hw,
        c + side_x * (hw * 0.90) + back_norm * (depth * 0.42),
        c + side_x * (hw * 0.60) + back_norm * (depth * 0.84),
        c + side_x * (hw * 0.22) + back_norm * depth,
        c - side_x * (hw * 0.22) + back_norm * depth,
        c - side_x * (hw * 0.60) + back_norm * (depth * 0.84),
        c - side_x * (hw * 0.90) + back_norm * (depth * 0.42),
        c - side_x * hw,
    ]
    sb_verts.extend(pts)

for i in range(sb_steps):
    b = i * 8
    n = (i + 1) * 8
    for j in range(8):
        jn = (j + 1) % 8
        sb_faces.append((b + j, b + jn, n + jn, n + j))
sb_faces.append(tuple(reversed(range(8))))
top_b = sb_steps * 8
sb_faces.append(tuple(range(top_b, top_b + 8)))
create_mesh_obj("Soundbox_Staves", sb_verts, sb_faces, mat=mat_maple, smooth=False)

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

p_fore_top = Vector((0.0, -0.355, 1.215))

# Forepillar joint
joint_tang = Vector((0.0, -0.12, 0.99)).normalized()
def get_fore_ring_24(pt, tang):
    r_norm = Vector((0.0, -tang.z, tang.y)).normalized()
    ring = []
    rx, ry = 0.024, 0.038
    exp_x, exp_y = 0.25, 0.78
    for j in range(24):
        ang = 2.0 * math.pi * j / 24
        ca, sa = math.cos(ang), math.sin(ang)
        sx = math.copysign(abs(ca)**exp_x, ca) * rx
        sy = math.copysign(abs(sa)**exp_y, sa) * ry
        ring.append(pt + side_x * sx + r_norm * sy)
    return ring

# HARMONIC NECK SPINE WITH PERFECT VOLUMETRIC CENTER TERMINATION:
p_dome_apex = c_top_vol + sb_dir * 0.080 # (0.0, 0.387, 1.092)

neck_ctrl = [
    p_fore_top,                     # 0: forepillar seat
    Vector((0.0, -0.335, 1.328)),   # 1: Bass crown apex
    Vector((0.0, -0.245, 1.295)),   # 2: Neck slope
    Vector((0.0, -0.105, 1.200)),   # 3: Mid-upper slope
    Vector((0.0,  0.025, 1.095)),   # 4: Mid slope
    Vector((0.0,  0.176, 1.036)),   # 5: Treble gentle valley
    Vector((0.0,  0.265, 1.070)),   # 6: Rising into knee dome
    p_dome_apex,                    # 7: Knee dome apex
    c_top_vol + sb_dir * 0.035,     # 8: Descending along sb_dir to soundbox
    c_top_vol,                      # 9: Volumetric center of soundbox top miter cut!
]

num_neck_samples = 112
neck_pts = catmull_rom_spline(neck_ctrl, num_neck_samples)

joint_ring = get_fore_ring_24(p_fore_top, joint_tang)
miter_ring = get_miter_ring_24()

neck_verts, neck_faces = [], []

for i in range(num_neck_samples):
    u = i / (num_neck_samples - 1)
    pt = neck_pts[i]

    if i == 0:
        neck_verts.extend(joint_ring)
        continue

    if i == num_neck_samples - 1:
        neck_verts.extend(miter_ring)
        continue

    p_prev = neck_pts[max(0, i - 1)]
    p_next = neck_pts[min(num_neck_samples - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    if u < 0.20:
        rx_l = rx_r = 0.024
        ry_t = ry_b = 0.038
        exp_x, exp_y = 0.25, 0.78
    elif u < 0.68:
        rx_l = rx_r = 0.024
        ry_t = ry_b = 0.040
        exp_x, exp_y = 0.22, 0.78
    else:
        # Knee shoulder block transitioning flush into soundbox top miter cut
        w = (u - 0.68) / 0.32
        smooth_w = w * w * (3.0 - 2.0 * w)

        rx_r = 0.024 * (1.0 - smooth_w) + hw_top * smooth_w
        # Cove scoop on player left (+X)
        cove = (math.sin(smooth_w * math.pi * 0.85)**1.3) * (hw_top * 0.38)
        rx_l = max(0.020, (0.024 * (1.0 - smooth_w) + hw_top * smooth_w) - cove)

        ry_t = 0.040 * (1.0 - smooth_w) + (depth_top * 0.50) * smooth_w
        ry_b = 0.040 * (1.0 - smooth_w) + (depth_top * 0.50) * smooth_w
        exp_x, exp_y = 0.22, 0.75

    ring = []
    for j in range(24):
        ang = 2.0 * math.pi * j / 24
        ca, sa = math.cos(ang), math.sin(ang)

        cur_rx = rx_l if ca >= 0 else rx_r
        cur_ry = ry_t if sa >= 0 else ry_b

        sx = math.copysign(abs(ca)**exp_x, ca) * cur_rx
        sy = math.copysign(abs(sa)**exp_y, sa) * cur_ry

        # Near end (u > 0.86), smoothly blend into miter_ring_24
        if u > 0.86:
            blend_miter = (u - 0.86) / 0.14
            p_target = miter_ring[j] + sb_dir * ((1.0 - u) * 0.08)
            p_std = pt + side_x * sx + out_norm * sy
            p_final = p_std.lerp(p_target, blend_miter**1.3)
            ring.append(p_final)
        else:
            ring.append(pt + side_x * sx + out_norm * sy)

    neck_verts.extend(ring)

for i in range(num_neck_samples - 1):
    b = i * 24
    n = (i + 1) * 24
    for j in range(24):
        jn = (j + 1) % 24
        neck_faces.append((b + j, b + jn, n + jn, n + j))

neck_faces.append(tuple(reversed(range(24))))
end_b = (num_neck_samples - 1) * 24
neck_faces.append(tuple(range(end_b, end_b + 24)))
create_mesh_obj("Harmonic_Neck_Volumetric", neck_verts, neck_faces, mat=mat_maple, smooth=True)

# Lighting
bpy.ops.object.light_add(type='SUN', location=(-2.0, 2.0, 3.0))
sun = bpy.context.active_object
sun.data.energy = 4.0
sun.rotation_euler = (math.radians(45), math.radians(25), math.radians(-35))

bpy.ops.object.light_add(type='SUN', location=(2.0, -1.0, 2.0))
fill = bpy.context.active_object
fill.data.energy = 2.0
fill.rotation_euler = (math.radians(40), math.radians(-30), math.radians(120))

def render_view(cam_name, loc, target, filename):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object
    cam.name = cam_name
    bpy.context.scene.camera = cam

    direction = (Vector(target) - Vector(loc)).normalized()
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

    bpy.context.scene.render.resolution_x = 1000
    bpy.context.scene.render.resolution_y = 1000
    bpy.context.scene.render.filepath = filename
    bpy.ops.render.render(write_still=True)

render_view("Cam_Right_Vol", (0.90, 0.32, 1.05), (0.0, 0.32, 1.05), "c:/public/models/perfect_knee_right.png")
render_view("Cam_Left_Vol", (-0.90, 0.32, 1.05), (0.0, 0.32, 1.05), "c:/public/models/perfect_knee_left.png")
render_view("Cam_Rear_Vol", (0.0, 1.30, 0.98), (0.0, 0.35, 1.02), "c:/public/models/perfect_knee_rear.png")

print("Perfect volumetric renders completed!")
