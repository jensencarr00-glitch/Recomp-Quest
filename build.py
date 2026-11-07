from pathlib import Path
import json
p=Path('/mnt/data/routinehub_merged/index.html'); s=p.read_text()
# modern theme
s=s.replace('<title>Routine</title>','<title>RoutineHub</title>').replace('<meta name="theme-color" content="#0b0b0b">','<meta name="theme-color" content="#07191c">')
a=s.index('<style>'); b=s.index('</style>',a)+8
css='''<style>
:root{--bg:#07191c;--text:#e8f4ef;--mute:#91aaa3;--acc:#42e6a4;--line:#28504d;color-scheme:dark;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important}
html,body{margin:0;background:radial-gradient(ellipse at 50% -15%,#174344 0%,var(--bg) 55%);color:var(--text);font-size:16px;-webkit-text-size-adjust:100%;min-height:100%}
main{padding:18px 15px calc(78px + env(safe-area-inset-bottom,0px));max-width:680px;margin:0 auto}
h1{font-size:22px;color:var(--text);letter-spacing:-.4px;margin:8px 0 14px;font-weight:800}.art{color:var(--acc);font-size:13px;line-height:1.1;margin:4px 0 10px}
.card{background:linear-gradient(145deg,#143236,#0c2225);border:1px solid var(--line);border-radius:17px!important;padding:14px;margin-bottom:11px;box-shadow:0 8px 22px #0002}.next{border:1px solid var(--acc);box-shadow:0 0 0 1px #42e6a422}.done{opacity:.55}
.row{display:flex;align-items:center;justify-content:space-between;gap:8px}.tip{font-size:13px;color:var(--mute)}.rd{color:var(--acc)}
button{background:#143b3a;border:1px solid #32665e;border-radius:11px!important;color:var(--acc);font-size:13px;font-weight:650;padding:8px 10px;text-decoration:none}
input[type=checkbox]{appearance:none;width:23px;height:23px;margin:0;background:#0a2022;border:1px solid #5d8178;border-radius:7px!important;vertical-align:middle;flex:none;position:relative}input[type=checkbox]:checked{background:var(--acc);border-color:var(--acc)}input[type=checkbox]:checked:after{content:"✓";position:absolute;inset:-1px 0 0;text-align:center;color:#06231c;font-weight:900;font-size:16px}
select,input[type=text],input[type=time],input[type=number]{background:#0a2022;color:var(--text);border:1px solid #32605a;border-radius:10px!important;font-size:16px;padding:9px;width:100%}.t{color:#55d9d0;flex:none;width:6ch;font-weight:750}.w{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
nav{position:fixed;left:0;right:0;bottom:0;display:flex;background:rgba(5,22,24,.97);border-top:1px solid #28504d;padding:6px 5px calc(6px + env(safe-area-inset-bottom,0px));z-index:5;gap:3px}nav button{flex:1;height:47px;text-decoration:none;color:var(--mute);background:transparent;border:0;border-radius:10px!important;padding:0;font-size:11px;letter-spacing:.2px}nav button.on{color:#06251e;background:var(--acc)}
</style>'''
s=s[:a]+css+s[b:]
s=s.replace('<nav><button id="t1">[TODAY]</button><button id="t2">[WEEK]</button><button id="t3">[EDIT]</button></nav>','<nav><button id="t1">Today</button><button id="t2">Week</button><button id="t3">Edit</button><button id="meals" onclick="location.href=\'./meals/index.html\'">Meals</button></nav>')
# Detailed routine, include weekly clean rota, daily + day-specific shower/hair
start=s.index('var DEF='); end=s.index('\nvar S,tab=1;',start)
defs='''var DEF=[
{id:1,t:"08:00",n:"Wake up, drink water, open curtains and get 10–20 minutes of daylight",c:"sleep",ml:250},
{id:2,t:"08:05",n:"Use the toilet, wash hands and make your bed",c:"free"},
{id:21,t:"08:10",n:"Weigh in (after toilet, before breakfast)",c:"free",d:"d1"},
{id:30,t:"08:15",n:"Face: gentle cleanser, moisturiser and SPF 30–50",c:"free"},
{id:31,t:"08:20",n:"Brush teeth for 2 minutes with fluoride toothpaste; spit, don't rinse",c:"free"},
{id:32,t:"08:25",n:"Shower: wash underarms, external groin, bottom, feet and sweaty areas",c:"free",d:"days:1,3,5,0"},
{id:33,t:"08:25",n:"Non-shower day: wash face, underarms, external groin and feet with a clean flannel",c:"free",d:"days:2,4,6"},
{id:34,t:"08:40",n:"Dry thoroughly, especially feet and skin folds; put on clean underwear and socks",c:"free"},
{id:35,t:"08:45",n:"Apply deodorant to clean, dry underarms; moisturise dry body areas",c:"free"},
{id:36,t:"08:50",n:"Hair wash: shampoo scalp, rinse, condition mid-lengths and ends",c:"free",d:"days:0,3"},
{id:37,t:"08:55",n:"Comb/style hair and apply fragrance (start with 1–2 sprays)",c:"free"},
{id:3,t:"09:00",n:"Breakfast and 5g creatine if this is part of your plan",c:"eat"},
{id:4,t:"10:00",n:"Study / focused work block 1",c:"study"},
{id:5,t:"11:00",n:"Drink water and stretch for 5 minutes",c:"water",ml:250},
{id:6,t:"11:30",n:"Walk outside for 20–30 minutes",c:"move"},
{id:7,t:"12:30",n:"Protein snack or shake if it fits your nutrition plan",c:"eat",ml:300},
{id:8,t:"13:30",n:"Caffeine cut-off: avoid caffeine from this point",c:"sleep"},
{id:9,t:"14:00",n:"Lunch and a glass of water",c:"eat",ml:250},
{id:26,t:"14:30",n:"Mouthwash if using: follow label; keep separate from brushing",c:"free"},
{id:10,t:"15:00",n:"Study / focused work block 2",c:"study"},
{id:11,t:"16:30",n:"Drink water and take a short movement break",c:"water",ml:250},
{id:13,t:"18:00",n:"Strength workout on planned training days; otherwise light activity",c:"move",d:"wk",ml:250},
{id:15,t:"19:00",n:"Post-workout protein if needed to meet daily protein target",c:"eat"},
{id:16,t:"19:30",n:"Dinner",c:"eat"},
{id:40,t:"20:00",n:"Five-minute room reset: clothes away, surfaces clear, rubbish checked",c:"clean"},
{id:41,t:"20:10",n:"Wash dishes and wipe kitchen worktops after eating",c:"clean"},
{id:18,t:"21:00",n:"Water; prepare tomorrow's clothes and any food that needs defrosting",c:"water",ml:200},
{id:19,t:"22:00",n:"Floss between teeth, then gently clean tongue",c:"free"},
{id:27,t:"22:10",n:"Brush teeth for 2 minutes with fluoride toothpaste; spit, don't rinse",c:"free"},
{id:28,t:"22:25",n:"Wash face and apply moisturiser; lip balm if needed",c:"free"},
{id:29,t:"22:40",n:"Prepare tomorrow: check schedule, tidy bedside and set alarm",c:"free"},
{id:20,t:"23:00",n:"Wind down: dim lights, reduce screens and relax",c:"sleep"},
{id:100,t:"00:00",n:"Lights out — target 8 hours until 08:00",c:"sleep"},
{id:50,t:"17:00",n:"Laundry: wash, dry and put clothes away",c:"clean",d:"d1"},
{id:51,t:"17:00",n:"Clean bathroom: sink, toilet, shower and taps",c:"clean",d:"d2"},
{id:52,t:"17:00",n:"Dust bedroom, desk and shelves",c:"clean",d:"d3"},
{id:53,t:"17:00",n:"Vacuum bedroom and main floors; mop hard floors if needed",c:"clean",d:"d4"},
{id:54,t:"17:00",n:"Wash towels and bath mat; replace with clean ones",c:"clean",d:"d5"},
{id:55,t:"11:00",n:"Change bedsheets and pillowcases; air the bed",c:"clean",d:"d6"},
{id:56,t:"11:30",n:"Kitchen reset: clean hob, sink, fridge handles and bins",c:"clean",d:"d0"},
{id:57,t:"12:00",n:"Weekly grooming: trim/file nails, clean trimmer and hairbrush",c:"free",d:"d0"},
{id:58,t:"12:30",n:"Weekly review: check progress and plan the coming week",c:"free",d:"d0"},
{id:59,t:"11:00",n:"Monthly deep clean: bathroom tiles, grout and hard-to-reach areas",c:"clean",d:"m1"},
{id:60,t:"11:30",n:"Monthly clean: windows, mirrors and inside appliances",c:"clean",d:"m1"},
{id:61,t:"12:00",n:"Monthly declutter: one drawer, shelf or storage area",c:"clean",d:"m1"}
];'''
s=s[:start]+defs+s[end:]
# app() day logic
old='function app(b,k){var g=new Date(k+"T00:00:00").getDay();return!b.d||(b.d==="wk"?g>0&&g<6:b.d==="we"?g===0||g===6:/^d\\d$/.test(b.d)?g===+b.d.charAt(1):true)}'
new='function app(b,k){var dt=new Date(k+"T00:00:00"),g=dt.getDay();return!b.d||(b.d==="wk"?g>0&&g<6:b.d==="we"?g===0||g===6:b.d==="m1"?dt.getDate()===1:b.d.indexOf("days:")===0?b.d.slice(5).split(",").map(Number).indexOf(g)!==-1:/^d\\d$/.test(b.d)?g===+b.d.charAt(1):true)}'
if old not in s: print('app old not found')
else: s=s.replace(old,new)
# Add select options for custom day filters
needle='<option value="d0"\'+(b.d==="d0"?" selected":"")+\'>Sun only</option></select>'
replacement='<option value="d0"\'+(b.d==="d0"?" selected":"")+\'>Sun only</option><option value="days:1,3,5,0"\'+(b.d==="days:1,3,5,0"?" selected":"")+\'>Mon/Wed/Fri/Sun</option><option value="days:0,3"\'+(b.d==="days:0,3"?" selected":"")+\'>Wed/Sun</option><option value="m1"\'+(b.d==="m1"?" selected":"")+\'>Monthly (1st)</option></select>'
if needle in s:s=s.replace(needle,replacement)
else: print('select needle not found')
# migration refresh schedule once to correct previous older routine, preserve day history
s=s.replace('if(S.v!==4){S.r=JSON.parse(JSON.stringify(DEF));S.v=4}','if(S.v!==9){S.r=JSON.parse(JSON.stringify(DEF));S.v=9}')
p.write_text(s)
# root service worker cache meal app too
Path('/mnt/data/routinehub_merged/sw.js').write_text('''var C="routinehub-v9",F=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./meals/index.html","./meals/manifest.json","./meals/icon-192.png","./meals/icon-512.png","./meals/sw.js"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C&&x!=="meal-prep-v1"}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(C).then(function(x){x.put(e.request,c)});return r}).catch(function(){return caches.match(e.request)}))});''')
# Meal app style matches hub; title/manifest branding but still functional app
mp=Path('/mnt/data/routinehub_merged/meals/index.html'); ms=mp.read_text()
ms=ms.replace('<title>Meal Prep</title>','<title>RoutineHub · Meals</title>').replace('<meta name="theme-color" content="#0b0b0b">','<meta name="theme-color" content="#07191c">')
# override legacy monochrome CSS after all style rules
ms=ms.replace('</style>','''
:root{--bg:#07191c;--card:#10272a;--text:#e8f4ef;--mute:#91aaa3;--acc:#42e6a4;--line:#28504d;--ok:#143b3a;--okT:#42e6a4;--warn:#3b3020;--warnT:#ffbd69}
html,body{background:radial-gradient(ellipse at 50% -15%,#174344 0%,#07191c 55%);color:#e8f4ef;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.card,.sum div{background:linear-gradient(145deg,#143236,#0c2225);border:1px solid #28504d!important;border-radius:16px!important}
button,.link{color:#42e6a4}nav{background:rgba(5,22,24,.97);border-color:#28504d}nav button.on{color:#42e6a4}
select,input[type=number]{background:#0a2022;color:#e8f4ef;border:1px solid #32605a;border-radius:10px!important}
</style>''')
# internal meal SW registration removed: parent root SW handles cache
ms=ms.replace('if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(function(){});','')
mp.write_text(ms)
# meal manifest relative start URL stays local; set standalone false? retain as secondary page
m=Path('/mnt/data/routinehub_merged/manifest.json'); d=json.loads(m.read_text());d.update(name='RoutineHub',short_name='RoutineHub',background_color='#07191c',theme_color='#07191c');m.write_text(json.dumps(d,separators=(',',':')))
mm=Path('/mnt/data/routinehub_merged/meals/manifest.json'); d=json.loads(mm.read_text());d.update(name='RoutineHub Meals',short_name='Meals',background_color='#07191c',theme_color='#07191c');mm.write_text(json.dumps(d,separators=(',',':')))
