"""Rebuild the Encycle Bank concept film in Blender. See Encycle-Bank-Animation.md."""
import bpy, math, os, sys
from mathutils import Vector

ROOT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280; scene.render.resolution_y=720; scene.render.resolution_percentage=100
scene.render.fps=24; scene.frame_start=1; scene.frame_end=672
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGB'
scene.render.filepath='/tmp/encycle-render/frame_'
scene.world.color=(.12,.12,.12)
scene.view_settings.view_transform='AgX'
scene.render.film_transparent=False
scene.render.image_settings.compression=20
if hasattr(scene,'eevee'): scene.eevee.taa_render_samples=8

def material(name,color,metal=0,rough=.5,glow=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
 p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
 if glow: p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=glow
 return m
pla=material('BLACK PLA | fine horizontal print layers',(.025,.031,.034),0,.6)
n=pla.node_tree.nodes;l=pla.node_tree.links
tex=n.new('ShaderNodeTexCoord');wave=n.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction='Z';wave.inputs['Scale'].default_value=145
l.new(tex.outputs['Generated'],wave.inputs['Vector']);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.21;bump.inputs['Distance'].default_value=.008
l.new(wave.outputs['Color'],bump.inputs['Height']);l.new(bump.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])
green=material('PCB solder mask',(.018,.22,.105),.15,.38)
blue=material('Sensor PCB',(.015,.10,.23),.15,.4)
metal=material('Brushed aluminium',(.5,.57,.59),.8,.3)
gold=material('Connector pins',(.7,.43,.10),.75,.3)
black=material('Chips and lens housing',(.008,.012,.014),.2,.32)
glass=material('Optical glass',(.015,.06,.07),.75,.15)
teal=material('Interface jade',(.12,.68,.45),.15,.35,1)
white=material('Warm white graphics',(.84,.91,.85),0,.4,1)
muted=material('Secondary typography',(.35,.52,.45),0,.4,1)
screenmat=material('OLED black',(.004,.03,.025),.05,.28,.3)
floor=material('Forest studio floor',(.012,.025,.022),.1,.5)
font=bpy.data.fonts.load('/usr/share/fonts/TTF/DejaVuSans.ttf')
bold=bpy.data.fonts.load('/usr/share/fonts/TTF/DejaVuSans-Bold.ttf')
font.pack();bold.pack()

