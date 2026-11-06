"""การ์ตูน 3D ด้วย Blender (ฟรี, สร้างด้วยโค้ดทั้งหมด): คุณตาเดินในสวน
ใช้: python3 blender/grandpa3d.py out/3d [frames=72] [still_frame]
ต้องมี: pip install bpy (Blender as Python module)
"""
import math
import os
import sys

import bpy

out = sys.argv[1] if len(sys.argv) > 1 else "out/3d"
FRAMES = int(sys.argv[2]) if len(sys.argv) > 2 else 72
STILL = int(sys.argv[3]) if len(sys.argv) > 3 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


def mat(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    return m


def hexc(h):
    h = h.lstrip("#")
    return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))


M = {k: mat(k, hexc(v)) for k, v in dict(skin="#fde3cc", hair="#f4f4f4", shirt="#6fbf6a", pants="#8a5a2b", shoe="#222222",
                                         eye="#151515", glass="#202020", grass="#8fcf55", fence="#e0893f", trunk="#7a4a22",
                                         leaf="#4f9e3a", cheek="#f3a493").items()}


def obj(o, m, parent=None, smooth=True):
    o.data.materials.append(M[m])
    if smooth:
        bpy.ops.object.shade_smooth()
    if parent:
        o.parent = parent
    return o


def sphere(loc, r, m, parent=None, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object
    o.scale = scale
    return obj(o, m, parent)


def capsule(loc, r, h, m, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=32)
    o = obj(bpy.context.object, m, parent)
    sphere((0, 0, h / 2), r, m, o)
    sphere((0, 0, -h / 2), r, m, o)
    return o


def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    sc.collection.objects.link(e)
    e.location = loc
    e.parent = parent
    return e


# ---------- ตัวละคร (หัวโต ตัวเล็ก) ----------
root = empty("root", (0, 0, 0))
body = capsule((0, 0, 1.25), 0.32, 0.45, "shirt", root)
sphere((0, 0, 0.92), 0.33, "pants", root, (1, 0.9, 0.55))
head = empty("head", (0, 0, 2.05), root)
sphere((0, 0, 0), 0.62, "skin", head, (1, 0.95, 1))
for x in (-0.6, 0.6):
    sphere((x, 0.02, -0.02), 0.13, "skin", head, (0.6, 1, 1))
for x in (-0.18, 0.18):
    sphere((x, 0.57, 0.17), 0.075, "eye", head, (1, 0.5, 1.2))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.17, minor_radius=0.018, location=(x, 0.6, 0.15), rotation=(math.pi / 2, 0, 0))
    obj(bpy.context.object, "glass", head)
    sphere((x * 1.9, 0.5, -0.12), 0.08, "cheek", head, (1, 0.4, 0.6))
sphere((0, 0.62, 0.02), 0.07, "skin", head)
bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.018, location=(0, 0.57, -0.2), rotation=(math.pi / 2 - 0.2, 0, 0))
mouth = obj(bpy.context.object, "eye", head)
mouth.scale = (1, 0.4, 1)
# ผมขาวฟู: กลุ่มทรงกลม
import random  # noqa: E402
random.seed(4)
for i in range(26):
    a = random.uniform(0, 2 * math.pi)
    z = random.uniform(0.1, 0.55)
    rr = math.sqrt(max(0.01, 0.62 ** 2 - z ** 2)) * 0.95
    y = rr * math.sin(a)
    if y > 0.25 and z < 0.4:
        continue  # เว้นหน้า
    sphere((rr * math.cos(a), y - 0.05, z + 0.08), random.uniform(0.17, 0.26), "hair", head)


def limb(name, loc, r, l1, l2, m, end_m, end_r, parent):
    j1 = empty(name + "1", loc, parent)
    capsule((0, 0, -l1 / 2), r, l1, m, j1)
    j2 = empty(name + "2", (0, 0, -l1), j1)
    capsule((0, 0, -l2 / 2), r * 0.92, l2, m, j2)
    e = sphere((0, 0.06 if end_m == "shoe" else 0, -l2 - end_r * 0.4), end_r, end_m, j2, (1, 1.6, 0.7) if end_m == "shoe" else (1, 1, 1))
    return j1, j2


legL = limb("legL", (-0.15, 0, 0.92), 0.09, 0.42, 0.42, "pants", "shoe", 0.13, root)
legR = limb("legR", (0.15, 0, 0.92), 0.09, 0.42, 0.42, "pants", "shoe", 0.13, root)
armL = limb("armL", (-0.38, 0, 1.55), 0.065, 0.32, 0.3, "skin", "skin", 0.09, root)
armR = limb("armR", (0.38, 0, 1.55), 0.065, 0.32, 0.3, "skin", "skin", 0.09, root)
for x in (-0.38, 0.38):
    sphere((x, 0, 1.52), 0.13, "shirt", root)

