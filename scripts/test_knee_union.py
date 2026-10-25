import bpy
import math
import os
import shutil
from mathutils import Vector

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def soundboard_center(t):
    y = -0.14 + t * 0.45
    z =  0.075 + t * 0.965
    return Vector((0.0, y, z))

def soundbox_dimensions(t):
    half_w = 0.162 * (1.0 - 0.67 * t)
    depth  = 0.170 * (1.0 - 0.44 * t)
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

# Build extended neck spline that carries over the knee crest down into the soundbox
sb_dir = (soundboard_center(1.0) - soundboard_center(0.0)).normalized()
back_normal = Vector((0.0, sb_dir.z, -sb_dir.y)).normalized()
front_normal = -back_normal
side_x = Vector((1.0, 0.0, 0.0))

p_base = soundboard_center(0.042) + front_normal * 0.020
c_top  = soundboard_center(1.0)
hw_top, depth_top = soundbox_dimensions(1.0)

ctrl_pts = [
    p_base,                             # 0
    Vector((0.0, -0.215, 0.360)),       # 1
    Vector((0.0, -0.295, 0.680)),       # 2
    Vector((0.0, -0.345, 1.000)),       # 3
    Vector((0.0, -0.358, 1.240)),       # 4
    Vector((0.0, -0.335, 1.328)),       # 5
    Vector((0.0, -0.245, 1.295)),       # 6
    Vector((0.0, -0.105, 1.200)),       # 7
    Vector((0.0,  0.025, 1.095)),       # 8
    Vector((0.0,  0.155, 1.035)),       # 9
    Vector((0.0,  0.250, 1.075)),       # 10
    Vector((0.0,  0.345, 1.135)),       # 11: Top knee crest apex
    Vector((0.0,  0.385, 1.090)),       # 12: Curving over the crest down the rear shoulder
    Vector((0.0,  0.370, 1.035)),       # 13: Entering the soundbox top miter plane
]

num_samples = 150
curve_pts = catmull_rom_spline(ctrl_pts, num_samples)
ring_verts = 24
verts, faces = [], []

for i in range(num_samples):
    s = i / (num_samples - 1)
    pt = curve_pts[i]
    p_prev = curve_pts[max(0, i - 1)]
    p_next = curve_pts[min(num_samples - 1, i + 1)]
    tang = (p_next - p_prev).normalized()
    out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    base_taper = 0.65 + 0.35 * math.sin(min(1.0, s / 0.06) * (math.pi * 0.5))
    # Near the knee shoulder (s > 0.82), widen gracefully to match the shoulder block
    if s > 0.82:
        knee_merge_fac = (s - 0.82) / 0.18
        base_taper *= (1.0 + 0.45 * knee_merge_fac)
    
    rx = 0.022 * base_taper
    crown_bump = 0.005 * math.exp(-((s - 0.40) / 0.10)**2)
    valley_slim = -0.006 * math.exp(-((s - 0.78) / 0.10)**2)
    ry = (0.032 + 0.016 * min(1.0, s / 0.25) + crown_bump + valley_slim) * base_taper

    for j in range(ring_verts):
        ang = 2.0 * math.pi * j / ring_verts
        ca, sa = math.cos(ang), math.sin(ang)
        sx = math.copysign(abs(ca)**0.40, ca) * rx
        sy = math.copysign(abs(sa)**0.78, sa) * ry
        verts.append(pt + side_x * sx + out_norm * sy)

for i in range(num_samples - 1):
    b = i * ring_verts
    n = (i + 1) * ring_verts
    for j in range(ring_verts):
        jn = (j + 1) % ring_verts
        faces.append((b + j, b + jn, n + jn, n + j))

faces.append(tuple(reversed(range(0, ring_verts))))
top_b = (num_samples - 1) * ring_verts
faces.append(tuple(range(top_b, top_b + ring_verts)))

neck_obj = create_mesh_obj("Neck_Forepillar", verts, faces)

# Build authentic knee cheek block
knee_layers = 20
k_verts, k_faces = [], []
total_knee_h = 0.108

for layer in range(knee_layers + 1):
    h_fac = layer / knee_layers
    h_vec = sb_dir * (h_fac * total_knee_h)
    c_layer = c_top + h_vec
    w_scale = 1.0 - 0.28 * (h_fac**1.5)
    hw = hw_top * w_scale
    back_curl = 1.0 - 0.40 * (h_fac**1.6)
    crescent_sweep = (math.sin(h_fac * math.pi * 0.85)**1.3) * 0.036
    top_bevel = 1.0 - 0.14 * (max(0.0, (h_fac - 0.80) / 0.20)**1.5)

    p0 = c_layer + Vector((-hw * top_bevel, 0, 0))
    p1 = c_layer + Vector((hw * top_bevel, 0, 0)) + back_normal * crescent_sweep
    p2 = c_layer + Vector((hw * 0.88 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl + crescent_sweep * 0.5)
    p3 = c_layer + Vector((hw * 0.58 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p4 = c_layer + Vector((hw * 0.22 * top_bevel, 0, 0)) + back_normal * (depth_top * back_curl)
    p5 = c_layer + Vector((-hw * 0.22 * top_bevel, 0, 0)) + back_normal * (depth_top * back_curl)
    p6 = c_layer + Vector((-hw * 0.58 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.84 * back_curl)
    p7 = c_layer + Vector((-hw * 0.88 * top_bevel, 0, 0)) + back_normal * (depth_top * 0.42 * back_curl)

    ring = [p0, p1, p2, p3, p4, p5, p6, p7]
    k_verts.extend(ring)

for layer in range(knee_layers):
    b = layer * 8
    n = (layer + 1) * 8
    for j in range(8):
        jn = (j + 1) % 8
        k_faces.append((b + j, b + jn, n + jn, n + j))

k_faces.append(tuple(reversed(range(0, 8))))
top_b = knee_layers * 8
k_faces.append(tuple(range(top_b, top_b + 8)))

knee_obj = create_mesh_obj("Knee_Block", k_verts, k_faces)

print("Created Neck (verts:", len(neck_obj.data.vertices), ") and Knee (verts:", len(knee_obj.data.vertices), ")")

# Test Boolean Union
mod = neck_obj.modifiers.new(name="Union_Knee", type='BOOLEAN')
mod.operation = 'UNION'
mod.object = knee_obj
mod.solver = 'EXACT'

bpy.context.view_layer.objects.active = neck_obj
bpy.ops.object.modifier_apply(modifier="Union_Knee")

# Delete the knee object after union
bpy.data.objects.remove(knee_obj, do_unlink=True)

# Add Weld modifier to clean up tiny coincident seam vertices
weld = neck_obj.modifiers.new(name="Weld_Seams", type='WELD')
weld.merge_threshold = 0.0015
bpy.ops.object.modifier_apply(modifier="Weld_Seams")

print("After Union, Neck has verts:", len(neck_obj.data.vertices), "polygons:", len(neck_obj.data.polygons))
