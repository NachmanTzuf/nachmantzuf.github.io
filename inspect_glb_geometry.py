import json
import struct
import numpy as np

def inspect_glb(glb_path):
    with open(glb_path, 'rb') as f:
        data = f.read()

    # GLB Header: 12 bytes
    magic, version, length = struct.unpack('<4sII', data[:12])
    assert magic == b'glTF', "Not a valid GLB file"

    # Chunk 0: JSON
    c0_len, c0_type = struct.unpack('<II', data[12:20])
    c0_data = data[20:20 + c0_len]
    gltf = json.loads(c0_data.decode('utf-8'))

    # Chunk 1: BIN
    offset = 20 + c0_len
    c1_len, c1_type = struct.unpack('<II', data[offset:offset + 8])
    bin_data = data[offset + 8:offset + 8 + c1_len]

    print(f"=== GLB Inspection: {glb_path} ===")
    print(f"File size: {len(data)} bytes, version: {version}")

    buffer_views = gltf.get('bufferViews', [])
    accessors = gltf.get('accessors', [])
    meshes = gltf.get('meshes', [])
    nodes = gltf.get('nodes', [])

    all_positions = []
    mesh_vertex_data = {}

    for node_idx, node in enumerate(nodes):
        node_name = node.get('name', f'node_{node_idx}')
        mesh_idx = node.get('mesh')
        if mesh_idx is None:
            continue
        mesh = meshes[mesh_idx]
        mesh_name = mesh.get('name', node_name)

        # Get node transform if any
        translation = node.get('translation', [0, 0, 0])
        rotation = node.get('rotation', [0, 0, 0, 1]) # quaternion x, y, z, w
        scale = node.get('scale', [1, 1, 1])

        for prim in mesh.get('primitives', []):
            pos_acc_idx = prim.get('attributes', {}).get('POSITION')
            if pos_acc_idx is None:
                continue
            acc = accessors[pos_acc_idx]
            bv = buffer_views[acc['bufferView']]
            bv_offset = bv.get('byteOffset', 0)
            acc_offset = acc.get('byteOffset', 0)
            count = acc['count']
            start = bv_offset + acc_offset

            # POSITION is VEC3 of FLOAT (5126 = 4 bytes float)
            floats = np.frombuffer(bin_data[start:start + count * 12], dtype=np.float32).reshape(-1, 3)

            # Apply node translation/scale if simple
            transformed_floats = floats * np.array(scale, dtype=np.float32) + np.array(translation, dtype=np.float32)

            all_positions.append(transformed_floats)
            if mesh_name not in mesh_vertex_data:
                mesh_vertex_data[mesh_name] = []
            mesh_vertex_data[mesh_name].append(transformed_floats)

    total_vertices = np.vstack(all_positions)
    print(f"\nTotal vertices across all meshes: {len(total_vertices)}")

    # 1. Overall Bounding Box
    min_pt = total_vertices.min(axis=0)
    max_pt = total_vertices.max(axis=0)
    bbox_center = (min_pt + max_pt) / 2.0
    centroid = total_vertices.mean(axis=0)

    print("\n--- 1. OVERALL BOUNDING BOX (METERS) ---")
    print(f"X range: [{min_pt[0]:.6f}, {max_pt[0]:.6f}] -> width  = {max_pt[0] - min_pt[0]:.6f} m, center X = {bbox_center[0]:.6f} m")
    print(f"Y range: [{min_pt[1]:.6f}, {max_pt[1]:.6f}] -> height = {max_pt[1] - min_pt[1]:.6f} m, center Y = {bbox_center[1]:.6f} m")
    print(f"Z range: [{min_pt[2]:.6f}, {max_pt[2]:.6f}] -> depth  = {max_pt[2] - min_pt[2]:.6f} m, center Z = {bbox_center[2]:.6f} m")
    print(f"Bounding Box Center: X={bbox_center[0]:.6f}, Y={bbox_center[1]:.6f}, Z={bbox_center[2]:.6f}")
    print(f"Vertex Cloud Centroid (Center of Mass): X={centroid[0]:.6f}, Y={centroid[1]:.6f}, Z={centroid[2]:.6f}")

    # 2. Per Component Analysis
    print("\n--- 2. PER-COMPONENT BOUNDING BOXES & CENTROIDS ---")
    for name, v_list in sorted(mesh_vertex_data.items()):
        verts = np.vstack(v_list)
        v_min = verts.min(axis=0)
        v_max = verts.max(axis=0)
        v_center = (v_min + v_max) / 2.0
        print(f"Mesh: {name:30s} (N={len(verts):5d}) | X: [{v_min[0]:.3f}, {v_max[0]:.3f}] | Y: [{v_min[1]:.3f}, {v_max[1]:.3f}] | Z: [{v_min[2]:.3f}, {v_max[2]:.3f}] | Center: ({v_center[0]:.3f}, {v_center[1]:.3f}, {v_center[2]:.3f})")

    # 3. Floor Contact Analysis (The Feet / Legs)
    print("\n--- 3. FLOOR CONTACT POINTS (THE FEET) ---")
    min_y = min_pt[1]
    # Vertices within 3mm of lowest point
    floor_verts = total_vertices[total_vertices[:, 1] <= min_y + 0.003]
    print(f"Lowest Y vertex: {min_y:.6f} m")
    print(f"Number of floor contact vertices (within 3mm of min Y): {len(floor_verts)}")
    f_min = floor_verts.min(axis=0)
    f_max = floor_verts.max(axis=0)
    f_center = (f_min + f_max) / 2.0
    f_mean = floor_verts.mean(axis=0)

    print(f"Floor contact X range: [{f_min[0]:.6f}, {f_max[0]:.6f}], width  = {f_max[0] - f_min[0]:.6f} m")
    print(f"Floor contact Y range: [{f_min[1]:.6f}, {f_max[1]:.6f}], delta Y = {f_max[1] - f_min[1]:.6f} m")
    print(f"Floor contact Z range: [{f_min[2]:.6f}, {f_max[2]:.6f}], depth  = {f_max[2] - f_min[2]:.6f} m")
    print(f"Feet Stance Bounding Center: X={f_center[0]:.6f}, Y={f_center[1]:.6f}, Z={f_center[2]:.6f}")
    print(f"Feet Stance Mean Position:   X={f_mean[0]:.6f}, Y={f_mean[1]:.6f}, Z={f_mean[2]:.6f}")

    # Check flatness: fit plane z = a*x + b*y + d or y = a*x + b*z + d
    A = np.c_[floor_verts[:, 0], floor_verts[:, 2], np.ones(len(floor_verts))]
    C, _, _, _ = np.linalg.lstsq(A, floor_verts[:, 1], rcond=None)
    print(f"Floor plane fit: Y = ({C[0]:.6f})*X + ({C[1]:.6f})*Z + ({C[2]:.6f})")
    print(f"Floor plane slope X: {np.degrees(np.arctan(C[0])):.4f} degrees, slope Z: {np.degrees(np.arctan(C[1])):.4f} degrees")

    # 4. Forepillar and Crown Alignment
    print("\n--- 4. VERTICAL CENTERLINE CANDIDATES ---")
    crown_verts = total_vertices[total_vertices[:, 1] >= max_pt[1] - 0.015]
    c_center = (crown_verts.min(axis=0) + crown_verts.max(axis=0)) / 2.0
    print(f"Highest point (Crown peak): Y = {max_pt[1]:.6f} m")
    print(f"Crown peak center: X = {c_center[0]:.6f}, Z = {c_center[2]:.6f}")

    # Mid-height cross section (Y between 0.50 and 0.70)
    mid_verts = total_vertices[(total_vertices[:, 1] >= 0.50) & (total_vertices[:, 1] <= 0.70)]
    m_min = mid_verts.min(axis=0)
    m_max = mid_verts.max(axis=0)
    m_center = (m_min + m_max) / 2.0
    print(f"Mid-height (Y=0.50..0.70) bounding center: X = {m_center[0]:.6f}, Z = {m_center[2]:.6f}")
    print(f"Mid-height centroid: X = {mid_verts[:, 0].mean():.6f}, Z = {mid_verts[:, 2].mean():.6f}")

    # Legs analysis specifically
    for name, v_list in mesh_vertex_data.items():
        if 'Leg' in name:
            l_verts = np.vstack(v_list)
            l_min = l_verts.min(axis=0)
            l_max = l_verts.max(axis=0)
            print(f"\nSpecific Leg mesh '{name}':")
            print(f"  X: [{l_min[0]:.6f}, {l_max[0]:.6f}], center X = {(l_min[0]+l_max[0])/2:.6f}")
            print(f"  Y: [{l_min[1]:.6f}, {l_max[1]:.6f}], center Y = {(l_min[1]+l_max[1])/2:.6f}")
            print(f"  Z: [{l_min[2]:.6f}, {l_max[2]:.6f}], center Z = {(l_min[2]+l_max[2])/2:.6f}")

if __name__ == '__main__':
    inspect_glb('public/models/celtic_harp_8string.glb')
