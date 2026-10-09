"""Private local conversion. Usage: blender -b --python export-cast.py -- vendor_folder output_folder"""
import bpy,sys,json
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:]; source=Path(args[0]);out=Path(args[1]);out.mkdir(parents=True,exist_ok=True)
cast=dict(Ash='PunkGuy',Bex='GamerGirl',Cole='Jock',Dara='PunkGirl',Eli='HipsterGuy',Fenn='Paramedic',Gus='Hotdog',Hana='HipsterGirl')
rows=[]
for seat,kind in cast.items():
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.fbx(filepath=str(source/'FBX/Characters'/('SK_Character_'+kind+'.fbx')))
 tex=bpy.data.images.load(str(source/'Textures/Polygon_City_Characters_Texture_01_A.png'));tex.pack()
 mat=bpy.data.materials.new('City palette');mat.use_nodes=True
 bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.83
 node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=tex;node.interpolation='Closest';mat.node_tree.links.new(node.outputs['Color'],bsdf.inputs['Base Color'])
 triangles=0
 for ob in bpy.data.objects:
  if ob.type=='MESH':
   ob.data.materials.clear();ob.data.materials.append(mat);ob.data.calc_loop_triangles();triangles+=len(ob.data.loop_triangles)
 bpy.ops.export_scene.gltf(filepath=str(out/(seat+'.glb')),export_format='GLB',export_animations=False,export_yup=True,export_texcoords=True,export_normals=True,export_skins=True,export_morph=False)
 rows.append(dict(name=seat,character=kind,file=seat+'.glb',triangles=triangles,bytes=(out/(seat+'.glb')).stat().st_size))
(out/'cast.json').write_text(json.dumps(rows,indent=2));print('CAST_RECEIPT',json.dumps(rows))
