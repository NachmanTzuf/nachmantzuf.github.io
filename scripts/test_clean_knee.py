"""
TEST CLEAN DOME & SEAMLESS NECK
Monotonic spine with dome modeled as top-rear surface expansion of the rings.
Renders high-res verification images to confirm 100% smooth, crease-free geometry.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Quaternion

bpy.ops.wm.read_factory_settings(use_empty=True)

# ---------------------------------------------------------------------------
# MATERIALS
# ---------------------------------------------------------------------------
def make_pbr_mat(name, base_color, roughness=0.32, metallic=0.0):
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
# SOUNDBOX PARAMETRIC DEFINITION
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

# 8 Staves points at miter top
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
    u = i / (len(fore_samples) - 1)
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
# HARMONIC NECK & KNEE DOME
# ---------------------------------------------------------------------------
# Path of the spine:
# 0: p_fore_top (0.0, -0.355, 1.215)
# 1: Bass crown apex (0.0, -0.335, 1.328)
# 2: Neck slope (0.0, -0.245, 1.295)
# 3: Mid-upper slope (0.0, -0.105, 1.200)
# 4: Mid slope (0.0,  0.025, 1.095)
# 5: Treble gentle valley (0.0, 0.176, 1.036)
# 6: Smooth ascent into knee base at soundbox top (0.0, 0.260, 1.038)
# 7: Soundbox top miter center c_top (0.0, 0.310, 1.040)
#
# NOTICE: Y monotonically increases from -0.355 to +0.310!
# There is NO hairpin bend!
# The rings transition smoothly from forepillar joint ring, through the neck,
# and blend into the soundbox miter ring at the end!
# The knee dome is formed by the upper-rear expansion of the cross-section rings!

neck_ctrl = [
    p_fore_top,
    Vector((0.0, -0.335, 1.328)),
    Vector((0.0, -0.245, 1.295)),
    Vector((0.0, -0.105, 1.200)),
    Vector((0.0,  0.025, 1.095)),
    Vector((0.0,  0.176, 1.036)),
    Vector((0.0,  0.260, 1.038)),
    c_top,
]

num_neck_samples = 96
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

    # Smoothly transition ring normal to align with sb_dir at the miter cut
    if u > 0.70:
        k_norm = (u - 0.70) / 0.30
        smooth_kn = k_norm * k_norm * (3.0 - 2.0 * k_norm)
        # Standard neck normal
        std_norm = Vector((0.0, -tang.z, tang.y)).normalized()
        # At miter cut, normal is perpendicular to sb_dir: which is back_norm!
        out_norm = std_norm.lerp(back_norm, smooth_kn).normalized()
    else:
        out_norm = Vector((0.0, -tang.z, tang.y)).normalized()

    # Determine cross section profile at parameter u
    if u < 0.20:
        # Bass crown
        rx_l = rx_r = 0.024
        ry_t = ry_b = 0.038
        exp_x = 0.25
        exp_y = 0.78
        dome_lift = 0.0
    elif u < 0.65:
        # Mid-neck beam
        rx_l = rx_r = 0.024
        ry_t = ry_b = 0.040
        exp_x = 0.22
        exp_y = 0.78
        dome_lift = 0.0
    else:
        # Transition into knee dome and soundbox miter ring
        w = (u - 0.65) / 0.35
        smooth_w = w * w * (3.0 - 2.0 * w)

        # Width expands to match soundbox top width (hw_top = 0.0486)
        rx_r = 0.024 * (1.0 - smooth_w) + hw_top * smooth_w

        # Player's left side (+X): sculpted concave crescent cove for Camac lever clearance
        cove = math.sin(smooth_w * math.pi) * (hw_top * 0.36)
        rx_l = (0.024 * (1.0 - smooth_w) + hw_top * smooth_w) - cove

        # Height expands:
        # ry_b (lower / soundboard side) expands to meet front soundboard
        ry_b = 0.040 * (1.0 - smooth_w) + 0.008 * smooth_w
        # ry_t (upper / rear side) forms the rounded DOME rising up!
        # Dome apex rises smoothly up to +0.075 m above the spine!
        dome_shape = math.sin(w * math.pi * 0.85)
        ry_t = 0.040 * (1.0 - smooth_w) + (depth_top * 0.95) * smooth_w + 0.045 * dome_shape
        exp_x = 0.22 * (1.0 - smooth_w) + 0.35 * smooth_w
        exp_y = 0.78 * (1.0 - smooth_w) + 0.70 * smooth_w
        dome_lift = 0.045 * dome_shape

    ring = []
    for j in range(24):
        ang = 2.0 * math.pi * j / 24
        ca = math.cos(ang)
        sa = math.sin(ang)

        cur_rx = rx_l if ca >= 0 else rx_r
        cur_ry = ry_t if sa >= 0 else ry_b

        sx = math.copysign(abs(ca)**exp_x, ca) * cur_rx
        sy = math.copysign(abs(sa)**exp_y, sa) * cur_ry

        # Near end (u > 0.88), blend into the exact 24-gon of the soundbox top
        if u > 0.88:
            blend_miter = (u - 0.88) / 0.12
            smooth_bm = blend_miter * blend_miter
            p_target = miter_ring[j]
            p_ring = pt + side_x * sx + out_norm * sy + sb_dir * dome_lift
            p_final = p_ring.lerp(p_target, smooth_bm)
            ring.append(p_final)
        else:
            ring.append(pt + side_x * sx + out_norm * sy + sb_dir * dome_lift)

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
create_mesh_obj("Harmonic_Neck_and_Knee", neck_verts, neck_faces, mat=mat_maple, smooth=True)

# ---------------------------------------------------------------------------
# LIGHTING & CAMERAS FOR MULTI-ANGLE VERIFICATION
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

# 1. Right side view: Tuning Pins side (showing seamless one-piece joint)
render_view("Cam_Right", (0.85, 0.28, 1.06), (0.0, 0.28, 1.06), "public/models/test_knee_right_seamless.png")

# 2. Left side view: Lever side (showing cutout & treble valley)
render_view("Cam_Left", (-0.85, 0.28, 1.06), (0.0, 0.28, 1.06), "public/models/test_knee_left_cove.png")

# 3. Rear view: Staves continuing into dome
render_view("Cam_Rear", (0.0, 1.25, 1.00), (0.0, 0.28, 1.04), "public/models/test_knee_rear_dome.png")

# 4. Perspective 3/4 view
render_view("Cam_Psp", (-0.95, -0.65, 1.35), (0.0, 0.15, 0.90), "public/models/test_full_perspective.png")

print("Renders completed successfully!")
