"""
TEST LUTHIER KNEE & CAMAC LEVER FLIP
Exact authentic construction matching user video references:
1. Knee dome continuing soundbox staves upward with zero step.
2. Neck flowing into knee with smooth fillet (no tight loop).
3. Camac levers: resting pose is DOWN (disengaged, angled 40 deg into inter-string space),
   flipped pose is UP (engaged, rotated up by 135 deg).
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)

# ---------------------------------------------------------------------------
# MATERIALS
# ---------------------------------------------------------------------------
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
mat_chrome = make_pbr_mat("ChromeMetal", (0.92, 0.93, 0.95), roughness=0.12, metallic=0.98)
mat_gunmetal = make_pbr_mat("Gunmetal", (0.22, 0.24, 0.26), roughness=0.25, metallic=0.90)
mat_red = make_pbr_mat("RedBand", (0.85, 0.08, 0.10), roughness=0.30)
mat_blue = make_pbr_mat("BlueBand", (0.08, 0.28, 0.88), roughness=0.30)

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

# ---------------------------------------------------------------------------
# SOUNDBOX DEFINITION
# ---------------------------------------------------------------------------
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

def get_staves_8(center, hw, depth, dir_back=back_norm):
    return [
        center + side_x * hw,                                            # 0: +X front
        center + side_x * (hw * 0.90) + dir_back * (depth * 0.42),       # 1: +X side
        center + side_x * (hw * 0.60) + dir_back * (depth * 0.84),       # 2: +X rear
        center + side_x * (hw * 0.22) + dir_back * depth,                # 3: rear center-right
        center - side_x * (hw * 0.22) + dir_back * depth,                # 4: rear center-left
        center - side_x * (hw * 0.60) + dir_back * (depth * 0.84),       # 5: -X rear
        center - side_x * (hw * 0.90) + dir_back * (depth * 0.42),       # 6: -X side
        center - side_x * hw,                                            # 7: -X front
    ]

# Build Soundbox
sb_steps = 36
sb_verts, sb_faces = [], []
for i in range(sb_steps + 1):
    t = i / sb_steps
    c = soundboard_center(t)
    hw, depth = soundbox_dimensions(t)
    ring = get_staves_8(c, hw, depth)
    sb_verts.extend(ring)

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

# ---------------------------------------------------------------------------
# CATMULL-ROM SPLINE
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# FOREPILLAR
# ---------------------------------------------------------------------------
p_fore_base = soundboard_center(0.042) + front_norm * 0.020
p_fore_top  = Vector((0.0, -0.355, 1.215))

fore_ctrl = [
    p_fore_base,
    Vector((0.0, -0.215, 0.360)),
    Vector((0.0, -0.365, 0.680)),
    Vector((0.0, -0.415, 0.980)),
    p_fore_top,
]
fore_samples = catmull_rom_spline(fore_ctrl, 48)

joint_tang = Vector((0.0, -0.12, 0.99)).normalized()
joint_norm = Vector((0.0, -joint_tang.z, joint_tang.y)).normalized()

def get_fore_ring_24(pt, tang):
    r_norm = Vector((0.0, -tang.z, tang.y)).normalized()
    ring = []
    rx = 0.024
    ry = 0.038
    exp_x = 0.25
    exp_y = 0.78
    for j in range(24):
        ang = 2.0 * math.pi * j / 24
        ca = math.cos(ang)
        sa = math.sin(ang)
        sx = math.copysign(abs(ca)**exp_x, ca) * rx
        sy = math.copysign(abs(sa)**exp_y, sa) * ry
        ring.append(pt + side_x * sx + r_norm * sy)
    return ring

f_verts, f_faces = [], []
for i in range(len(fore_samples)):
    pt = fore_samples[i]
    if i == len(fore_samples) - 1:
        ring = get_fore_ring_24(p_fore_top, joint_tang)
    else:
        p_prev = fore_samples[max(0, i - 1)]
        p_next = fore_samples[min(len(fore_samples) - 1, i + 1)]
        tang = (p_next - p_prev).normalized()
        ring = get_fore_ring_24(pt, tang)
    f_verts.extend(ring)

for i in range(len(fore_samples) - 1):
    b = i * 24
    n = (i + 1) * 24
    for j in range(24):
        jn = (j + 1) % 24
        f_faces.append((b + j, b + jn, n + jn, n + j))
f_faces.append(tuple(reversed(range(24))))
f_faces.append(tuple(range((len(fore_samples) - 1) * 24, len(fore_samples) * 24)))
create_mesh_obj("Forepillar", f_verts, f_faces, mat=mat_maple, smooth=True)

# ---------------------------------------------------------------------------
# LUTHIER KNEE & HARMONIC NECK: ONE SEAMLESS SOLID MESH
# ---------------------------------------------------------------------------
# Look at the physical luthier joint (user video 1, frame 5 and frame 25):
# 1. The soundbox staves end flat at miter plane (c_top).
# 2. From c_top, the knee block extends UP along sb_dir by 0.085 m.
#    The rear staves of the knee block match the soundbox staves exactly.
#    The dome cap curves over the top at height +0.085 m.
# 3. The neck beam sweeps from forepillar crown, through the treble valley (Y=0.176, Z=1.036),
#    and enters the front face of this knee block!
# 4. On player's right (-X): the neck side wall is perfectly flush with the soundbox/knee right side wall.
# 5. On player's left (+X): the knee block has the beautiful concave crescent cove scoop.

# Let's model the unified Neck + Knee mesh using bmesh:
bm = bmesh.new()

# A. Build the Harmonic Neck beam from forepillar crown to knee front:
neck_ctrl = [
    p_fore_top,                     # 0: resting on forepillar top cap
    Vector((0.0, -0.335, 1.328)),   # 1: Bass crown apex
    Vector((0.0, -0.245, 1.295)),   # 2: Neck slope
    Vector((0.0, -0.105, 1.200)),   # 3: Mid-upper slope
    Vector((0.0,  0.025, 1.095)),   # 4: Mid slope
    Vector((0.0,  0.176, 1.036)),   # 5: Treble gentle valley
    Vector((0.0,  0.245, 1.060)),   # 6: Rising into knee block
    c_top + sb_dir * 0.045,         # 7: Inside knee block
]

num_n_steps = 72
n_pts = catmull_rom_spline(neck_ctrl, num_n_steps)

neck_ring_bm_verts = []
for i in range(num_n_steps):
    u = i / (num_n_steps - 1)
    pt = n_pts[i]

    if i == 0:
        ring_pts = get_fore_ring_24(p_fore_top, joint_tang)
    else:
        p_prev = n_pts[max(0, i - 1)]
        p_next = n_pts[min(num_n_steps - 1, i + 1)]
        tang = (p_next - p_prev).normalized()
        out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

        if u < 0.20:
            rx_l = rx_r = 0.024
            ry_t = ry_b = 0.038
            exp_x = 0.25
            exp_y = 0.78
        elif u < 0.75:
            rx_l = rx_r = 0.024
            ry_t = ry_b = 0.040
            exp_x = 0.22
            exp_y = 0.78
        else:
            # Entering knee block: expand to meet knee dimensions
            w = (u - 0.75) / 0.25
            smooth_w = w * w * (3.0 - 2.0 * w)
            rx_r = 0.024 * (1.0 - smooth_w) + hw_top * smooth_w
            # Cove scoop on left side (+X)
            cove = math.sin(smooth_w * math.pi * 0.9) * (hw_top * 0.35)
            rx_l = (0.024 * (1.0 - smooth_w) + hw_top * smooth_w) - cove
            ry_t = 0.040 * (1.0 - smooth_w) + 0.055 * smooth_w
            ry_b = 0.040 * (1.0 - smooth_w) + 0.035 * smooth_w
            exp_x = 0.22 * (1.0 - smooth_w) + 0.30 * smooth_w
            exp_y = 0.78 * (1.0 - smooth_w) + 0.72 * smooth_w

        ring_pts = []
        for j in range(24):
            ang = 2.0 * math.pi * j / 24
            ca = math.cos(ang)
            sa = math.sin(ang)
            cur_rx = rx_l if ca >= 0 else rx_r
            cur_ry = ry_t if sa >= 0 else ry_b
            sx = math.copysign(abs(ca)**exp_x, ca) * cur_rx
            sy = math.copysign(abs(sa)**exp_y, sa) * ry_b if sa < 0 else math.copysign(abs(sa)**exp_y, sa) * ry_t
            ring_pts.append(pt + side_x * sx + out_norm * sy)

    bm_ring = [bm.verts.new(p) for p in ring_pts]
    neck_ring_bm_verts.append(bm_ring)

# Faces along neck
for i in range(num_n_steps - 1):
    r1 = neck_ring_bm_verts[i]
    r2 = neck_ring_bm_verts[i + 1]
    for j in range(24):
        jn = (j + 1) % 24
        bm.faces.new((r1[j], r1[jn], r2[jn], r2[j]))

# Cap at forepillar crown joint
bm.faces.new(reversed(neck_ring_bm_verts[0]))

# B. Build the Knee Dome Block rising from soundbox top miter cut:
# The knee block has vertical levels along sb_dir starting from c_top (level 0 = miter cut)
knee_levels = 16
knee_height = 0.092 # 9.2 cm dome height along sb_dir
knee_rings_bm = []

for k in range(knee_levels + 1):
    v = k / knee_levels
    # Height along sb_dir
    h = v * knee_height
    c_level = c_top + sb_dir * h

    # Width and depth at this level:
    # At v=0: exact soundbox top (hw_top, depth_top)
    # As v increases, the top staves round inward to form the dome cap!
    if v < 0.40:
        # Lower knee block: exact continuation of soundbox staves
        hw_k = hw_top
        dp_k = depth_top
        dome_round = 0.0
    else:
        # Upper dome: staves round smoothly inward to dome apex
        dv = (v - 0.40) / 0.60
        # Spherical / elliptical dome profile: sqrt(1 - dv^2)
        dome_fac = math.sqrt(max(0.0, 1.0 - dv**2))
        hw_k = hw_top * (0.35 + 0.65 * dome_fac)
        dp_k = depth_top * (0.25 + 0.75 * dome_fac)
        dome_round = (1.0 - dome_fac) * 0.015

    # Center shifts slightly forward towards neck as it rounds into dome
    c_eff = c_level - back_norm * dome_round

    staves_k = [
        c_eff + side_x * hw_k,                                            # 0: +X front
        c_eff + side_x * (hw_k * 0.90) + back_norm * (dp_k * 0.42),       # 1: +X side
        c_eff + side_x * (hw_k * 0.60) + back_norm * (dp_k * 0.84),       # 2: +X rear
        c_eff + side_x * (hw_k * 0.22) + back_norm * dp_k,                # 3: rear center-right
        c_eff - side_x * (hw_k * 0.22) + back_norm * dp_k,                # 4: rear center-left
        c_eff - side_x * (hw_k * 0.60) + back_norm * (dp_k * 0.84),       # 5: -X rear
        c_eff - side_x * (hw_k * 0.90) + back_norm * (dp_k * 0.42),       # 6: -X side
        c_eff - side_x * hw_k,                                            # 7: -X front
    ]

    # Convert 8 staves to 24-gon matching neck ring alignment:
    # j=0 at +X, j=6 at rear center, j=12 at -X, j=18 at front
    ring_24 = [None] * 24
    ring_24[0] = staves_k[0]
    ring_24[1] = staves_k[0].lerp(staves_k[1], 0.5)
    ring_24[2] = staves_k[1]
    ring_24[3] = staves_k[2]
    ring_24[4] = staves_k[2].lerp(staves_k[3], 0.5)
    ring_24[5] = staves_k[3]
    ring_24[6] = staves_k[3].lerp(staves_k[4], 0.5)

    ring_24[7]  = staves_k[4]
    ring_24[8]  = staves_k[4].lerp(staves_k[5], 0.5)
    ring_24[9]  = staves_k[5]
    ring_24[10] = staves_k[6]
    ring_24[11] = staves_k[6].lerp(staves_k[7], 0.5)
    ring_24[12] = staves_k[7]

    for m in range(1, 12):
        ring_24[12 + m] = staves_k[7].lerp(staves_k[0], m / 12.0)

    bm_k_ring = [bm.verts.new(p) for p in ring_24]
    knee_rings_bm.append(bm_k_ring)

# Faces along knee dome
for k in range(knee_levels):
    r1 = knee_rings_bm[k]
    r2 = knee_rings_bm[k + 1]
    for j in range(24):
        jn = (j + 1) % 24
        bm.faces.new((r1[j], r1[jn], r2[jn], r2[j]))

# Base cap of knee (sits 100% flush on soundbox top miter cut)
bm.faces.new(reversed(knee_rings_bm[0]))

# Top cap of dome (at apex)
bm.faces.new(knee_rings_bm[-1])

# Finish bmesh to mesh
mesh_neck_knee = bpy.data.meshes.new("Harmonic_Neck_and_Knee_Mesh")
bm.to_mesh(mesh_neck_knee)
bm.free()

mesh_neck_knee.update()
for f in mesh_neck_knee.polygons:
    f.use_smooth = True

obj_neck_knee = bpy.data.objects.new("Harp_Harmonic_Neck", mesh_neck_knee)
obj_neck_knee.data.materials.append(mat_maple)
link_obj(obj_neck_knee)

# ---------------------------------------------------------------------------
# 8 CAMAC LEVERS: REALISTIC DOWN (DISENGAGED) & UP (ENGAGED) POSITIONS
# ---------------------------------------------------------------------------
# In resting position: ALL LEVERS DOWN!
# Lever handle points DOWN (towards soundboard) and tilted away from string into inter-string space (35 deg).
# When flipped UP: rotates UP by 135 deg around axle.

t1, t8 = 0.15, 0.812
for idx in range(8):
    deg_num = idx + 1
    # Neck bridge pin position in treble valley & slope:
    # Use actual neck samples
    neck_idx = int(12 + idx * (56 - 12) / 7.0)
    neck_pt = n_pts[neck_idx]

    sb_pt = soundboard_center(t1 + idx * (t8 - t1) / 7.0) + front_norm * 0.0085
    b_pt  = Vector((0.028, neck_pt.y, neck_pt.z))

    str_vec = (b_pt - sb_pt).normalized()
    str_perp = Vector((1.0, 0.0, 0.0)).cross(str_vec).normalized()
    # Ensure str_perp points towards next string (+Y, -Z):
    if str_perp.y < 0:
        str_perp = -str_perp

    # Bridge Pin (silver)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=0.0040, depth=0.024,
        location=b_pt,
        rotation=(0, math.pi / 2.0, 0)
    )
    b_pin = bpy.context.active_object
    b_pin.name = f"BridgePin_{deg_num}"
    b_pin.data.materials.append(mat_chrome)
    link_obj(b_pin)

    # Tuning Pin (gunmetal)
    t_pt = b_pt + str_vec * 0.024 - str_perp * 0.004
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=0.0048, depth=0.080,
        location=Vector((0.0, t_pt.y, t_pt.z)),
        rotation=(0, math.pi / 2.0, 0)
    )
    t_pin = bpy.context.active_object
    t_pin.name = f"TuningPin_{deg_num}"
    t_pin.data.materials.append(mat_gunmetal)
    link_obj(t_pin)

    # Camac Lever Base (chrome)
    l_pt = b_pt - str_vec * 0.026 + str_perp * 0.002
    rot_mat = Matrix((
        Vector((1.0, 0.0, 0.0)),
        str_perp,
        str_vec
    )).transposed()

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0,0,0))
    l_base = bpy.context.active_object
    l_base.name = f"Lever_Base_{deg_num}"
    l_base.scale = (0.010, 0.013, 0.028)
    bpy.ops.object.transform_apply(scale=True)
    l_base.location = l_pt
    l_base.rotation_mode = 'QUATERNION'
    l_base.rotation_quaternion = rot_mat.to_quaternion()
    l_base.data.materials.append(mat_chrome)
    link_obj(l_base)

    # Camac Teardrop Handle:
    # DOWN RESTING POSITION:
    # In local coordinates: local Z is +str_vec (UP).
    # To point DOWN towards soundboard: handle points along -Z_local.
    # To angle 38 deg away from string into inter-string space: tilt towards +Y_local!
    h_tilt = math.radians(38)
    ch, sh = math.cos(h_tilt), math.sin(h_tilt)

    # If test: show first 4 levers DOWN, next 4 levers UP (alternated) to verify both states!
    is_up_test = (deg_num > 4)
    if is_up_test:
        # Flipped UP by 135 deg:
        up_angle = math.radians(135)
        # Handle points UP (+Z_local) and tilted towards +Y_local
        h_dir_local = Vector((0.0, math.sin(math.radians(28)), math.cos(math.radians(28))))
    else:
        # DOWN: points DOWN (-Z_local) and tilted towards +Y_local (38 deg)
        h_dir_local = Vector((0.0, math.sin(h_tilt), -math.cos(h_tilt)))

    pivot_loc = l_pt + rot_mat @ Vector((0.008, 0.0, 0.006))

    # Teardrop vertices along h_dir_local:
    h_raw = [
        Vector((-0.003, -0.003, 0.002)),
        Vector(( 0.003, -0.003, 0.002)),
        Vector(( 0.003,  0.003, 0.002)),
        Vector((-0.003,  0.003, 0.002)),
        Vector((-0.002, -0.003, -0.014)),
        Vector(( 0.004, -0.003, -0.014)),
        Vector(( 0.004,  0.003, -0.014)),
        Vector((-0.002,  0.003, -0.014)),
        Vector((-0.001, -0.005, -0.028)),
        Vector(( 0.006, -0.005, -0.028)),
        Vector(( 0.006,  0.005, -0.028)),
        Vector((-0.001,  0.005, -0.028)),
        Vector(( 0.000, -0.003, -0.034)),
        Vector(( 0.004, -0.003, -0.034)),
        Vector(( 0.004,  0.003, -0.034)),
        Vector(( 0.000,  0.003, -0.034)),
    ]

    # Rotate h_raw to align with h_dir_local
    # h_raw default points along -Z
    from_vec = Vector((0.0, 0.0, -1.0))
    to_vec = h_dir_local.normalized()
    h_rot_q = from_vec.rotation_difference(to_vec)

    h_verts_final = [pivot_loc + rot_mat @ (h_rot_q @ v) for v in h_raw]
    h_faces = []
    for ring in range(3):
        b = ring * 4
        n = (ring + 1) * 4
        for k in range(4):
            kn = (k + 1) % 4
            h_faces.append((b + k, b + kn, n + kn, n + k))
    h_faces.append((0, 3, 2, 1))
    h_faces.append((12, 13, 14, 15))

    tip_mat = mat_red if deg_num in (1, 8) else (mat_blue if deg_num == 4 else mat_chrome)
    h_obj = create_mesh_obj(f"Lever_Handle_{deg_num}", h_verts_final, h_faces, mat=tip_mat, smooth=True)
    sub = h_obj.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1

    # String (3D line)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12, radius=0.0016 if deg_num in (1, 2) else 0.0011,
        depth=(b_pt - sb_pt).length,
        location=(b_pt + sb_pt) * 0.5
    )
    s_obj = bpy.context.active_object
    s_obj.name = f"String_{deg_num}"
    s_dir = (b_pt - sb_pt).normalized()
    s_obj.rotation_mode = 'QUATERNION'
    s_obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(s_dir)
    s_obj.data.materials.append(tip_mat if deg_num in (1, 4, 8) else mat_chrome)
    link_obj(s_obj)

# ---------------------------------------------------------------------------
# LIGHTING & RENDERS
# ---------------------------------------------------------------------------
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs['Color'].default_value = (0.08, 0.10, 0.14, 1.0)

# Sun / Key Light
bpy.ops.object.light_add(type='SUN', location=(-2.0, 2.0, 3.0))
sun = bpy.context.active_object
sun.data.energy = 4.0
sun.rotation_euler = (math.radians(45), math.radians(25), math.radians(-35))

# Fill Light
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

# 1. Full Lever Side View showing strings, DOWN levers (1-4) and UP levers (5-8), and seamless knee
render_view("Cam_Full_Lever", (1.25, 0.35, 0.95), (0.0, 0.05, 0.85), "c:/public/models/luthier_full_lever_side.png")

# 2. Right Side View: Tuning Pins side showing flush 1-piece joint
render_view("Cam_Right_Flush", (-1.10, 0.32, 1.05), (0.0, 0.28, 1.05), "c:/public/models/luthier_right_flush.png")

# 3. Rear Staves & Dome View
render_view("Cam_Rear_Dome", (0.0, 1.30, 0.98), (0.0, 0.28, 1.02), "c:/public/models/luthier_rear_dome.png")

# 4. Levers Close-Up showing distinct UP vs DOWN angles
render_view("Cam_Levers_Closeup", (0.65, 0.15, 1.05), (0.02, 0.05, 1.08), "c:/public/models/luthier_levers_closeup.png")

print("Luthier test renders completed!")
