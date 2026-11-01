"""Klip 1: Harput çevresinde yarım tur (temsilî, kodla modellenmiş).
Çalıştır: blender -b --python blender/harput_tur.py -- <kare_sayısı> <genişlik> <çıktı_klasörü> [tek_kare_no]
Referans fotoğraflar yalnızca biçim rehberi olarak kullanıldı; doku/görsel olarak alınmadı.
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, noise

argv = sys.argv[sys.argv.index("--") + 1:]
FRAMES = int(argv[0]); WIDTH = int(argv[1]); OUT = argv[2]
ONLY = int(argv[3]) if len(argv) > 3 else None
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")

def texmat(folder, scale, bump=1.0, tint=(1, 1, 1)):
    """Poly Haven CC0 dokusu, nesne koordinatlı kutu izdüşümü (UV gerekmez)."""
    m = bpy.data.materials.new(folder); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale); nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    def img(name, cs):
        n = nt.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(os.path.join(ASSETS, folder, name))
        n.image.colorspace_settings.name = cs; n.projection = "BOX"; n.projection_blend = 0.25
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"]); return n
    d = img("diff.jpg", "sRGB"); r = img("rough.jpg", "Non-Color"); nr = img("nor.jpg", "Non-Color")
    hs = nt.nodes.new("ShaderNodeHueSaturation"); hs.inputs["Saturation"].default_value = tint[0]; hs.inputs["Value"].default_value = tint[1]
    hs.inputs["Hue"].default_value = tint[2]; nt.links.new(d.outputs["Color"], hs.inputs["Color"])
    nt.links.new(hs.outputs["Color"], b.inputs["Base Color"]); nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = bump
    nt.links.new(nr.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m

def mat(name, color, rough=0.9):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    return m

def pbr(name, base_a, base_b, scale, bump, rough=0.9, brick=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = scale; nz.inputs["Detail"].default_value = 12; nz.inputs["Roughness"].default_value = 0.65
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*base_a, 1); ramp.color_ramp.elements[1].color = (*base_b, 1)
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    col = ramp.outputs["Color"]
    height_out = nz.outputs["Fac"]
    if brick:
        br = nt.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = 1.6; br.inputs["Mortar Size"].default_value = 0.03
        br.inputs["Brick Width"].default_value = 0.9; br.inputs["Row Height"].default_value = 0.4
        br.inputs["Color1"].default_value = (*base_a, 1); br.inputs["Color2"].default_value = (*base_b, 1); br.inputs["Mortar"].default_value = (0.3, 0.27, 0.22, 1)
        nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs[0].default_value = 0.45
        nt.links.new(br.outputs["Color"], mix.inputs[6]); nt.links.new(ramp.outputs["Color"], mix.inputs[7])
        col = mix.outputs[2]
        hm = nt.nodes.new("ShaderNodeMath"); hm.operation = "ADD"
        nt.links.new(br.outputs["Fac"], hm.inputs[0]); nt.links.new(nz.outputs["Fac"], hm.inputs[1])
        height_out = hm.outputs[0]
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump
    nt.links.new(height_out, bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], bsdf.inputs["Normal"])
    nt.links.new(col, bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = rough
    return m

def mat(name, color, rough=0.9):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    return m

STONE = texmat("castle_wall_slates", 0.35, 1.0, (0.8, 1.0, 0.5))
ROCK = texmat("cliff_side", 0.18, 1.2, (0.25, 0.85, 0.5))
GRASS = texmat("dry_ground_rocks", 0.25, 0.8, (0.7, 0.8, 0.54))
PINE = pbr("cam", (0.012, 0.045, 0.02), (0.04, 0.1, 0.04), 30, 1.2, 0.95); BARK = mat("govde", (0.14, 0.09, 0.06))
RED = mat("bayrak", (0.7, 0.04, 0.06), 0.6); STICK = mat("direk", (0.7, 0.7, 0.7), 0.4)

def height(x, y):
    r = math.hypot(x, y)
    hill = 9.0 * math.exp(-(r / 13.0) ** 2)
    n = noise.fractal(Vector((x * 0.07, y * 0.07, 1.3)), 0.5, 2.0, 5) * 1.7
    base = n * (0.35 + min(1.0, r / 25)) + hill
    plateau = 8.2
    if r < 8: base = base * (r / 8) ** 2 + plateau * (1 - (r / 8) ** 2) if base < plateau else base
    return base - 2.0

# arazi
bm = bmesh.new(); N = 240; S = 110.0
for i in range(N + 1):
    for j in range(N + 1):
        x = (i / N - 0.5) * S; y = (j / N - 0.5) * S
        bm.verts.new((x, y, height(x, y)))
bm.verts.ensure_lookup_table()
for i in range(N):
    for j in range(N):
        a = i * (N + 1) + j
        bm.faces.new((bm.verts[a], bm.verts[a + N + 1], bm.verts[a + N + 2], bm.verts[a + 1]))
me = bpy.data.meshes.new("arazi"); bm.to_mesh(me); bm.free()
ter = bpy.data.objects.new("arazi", me); sc.collection.objects.link(ter)
for p in me.polygons: p.use_smooth = True
ter.data.materials.append(GRASS)

# yan yüzdeki kaya kütlesi (kaleyi taşıyan sarp kısım)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6, radius=6.5, location=(2.5, -1.5, 5.0))
rock = bpy.context.object; rock.scale = (1.3, 1.0, 0.9)
for v in rock.data.vertices:
    v.co += v.normal * (noise.fractal(v.co * 0.5, 0.6, 2.0, 6) * 2.0 + abs(noise.noise(v.co * 1.7)) * 0.6)
rock.data.materials.append(ROCK)
for p in rock.data.polygons: p.use_smooth = True

def box(loc, size, m=STONE, name="b"):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2); o.data.materials.append(m); o.name = name
    return o

Z = 8.2
# surlar: dikdörtgen çevre, kuleler, mazgallar
W, D, H, T = 9.0, 4.5, 3.4, 0.9
for sx, sy, lx, ly in [(0, D, W * 2, T), (0, -D, W * 2, T), (W, 0, T, D * 2), (-W, 0, T, D * 2)]:
    box((sx, sy, Z + H / 2), (lx, ly, H))
    n = int((lx if lx > ly else ly) / 1.1)
    for k in range(n):
        off = (k - (n - 1) / 2) * 1.1
        pos = (sx + (off if lx > ly else 0), sy + (off if ly >= lx else 0), Z + H + 0.3)
        box(pos, (0.6, 0.6, 0.6), name="mazgal")
for cx, cy in [(W, D), (-W, D), (W, -D), (-W, -D), (0, D), (0, -D)]:
    box((cx, cy, Z + H / 2 + 0.7), (1.8, 1.8, H + 1.4), name="kule")
    box((cx, cy, Z + H + 1.5), (2.1, 2.1, 0.4), name="kule_ust")
# yüksek ana blok + kaya tepe
box((-3.5, 0.5, Z + 3.5), (7.0, 6.0, 7.0), name="ana_blok")
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=2.6, location=(-3.5, 0.5, Z + 7.8))
top = bpy.context.object; top.scale = (1.5, 1.2, 0.7); top.data.materials.append(ROCK)
for v in top.data.vertices: v.co += v.normal * noise.fractal(v.co * 0.8, 0.5, 2.0, 3) * 0.5
# bayrak
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=4.5, location=(-3.5, 0.5, Z + 10.4)); bpy.context.object.data.materials.append(STICK)
box((-3.5, 1.15, Z + 11.6), (0.05, 1.3, 0.85), RED, "bayrak")

# çamlar: üç katlı, düzensiz
for k in range(260):
    ang = random.uniform(0, math.tau); r = random.uniform(11, 42)
    x, y = math.cos(ang) * r, math.sin(ang) * r; z = height(x, y)
    s_ = random.uniform(0.8, 1.8)
    for t in range(3):
        bpy.ops.mesh.primitive_cone_add(vertices=9, radius1=(1.25 - t * 0.28) * s_, depth=2.2 * s_, location=(x, y, z + (1.4 + t * 1.2) * s_))
        c = bpy.context.object; c.data.materials.append(PINE); c.rotation_euler.z = random.uniform(0, 3)
        for v in c.data.vertices: v.co += Vector((random.uniform(-.06, .06), random.uniform(-.06, .06), random.uniform(-.05, .05)))
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.16 * s_, depth=1.4 * s_, location=(x, y, z + 0.5 * s_)); bpy.context.object.data.materials.append(BARK)

# gökyüzü
w = bpy.data.worlds.new("w"); w.use_nodes = True; sc.world = w
nt = w.node_tree; nt.nodes.clear()
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(os.path.join(ASSETS, "sky", "bloem_hill_01_1k.hdr"))
mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, math.radians(120)); tcw = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(tcw.outputs["Generated"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
bg = nt.nodes.new("ShaderNodeBackground"); out = nt.nodes.new("ShaderNodeOutputWorld"); bg.inputs[1].default_value = 1.0
nt.links.new(env.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])
sun = bpy.data.lights.new("gunes", "SUN"); sun.energy = 2.0; sun.angle = math.radians(2)
so = bpy.data.objects.new("gunes", sun); so.rotation_euler = (math.radians(52), 0, math.radians(30)); sc.collection.objects.link(so)

# kamera: merkezde boş nesne yarım tur döner
pivot = bpy.data.objects.new("pivot", None); pivot.location = (0, 0, Z + 3); sc.collection.objects.link(pivot)
cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam)
cam.parent = pivot; cam.location = (0, -42, 17); cam.data.lens = 35
tr = cam.constraints.new("TRACK_TO"); tr.target = pivot; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
sc.frame_start, sc.frame_end = 1, FRAMES
pivot.rotation_euler = (0, 0, math.radians(-40)); pivot.keyframe_insert("rotation_euler", frame=1)
pivot.rotation_euler = (0, 0, math.radians(140)); pivot.keyframe_insert("rotation_euler", frame=FRAMES)
for fc in pivot.animation_data.action.fcurves if hasattr(pivot.animation_data.action, "fcurves") else []:
    for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
sc.camera = cam

sc.render.engine = "BLENDER_EEVEE"; sc.eevee.use_raytracing = True
sc.render.resolution_x = WIDTH; sc.render.resolution_y = WIDTH * 9 // 16; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = "AgX"; sc.view_settings.exposure = -0.3
r = sc.render.image_settings; r.media_type = "IMAGE"; r.file_format = "WEBP"; r.quality = 80
sc.render.filepath = OUT + "/frame_"
if ONLY:
    sc.frame_set(ONLY); sc.render.filepath = OUT + "/test.webp"; bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
