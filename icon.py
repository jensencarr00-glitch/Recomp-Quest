from PIL import Image,ImageDraw,ImageFilter
import math
for sz in (192,512):
 S=sz*3; im=Image.new('RGB',(S,S)); px=im.load()
 for y in range(S):
  for x in range(S):
   g=max(0,1-math.sqrt(((x-S*.48)/(S*.8))**2+((y-S*.28)/(S*.8))**2));px[x,y]=(5+int(4*g),22+int(50*g),26+int(42*g))
 d=ImageDraw.Draw(im,'RGBA');d.rounded_rectangle((S*.05,S*.05,S*.95,S*.95),radius=int(S*.22),fill=(7,34,36,70),outline=(65,230,164,180),width=int(S*.012))
 halo=Image.new('RGBA',(S,S));ImageDraw.Draw(halo).ellipse((S*.2,S*.13,S*.8,S*.73),fill=(49,224,160,40));halo=halo.filter(ImageFilter.GaussianBlur(S*.09));im=Image.alpha_composite(im.convert('RGBA'),halo);d=ImageDraw.Draw(im,'RGBA')
 d.line([(S*.17,S*.60),(S*.4,S*.34),(S*.51,S*.47),(S*.65,S*.28),(S*.84,S*.60)],fill=(70,238,172,255),width=int(S*.045),joint='curve')
 d.line([(S*.29,S*.61),(S*.29,S*.78),(S*.71,S*.78),(S*.71,S*.61)],fill=(70,238,172,255),width=int(S*.032),joint='curve')
 d.rounded_rectangle((S*.45,S*.64,S*.56,S*.78),radius=int(S*.02),fill=(67,225,164,240))
 d.ellipse((S*.66,S*.65,S*.84,S*.83),fill=(65,230,164,255));d.line([(S*.705,S*.74),(S*.75,S*.78),(S*.81,S*.695)],fill=(5,34,29,255),width=int(S*.027),joint='curve')
 d.line([(S*.22,S*.23),(S*.22,S*.33)],fill=(255,190,105,255),width=int(S*.018));d.line([(S*.17,S*.28),(S*.27,S*.28)],fill=(255,190,105,255),width=int(S*.018))
 im.resize((sz,sz),Image.Resampling.LANCZOS).save(f'/mnt/data/routinehub_merged/icon-{sz}.png')