def empty(name,loc=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=loc;return o
def cube(name,loc,dims,mat,parent=None,bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.dimensions=dims
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.parent=parent;o.location=loc;o.data.materials.append(mat)
 if bevel:
  b=o.modifiers.new('Soft manufactured edges','BEVEL');b.width=bevel;b.segments=3
  o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def cyl(name,loc,r,depth,mat,parent=None,rot=(0,0,0),vertices=32):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth);o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.rotation_euler=rot;o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return o
def text(name,body,loc,size,mat,parent=None):
 c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.font=font;c.space_character=1.08
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;o.data.materials.append(mat);return o
def show(o,start,end):
 for f,v in [(1,start>1),(max(1,start-1),True),(start,False),(end,False),(end+1,True)]:
  o.hide_render=v;o.keyframe_insert('hide_render',frame=f)
def line(name,points,mat,parent=None,r=.008):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2
 s=c.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.parent=parent;o.data.materials.append(mat);return o

# Parts use separate roots so all geometry remains individually editable.
bin=empty('07 | Secure collection container',(0,0,.72))
cube('Bin floor',(0,0,-.49),(2.9,2.06,.10),metal,bin)
for x in [-1.4,1.4]:cube('Bin side',(x,0,0),(.09,2.06,1.08),metal,bin)
cube('Bin rear',(0,1,0),(2.9,.09,1.08),metal,bin)
cube('Bin front',(0,-1,-.10),(2.9,.09,.88),metal,bin)
cube('Collection tray handle',(0,-1.07,.14),(.65,.08,.13),black,bin)

pi=empty('01 | Raspberry Pi 4',(0,.55,1.75))
cube('Pi 4 PCB',(0,0,0),(.95,.68,.035),green,pi,.018)
cube('CPU package',(-.08,.02,.055),(.25,.25,.07),metal,pi,.008)
for y in [-.19,.07]:
 cube('USB port',(.36,y,.10),(.29,.20,.18),metal,pi,.008)
 cube('USB socket opening',(.51,y,.1),(.01,.15,.11),black,pi,.001)
cube('Ethernet port',(.30,.28,.12),(.32,.20,.22),metal,pi,.008)
for i in range(20):
 for j in range(2):cyl('GPIO gold pin',(-.40+i*.035,-.27+j*.045,.085),.009,.12,gold,pi,vertices=8)
for x in [-.42,.42]:
 for y in [-.27,.27]:cyl('Mounting standoff',(x,y,-.05),.027,.09,gold,pi)
for i in range(9):cube('PCB components',(-.33+(i%3)*.14,.08+(i//3)*.065,.03),(.07,.03,.025),black,pi,.002)
text('Pi silkscreen','RPI 4',(-.39,-.10,.025),.075,white,pi)
cube('USB-C power',(-.35,-.34,.04),(.12,.10,.06),metal,pi,.005)

screen=empty('02 | Touchscreen',(0,-.10,2.19));screen.rotation_euler.x=math.radians(17)
cube('Touchscreen bezel',(0,0,0),(2.02,1.40,.13),black,screen,.06)
cube('Touchscreen glass',(0,0,.074),(1.84,1.2,.02),screenmat,screen,.03)
text('Screen title','ENCYCLE BANK',(-.79,.39,.09),.155,white,screen)
text('Screen prompt','SIGN IN TO BEGIN',(-.79,.17,.09),.07,teal,screen)
for label,y in [('Gmail address',-.04),('Phone number',-.26)]:
 cube('Input field',(0,y,.09),(1.55,.16,.006),pla,screen,.015)
 text('Field label',label,(-.70,y-.025,.10),.065,white,screen)
cube('Continue button',(.44,-.47,.09),(.68,.14,.008),teal,screen,.018)
text('Continue','CONTINUE',(.15,-.495,.10),.07,black,screen)

camera=empty('03 | Raspberry Pi Camera Module',(0,.81,2.65))
cube('Camera mount',(0,.04,-.13),(.15,.15,.35),pla,camera)
cube('Camera module board',(0,0,.06),(.36,.04,.36),green,camera,.015)
cyl('Lens housing',(0,-.09,.06),.115,.15,black,camera,(math.pi/2,0,0))
cyl('Lens metal rim',(0,-.17,.06),.10,.025,metal,camera,(math.pi/2,0,0))
cyl('Camera lens',(0,-.185,.06),.076,.012,glass,camera,(math.pi/2,0,0))
for x in [-.14,.14]:
 for z in [-.08,.20]:cyl('Camera mounting screw',(x,-.026,z),.018,.018,gold,camera,(math.pi/2,0,0),16)
cube('Camera ribbon',(0,.055,-.21),(.19,.013,.28),gold,camera,.002)

sensor=empty('04 | Ultrasonic sensor',(.89,-1.20,1.52))
cube('Ultrasonic PCB',(0,0,0),(.57,.06,.23),blue,sensor,.01)
for x in [-.17,.17]:
 cyl('Ultrasonic transducer',(x,-.08,0),.105,.13,metal,sensor,(math.pi/2,0,0))
 cyl('Transducer mesh',(x,-.15,0),.084,.012,black,sensor,(math.pi/2,0,0))
 for z in [-.04,0,.04]:cube('Grille line',(x,-.159,z),(.13,.005,.008),metal,sensor,.001)
for x in [-.06,-.02,.02,.06]:cube('Sensor pin',(x,.05,-.15),(.012,.02,.15),gold,sensor,.001)

servo=empty('05 | MG90S servo',(-1.38,-.90,1.18))
cube('MG90S body',(0,0,0),(.27,.23,.45),black,servo,.02)
cube('Servo mounting ears',(0,0,.13),(.46,.23,.045),black,servo,.012)
cyl('Servo output gear',(.18,0,.12),.09,.13,metal,servo,(0,math.pi/2,0))
cube('Servo horn',(.26,0,.04),(.04,.07,.29),white,servo,.02)
line('Servo cable',[(0,.1,-.15),(0,.24,-.22),(.3,.3,-.3),(.5,.3,-.3)],gold,servo,.012)

door=empty('06 | Hinged deposit trapdoor',(0,-1.28,1.25))
cube('Trapdoor panel',(0,0,-.37),(2.48,.085,.73),pla,door,.025)
cyl('Hinge shaft',(0,0,0),.045,2.6,metal,door,(0,math.pi/2,0))
cube('Deposit green accent',(0,-.049,-.19),(1.9,.008,.025),teal,door,.004)
t=text('Deposit label','E-WASTE DEPOSIT',(-.83,-.05,-.46),.135,white,door);t.rotation_euler.x=math.pi/2

shell=empty('08 | Black PLA printed enclosure')
cube('Enclosure base',(0,0,.10),(3.42,2.50,.15),pla,shell)
for x in [-1.66,1.66]:
 verts=[(x-.055,-1.25,.15),(x+.055,-1.25,.15),(x+.055,1.25,.15),(x-.055,1.25,.15),(x-.055,-1.25,1.83),(x+.055,-1.25,1.83),(x+.055,1.25,2.59),(x-.055,1.25,2.59)]
 mesh=bpy.data.meshes.new('Sloped side');mesh.from_pydata(verts,[],[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]);mesh.update()
 o=bpy.data.objects.new('PLA sloped side wall',mesh);bpy.context.collection.objects.link(o);o.parent=shell;o.data.materials.append(pla)
 b=o.modifiers.new('Rounded print edges','BEVEL');b.width=.025;b.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
cube('Rear cover',(0,1.22,1.35),(3.42,.10,2.40),pla,shell)
for x in [-1.47,1.47]:cube('Front upright',(x,-1.23,.9),(.32,.13,1.52),pla,shell)
cube('Front header',(0,-1.23,1.64),(3.42,.12,.42),pla,shell)
cube('Front bottom rail',(0,-1.23,.3),(3.42,.12,.26),pla,shell)
top=empty('Sloping cover frame');top.parent=shell;top.location=(0,0,2.21);top.rotation_euler.x=math.radians(17)
for x in [-1.38,1.38]:cube('PLA display side frame',(x,0,0),(.65,2.6,.10),pla,top)
for y in [-1.07,1.07]:cube('PLA display end frame',(0,y,0),(2.14,.46,.10),pla,top)
for x in [-1.42,1.42]:
 for y in [-1.05,1.05]:cyl('Lid fastener',(x,y,.061),.027,.02,metal,top,vertices=16)
for x in [-1.4,1.4]:
 for y in [-.95,.95]:cyl('Rubber foot',(x,y,.02),.12,.09,black,shell)
# The original logo is used as a small square plaque without alteration.
logo=material('Official NOVARA logo plaque',(1,1,1),0,.7)
image=bpy.data.images.load(os.path.join(ROOT,'novara-logo.png'));image.pack()
node=logo.node_tree.nodes.new('ShaderNodeTexImage');node.image=image
logo.node_tree.links.new(node.outputs['Color'],logo.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
bpy.ops.mesh.primitive_plane_add(size=.31);o=bpy.context.object;o.name='Official unmodified NOVARA plaque';o.parent=shell;o.location=(-1.44,-1.305,1.65);o.rotation_euler.x=math.pi/2;o.data.materials.append(logo)

# Studio and camera.
cube('Infinite studio floor',(0,0,-.2),(200,200,.1),floor,bevel=0)
cyl('Presentation plinth',(0,0,-.09),2.55,.15,black,vertices=96)
def light(name,loc,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
light('Large soft key',(-4,-5,7),1500,5,(.72,.88,1))
light('Warm rim',(4,3,6),2000,4,(1,.75,.43))
light('Front fill',(1,-5,4),800,4,(.65,1,.85))
bpy.ops.object.camera_add(location=(7,-12,9));cam=bpy.context.object;cam.name='Cinematic camera';scene.camera=cam
cam.data.type='ORTHO';cam.data.ortho_scale=16;cam.data.lens=50
target=Vector((0,0,1.4));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
right=cam.rotation_euler.to_matrix()@Vector((1,0,0));up=cam.rotation_euler.to_matrix()@Vector((0,1,0))
parts=[(pi,(-2.3,2.1),2.05,(0,0,0),211),(screen,(-2.3,.55),.86,(0,0,0),331),(camera,(-2.3,-1),2.3,(0,0,0),307),(sensor,(-2.3,-2.55),2.8,(0,0,0),283),(servo,(2.3,2.1),2.4,(0,0,0),235),(door,(2.3,.55),.74,(0,0,-.37),259),(bin,(2.3,-1),.60,(0,0,0),193),(shell,(2.3,-2.55),.50,(0,0,1.30),355)]
for root,(x,y),scale,centre,start in parts:
 assembled=root.location.copy();exploded=target+(cam.location-target).normalized()*4+right*x+up*y-Vector(centre)*scale
 for f,pos,s in [(1,exploded,scale),(start,exploded,scale),(start+53,assembled,1),(672,assembled,1)]:
  root.location=pos;root.scale=(s,s,s);root.keyframe_insert('location',frame=f);root.keyframe_insert('scale',frame=f)
for f,loc,aim,zoom in [(1,(7,-12,9),(0,0,1.4),16),(192,(7,-12,9),(0,0,1.4),16),(432,(7,-12,7.5),(1.05,0,1.4),8.8),(672,(4.8,-13,6.8),(1.05,0,1.4),8.8)]:
 cam.location=loc;cam.rotation_euler=(Vector(aim)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=zoom
 cam.keyframe_insert('location',frame=f);cam.keyframe_insert('rotation_euler',frame=f);cam.data.keyframe_insert('ortho_scale',frame=f)

# Camera-locked typography. Every label corresponds to an independent assembly.
overlay=empty('Film typography');overlay.parent=cam;overlay.location=(0,0,-5)
for axis in range(3):
 driver=overlay.driver_add('scale',axis).driver;v=driver.variables.new();v.name='zoom';v.targets[0].id_type='CAMERA';v.targets[0].id=cam.data;v.targets[0].data_path='ortho_scale';driver.expression='zoom / 16'
def title(body,x,y,size=.18,mat=white,start=1,end=672):
 o=text('Title | '+body,body,(x,y,0),size,mat,overlay);show(o,start,end);return o
title('ENCYCLE BANK',-7.2,3.72,.42)
title('A SECOND LIFE STARTS HERE',-7.18,3.35,.13,teal)
title('01 / THE COMPONENTS',3.80,3.72,.17,teal,1,192)
title('02 / COMING TOGETHER',3.80,3.72,.17,teal,193,408)
title('03 / READY FOR A SECOND LIFE',2.95,3.72,.15,teal,409,672)
title('TEAM NOVARA  /  CONCEPT VISUALISATION',-7.2,-3.90,.13,teal)
title('Indicative layout and proportions. Black PLA finish is a design assumption.',-7.2,-4.16,.12,muted)
labels=[('01','RASPBERRY PI 4','Core controller'),('02','TOUCHSCREEN','Display and user input'),('03','PI CAMERA MODULE','Verification photograph'),('04','ULTRASONIC SENSOR','Deposit monitoring'),('05','MG90S SERVO','Trapdoor actuator'),('06','DEPOSIT TRAPDOOR','Timed access panel'),('07','SECURE CONTAINER','Collected e-waste storage'),('08','BLACK PLA ENCLOSURE','Fine printed layer texture')]
for i,(number,name,desc) in enumerate(labels):
 x=-7.2 if i<4 else 4.25;y=[2.1,.55,-1,-2.55][i%4]
 title(number,x,y+.34,.13,teal,1,192);title(name,x,y,.19,white,1,192);title(desc,x,y-.30,.135,muted,1,192)
 pts=[(-4.25,y-.02,0),(-3.75,y-.02,0)] if i<4 else [(3.55,y-.02,0),(4.02,y-.02,0)]
 o=line('Component leader '+number,pts,teal,overlay,.008);show(o,1,192)
for body,start,end in [('STORAGE / A secure destination',193,234),('CONTROL / Raspberry Pi at the core',235,282),('MECHANICS / Access and monitoring',283,330),('INTERFACE / See, select, verify',331,354),('ENCLOSURE / A black PLA finish',355,408)]:
 title(body,-7.2,-3.35,.22,white,start,end)
title('SIMPLE. SECURE. REWARDING.',2.1,2.70,.23,teal,433,672)
steps=[('01  SIGN IN','Gmail address + phone number'),('02  VERIFY','One-time password'),('03  SELECT','Device category + damage level'),('04  CAPTURE','Camera verification photograph'),('05  DEPOSIT','Servo trapdoor: 15-second window'),('06  TRACK','Tracking code + paperless receipt'),('07  RECOGNISE','Certificate after consistent deposits')]
for i,(a,b) in enumerate(steps):
 y=2.13-i*.73;title(a,2.1,y,.18,white,433,672);title(b,2.1,y-.25,.135,muted,433,672)
title('ASSEMBLED CONCEPT',-6.9,-2.95,.18,teal,433,672)
title('A compact kiosk for responsible collection.',-6.9,-3.27,.145,white,433,672)
for name,frame in [('Exploded parts',1),('Assembly begins',193),('Enclosure closes',355),('Assembled hero and workflow',433)]:scene.timeline_markers.new(name,frame=frame)
scene['Design status']='Concept reconstruction from supplied external videos and component list; not engineering CAD.'
scene['Reference distinction']='The E-waste city motherboard artwork is contextual; it is not treated as the Raspberry Pi or a confirmed internal layout.'
scene['Mechanism']='15-second deposit interval is specified in the workflow; this film shows assembly, not a timed deposit demonstration.'
scene.frame_set(1)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Encycle-Bank-Assembly.blend'))
if '--preview' in sys.argv:
 for frame in (1,300,540):
  scene.frame_set(frame);scene.render.filepath=f'/tmp/encycle-render/preview-{frame}.png';bpy.ops.render.render(write_still=True)
elif '--render' in sys.argv:
 os.makedirs('/tmp/encycle-render',exist_ok=True)
 for frame in [1]+list(range(193,673,2)):
  destination=f'/tmp/encycle-render/frame_{frame:04d}.png'
  if '--resume' in sys.argv and os.path.exists(destination): continue
  scene.frame_set(frame);scene.render.filepath=destination;bpy.ops.render.render(write_still=True)