# ---------- ฉาก ----------
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
ground = obj(bpy.context.object, "grass", smooth=False)
ground.visible_diffuse = False  # ไม่ให้หญ้าสะท้อนสีเขียวใส่ตัวละคร
for i in range(-14, 15):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(i * 0.55, -4, 0.75))
    p = bpy.context.object
    p.scale = (0.46, 0.08, 1.5)
    obj(p, "fence", smooth=False)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.33, depth=0.3, location=(i * 0.55, -4, 1.65), rotation=(0, 0, math.pi / 4))
    c = bpy.context.object
    c.scale = (1, 0.15, 1)
    obj(c, "fence", smooth=False)
for (x, y) in ((-4.5, -2.5), (5, -3)):
    capsule((x, y, 1.2), 0.25, 2.2, "trunk")
    for k in range(5):
        sphere((x + random.uniform(-0.9, 0.9), y + random.uniform(-0.6, 0.6), 3.0 + random.uniform(-0.3, 0.8)), random.uniform(0.9, 1.3), "leaf")

# ---------- แสง กล้อง ----------
sc.world = bpy.data.worlds.new("w")
sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (*hexc("#8fd3f7"), 1)
sc.world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), math.radians(10), math.radians(-30)))
bpy.context.object.data.energy = 4.5
bpy.context.object.data.angle = math.radians(8)
bpy.ops.object.camera_add(location=(0, 9.5, 1.9), rotation=(math.radians(88), 0, math.radians(180)))
cam = bpy.context.object
cam.data.lens = 40
sc.camera = cam

# ---------- อนิเมชันเดิน ----------
sc.frame_start, sc.frame_end = 1, FRAMES
sc.render.fps = 24
for f in range(1, FRAMES + 1):
    t = f / 24
    ph = t * 2 * math.pi * 1.4
    s = math.sin(ph)
    root.location = (-2.6 + 5.2 * (f - 1) / (FRAMES - 1), 0.6, abs(math.cos(ph)) * 0.06)
    root.rotation_euler = (0, 0, math.radians(90))  # หันไปทางขวา (ด้านข้างกล้อง)
    root.rotation_euler[2] = math.radians(90 - 35)  # เอียงเข้ากล้องให้เห็นหน้า
    legL[0].rotation_euler = (s * 0.55, 0, 0)
    legL[1].rotation_euler = (-max(0, -s) * 0.8, 0, 0)
    legR[0].rotation_euler = (-s * 0.55, 0, 0)
    legR[1].rotation_euler = (-max(0, s) * 0.8, 0, 0)
    armL[0].rotation_euler = (-s * 0.5, 0, -0.15)
    armL[1].rotation_euler = (0.3, 0, 0)
    armR[0].rotation_euler = (s * 0.5, 0, 0.15)
    armR[1].rotation_euler = (0.3, 0, 0)
    head.rotation_euler = (0, math.sin(ph * 2) * 0.03, -0.2)
    for o in (root, legL[0], legL[1], legR[0], legR[1], armL[0], armL[1], armR[0], armR[1], head):
        o.keyframe_insert("location" if o is root else "rotation_euler", frame=f)
        if o is root:
            o.keyframe_insert("rotation_euler", frame=f)
    cam.location = (root.location[0] * 0.6, 9.5, 1.9)
    cam.keyframe_insert("location", frame=f)

# ---------- เรนเดอร์ (CPU, Cycles) ----------
r = sc.render
r.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = 24
sc.cycles.use_denoising = True
r.resolution_x, r.resolution_y = 1080, 1920
r.resolution_percentage = 50
r.film_transparent = False
sc.view_settings.view_transform = "Standard"
# เส้นขอบการ์ตูน (Freestyle)
r.use_freestyle = False
r.line_thickness_mode = "ABSOLUTE"
r.line_thickness = 2.2
os.makedirs(out, exist_ok=True)
if STILL:
    sc.frame_set(STILL)
    r.filepath = os.path.join(out, f"still_{STILL}.png")
    bpy.ops.render.render(write_still=True)
else:
    r.image_settings.file_format = "PNG"
    r.filepath = os.path.join(out, "f_")
    bpy.ops.render.render(animation=True)
print("done", out)
