import bpy
import math

# Clear all existing objects in Blender scene
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1080
scene.render.film_transparent = True

# Create Celtic stone altar geometry
# Radius 1.6m, height 1.1m, beveled top
bpy.ops.mesh.primitive_cylinder_add(
    radius=1.6,
    depth=1.1,
    vertices=64,
    location=(0, 0, -0.55)
)
pedestal = bpy.context.active_object
pedestal.name = 'Celtic_Altar'

# Add bevel modifier for soft, ancient weathered stone rim
bevel = pedestal.modifiers.new(name='Stone_Bevel', type='BEVEL')
bevel.width = 0.08
bevel.segments = 4

# Add subdivision surface for organic smoothness
subsurf = pedestal.modifiers.new(name='Subsurf', type='SUBSURF')
subsurf.levels = 2
subsurf.render_levels = 2

# Create Photorealistic Weathered Celtic Stone Shader
mat = bpy.data.materials.new(name='Irish_Celtic_Stone')
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.clear()

# Node setup:
# Texture Coordinate -> Mapping -> Noise / Voronoi -> ColorRamp -> Principled BSDF -> Material Output
output_node = nodes.new('ShaderNodeOutputMaterial')
principled = nodes.new('ShaderNodeBsdfPrincipled')
tex_coord = nodes.new('ShaderNodeTexCoord')
mapping = nodes.new('ShaderNodeMapping')

# Stone base noise
noise1 = nodes.new('ShaderNodeTexNoise')
noise1.inputs['Scale'].default_value = 14.0
noise1.inputs['Detail'].default_value = 12.0
noise1.inputs['Roughness'].default_value = 0.72

# Stone large color variation
noise2 = nodes.new('ShaderNodeTexNoise')
noise2.inputs['Scale'].default_value = 2.5
noise2.inputs['Detail'].default_value = 6.0

# Voronoi for stone block fractures / cracks
voronoi = nodes.new('ShaderNodeTexVoronoi')
voronoi.feature = 'F1'
voronoi.distance = 'EUCLIDEAN'
voronoi.inputs['Scale'].default_value = 4.2

# Color Ramps
# 1. Base stone color (Atlantic Irish granite / weathered limestone)
ramp_color = nodes.new('ShaderNodeValToRGB')
ramp_color.color_ramp.elements[0].position = 0.15
ramp_color.color_ramp.elements[0].color = (0.28, 0.33, 0.30, 1.0) # Dark damp cleft
ramp_color.color_ramp.elements[1].position = 0.85
ramp_color.color_ramp.elements[1].color = (0.55, 0.60, 0.56, 1.0) # Light grey granite facet

# 2. Emerald moss color overlay
ramp_moss = nodes.new('ShaderNodeValToRGB')
ramp_moss.color_ramp.elements[0].position = 0.45
ramp_moss.color_ramp.elements[0].color = (0.55, 0.60, 0.56, 1.0) # stone
ramp_moss.color_ramp.elements[1].position = 0.68
ramp_moss.color_ramp.elements[1].color = (0.18, 0.32, 0.12, 1.0) # Irish velvet moss green

# Bump / Normal
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = 0.45
bump.inputs['Distance'].default_value = 0.05

# Connect nodes
links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
links.new(mapping.outputs['Vector'], noise1.inputs['Vector'])
links.new(mapping.outputs['Vector'], noise2.inputs['Vector'])
links.new(mapping.outputs['Vector'], voronoi.inputs['Vector'])

links.new(noise1.outputs['Fac'], ramp_color.inputs['Fac'])
links.new(noise2.outputs['Fac'], ramp_moss.inputs['Fac'])

links.new(ramp_color.outputs['Color'], principled.inputs['Base Color'])
principled.inputs['Roughness'].default_value = 0.88

links.new(noise1.outputs['Fac'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], principled.inputs['Normal'])

links.new(principled.outputs['BSDF'], output_node.inputs['Surface'])

pedestal.data.materials.append(mat)
bpy.ops.object.shade_smooth()

