import math
from mathutils import Vector

def soundboard_center(t):
    return Vector((0.0, -0.14 + t * 0.45, 0.075 + t * 0.965))

def catmull_rom_spline(ctrl_pts, num_samples):
    n = len(ctrl_pts)
    pts = [ctrl_pts[0]] + list(ctrl_pts) + [ctrl_pts[-1]]
    out = []
    for i in range(num_samples):
        u_global = (i / (num_samples - 1)) * (n - 1)
        seg = min(n - 2, int(u_global))
        u = u_global - seg
        p0, p1, p2, p3 = pts[seg], pts[seg + 1], pts[seg + 2], pts[seg + 3]
        pt = 0.5 * (
            (2.0 * p1) +
            (-p0 + p2) * u +
            (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * (u ** 2) +
            (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * (u ** 3)
        )
        out.append(pt)
    return out

L_sb = (soundboard_center(1.0) - soundboard_center(0.0)).length

neck_ctrl = [
    Vector((0.0, -0.335, 1.328)),
    Vector((0.0, -0.245, 1.295)),
    Vector((0.0, -0.105, 1.200)),
    Vector((0.0,  0.025, 1.095)),
    Vector((0.0,  0.155, 1.035)),
    Vector((0.0,  0.250, 1.075)),
    Vector((0.0,  0.355, 1.120)),
]
neck_samples = catmull_rom_spline(neck_ctrl, 2000)

cum_len = [0.0]
for i in range(len(neck_samples) - 1):
    cum_len.append(cum_len[-1] + (neck_samples[i+1] - neck_samples[i]).length)

t8 = 0.825
d_margin = (1.0 - t8) * L_sb
t1 = d_margin / L_sb
span_sb = (t8 - t1) * L_sb
d_sb = span_sb / 7.0

print('Soundboard configuration:')
print(f't1 = {t1:.4f}, t8 = {t8:.4f}')
print(f'Margin from top = {d_margin*100:.2f} cm, Margin from bottom = {t1*L_sb*100:.2f} cm')
print(f'Total span on soundboard = {span_sb*100:.2f} cm')
print(f'Distance between each soundboard eyelet = {d_sb*100:.3f} cm ({d_sb*1000:.1f} mm)')

# We want d_top == d_sb!
idx8 = min(range(len(neck_samples)), key=lambda i: abs(i/1999.0 - 0.84))
arc8 = cum_len[idx8]
arc1 = arc8 - span_sb
idx1 = min(range(len(cum_len)), key=lambda i: abs(cum_len[i] - arc1))

top_pts = []
for k in range(8):
    target_arc = arc1 + k * d_sb
    best_i = min(range(len(cum_len)), key=lambda i: abs(cum_len[i] - target_arc))
    top_pts.append(neck_samples[best_i])

sb_pts = []
for k in range(8):
    t_k = t1 + k * (t8 - t1) / 7.0
    sb_pts.append(soundboard_center(t_k))

print('\nVerification of all 8 strings:')
header = '{:<4} | {:<18} | {:<18} | {:<8} | {:<6} | {:<10} | {:<10}'.format(
    'Str', 'P_top (y, z)', 'P_sb (y, z)', 'Len(cm)', 'Ang', 'd_top(cm)', 'd_sb(cm)'
)
print(header)
print('-' * 85)
for k in range(8):
    pt = top_pts[k]
    ps = sb_pts[k]
    vec = pt - ps
    slen = vec.length * 100
    ang = math.degrees(math.atan2(vec.y, vec.z))
    d_top_str = '{:.2f}'.format((top_pts[k] - top_pts[k-1]).length * 100) if k > 0 else '---'
    d_sb_str  = '{:.2f}'.format((sb_pts[k] - sb_pts[k-1]).length * 100) if k > 0 else '---'
    row = '{:<4} | ({:6.3f}, {:6.3f})   | ({:6.3f}, {:6.3f})   | {:<8.1f} | {:<6.1f} | {:<10} | {:<10}'.format(
        k + 1, pt.y, pt.z, ps.y, ps.z, slen, ang, d_top_str, d_sb_str
    )
    print(row)
