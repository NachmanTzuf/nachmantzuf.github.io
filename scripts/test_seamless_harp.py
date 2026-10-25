import os, sys, math, shutil
import bpy
from mathutils import Vector, Matrix, Quaternion

# Clean scene
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
mat_pin = make_pbr_mat("Mat_Pin", (0.12, 0.12, 0.14), roughness=0.2, metallic=0.9)
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

print("Soundbox built.")