# Create Carved Concentric Rings on Top Face
# Add a shallow cylinder decal on the top face
bpy.ops.mesh.primitive_cylinder_add(
    radius=1.45,
    depth=0.01,
    vertices=64,
    location=(0, 0, 0.005)
)
rings_disc = bpy.context.active_object
rings_disc.name = 'Carved_Rings_Disc'

mat_rings = bpy.data.materials.new(name='Carved_Rings_Mat')
mat_rings.use_nodes = True
r_nodes = mat_rings.node_tree.nodes
r_links = mat_rings.node_tree.links
r_nodes.clear()

r_output = r_nodes.new('ShaderNodeOutputMaterial')
r_principled = r_nodes.new('ShaderNodeBsdfPrincipled')
r_coord = r_nodes.new('ShaderNodeTexCoord')
r_grad = r_nodes.new('ShaderNodeTexGradient')
r_grad.gradient_type = 'SPHERICAL'
r_ramp = r_nodes.new('ShaderNodeValToRGB')

# Setup concentric ring bands in color ramp
r_ramp.color_ramp.interpolation = 'CONSTANT'
r_ramp.color_ramp.elements[0].position = 0.0
r_ramp.color_ramp.elements[0].color = (0.22, 0.26, 0.23, 1.0) # center dot
r_ramp.color_ramp.elements.new(0.08)
r_ramp.color_ramp.elements[1].color = (0.48, 0.54, 0.49, 1.0) # inner stone ring
r_ramp.color_ramp.elements.new(0.24)
r_ramp.color_ramp.elements[2].color = (0.24, 0.28, 0.24, 1.0) # carved dark groove
r_ramp.color_ramp.elements.new(0.28)
r_ramp.color_ramp.elements[3].color = (0.50, 0.56, 0.51, 1.0) # middle stone ring
r_ramp.color_ramp.elements.new(0.55)
r_ramp.color_ramp.elements[4].color = (0.22, 0.26, 0.23, 1.0) # second carved groove
r_ramp.color_ramp.elements.new(0.59)
r_ramp.color_ramp.elements[5].color = (0.45, 0.52, 0.46, 1.0) # outer rim

r_links.new(r_coord.outputs['Object'], r_grad.inputs['Vector'])
r_links.new(r_grad.outputs['Fac'], r_ramp.inputs['Fac'])
r_links.new(r_ramp.outputs['Color'], r_principled.inputs['Base Color'])
r_principled.inputs['Roughness'].default_value = 0.92
r_links.new(r_principled.outputs['BSDF'], r_output.inputs['Surface'])

rings_disc.data.materials.append(mat_rings)

# Lighting setup
# Key Sun: Warm golden sunlight streaming from upper right matching the arch
sun = bpy.data.lights.new(name='Sun_Key', type='SUN')
sun.energy = 3.5
sun.color = (1.0, 0.96, 0.90)
sun_obj = bpy.data.objects.new(name='Sun_Key', object_data=sun)
sun_obj.rotation_euler = (math.radians(52), math.radians(18), math.radians(-42))
scene.collection.objects.link(sun_obj)

# Sky Fill: Cool Irish Atlantic mist ambient
sky = bpy.data.lights.new(name='Sky_Fill', type='SUN')
sky.energy = 1.2
sky.color = (0.65, 0.74, 0.82)
sky_obj = bpy.data.objects.new(name='Sky_Fill', object_data=sky)
sky_obj.rotation_euler = (math.radians(-60), 0, math.radians(120))
scene.collection.objects.link(sky_obj)

# Camera setup:
# Looking down at ~32 degrees inclination onto the altar so entire top circle is clearly visible!
cam_data = bpy.data.cameras.new(name='Camera')
cam_data.lens = 55
cam_obj = bpy.data.objects.new(name='Camera', object_data=cam_data)
# Position camera in front, elevated
cam_obj.location = (0, -4.8, 2.7)
cam_obj.rotation_euler = (math.radians(62), 0, 0)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Output render
out_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/blender_celtic_pedestal.png'
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)
print('Blender render complete:', out_path)
