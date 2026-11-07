
var IC={sleep:"zz",water:"~",study:"##",social:"@",eat:"*",free:"+",move:">"};
var DEF=[
{id:1,t:"08:00",n:"Wake up, drink water, open curtains and get 10–20 minutes of daylight",c:"sleep",ml:250},
{id:2,t:"08:05",n:"Use the toilet, wash hands and make your bed",c:"free"},
{id:21,t:"08:10",n:"Weigh in (after toilet, before breakfast)",c:"free",d:"d1"},
{id:30,t:"08:15",n:"Face: gentle cleanser, moisturiser and SPF 30–50",c:"free",detail:["Wash your hands, then wet your face with lukewarm water.","Use one pump of gentle face wash on wet hands and rub your hands together to make a lather.","With your fingertips, massage gently over your chin, forehead and cheeks in slow circles for about 10–20 seconds. Do not scrub.","Rinse all cleanser away with lukewarm water, then pat your face dry with a clean towel.","Gently spread a pea-sized amount of moisturiser over your cheeks, chin and forehead.","Finish with your SPF 30–50 sunscreen as the last morning skincare step; follow its label for application and reapplication."]},
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
{id:19,t:"22:00",n:"Floss / clean between teeth with interdental brushes",c:"free"},
{id:27,t:"22:10",n:"Brush teeth for 2 minutes with fluoride toothpaste; spit, don't rinse",c:"free"},
{id:62,t:"22:05",n:"Gently scrape your tongue once daily",c:"free"},
{id:28,t:"22:25",n:"Wash face and apply moisturiser; lip balm if needed",c:"free",detail:["Wash your hands, then wet your face with lukewarm water.","Use one pump of gentle face wash on wet hands and rub your hands together to make a lather.","With your fingertips, massage gently over your chin, forehead and cheeks in slow circles for about 10–20 seconds. Do not scrub.","Rinse all cleanser away with lukewarm water, then pat your face dry with a clean towel.","Gently spread a pea-sized amount of moisturiser over your cheeks, chin and forehead.","Apply lip balm if you want to."]},
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
];
var S,tab=1,activeSection="today";
try{S=JSON.parse(localStorage.getItem("rt1"))}catch(e){}
if(!S||!Array.isArray(S.r)||!S.days||typeof S.days!=="object")S={r:JSON.parse(JSON.stringify(DEF)),days:{},wt:2000,v:10};
S.r=S.r.filter(function(b){return b&&Number.isFinite(+b.id)&&typeof b.t==="string"&&typeof b.n==="string"});
if(!S.r.length)S.r=JSON.parse(JSON.stringify(DEF));
var routineVersion=+S.v||0;
if(routineVersion<11){
 var oldFloss=S.r.filter(function(b){return b.id===19})[0];
 if(oldFloss&&oldFloss.n==="Floss between teeth, then gently clean tongue")oldFloss.n="Floss / clean between teeth with interdental brushes";
 [19,62].forEach(function(id){var seed=DEF.filter(function(b){return b.id===id})[0];if(seed&&!S.r.some(function(b){return b.id===id}))S.r.push(JSON.parse(JSON.stringify(seed)))});
}
if(routineVersion<12){
 [[30,"Face: gentle cleanser, moisturiser and SPF 30–50"],[28,"Wash face and apply moisturiser; lip balm if needed"]].forEach(function(pair){var item=S.r.filter(function(b){return b.id===pair[0]})[0],seed=DEF.filter(function(b){return b.id===pair[0]})[0];if(item&&item.n===pair[1]&&!Array.isArray(item.detail)&&seed)item.detail=JSON.parse(JSON.stringify(seed.detail))});
}
if(routineVersion<13){
 [[30,/face|skin/i],[28,/face|skin/i]].forEach(function(pair){var item=S.r.filter(function(b){return b.id===pair[0]})[0],seed=DEF.filter(function(b){return b.id===pair[0]})[0];if(item&&!Array.isArray(item.detail)&&seed&&pair[1].test(item.n))item.detail=JSON.parse(JSON.stringify(seed.detail))});
}
var skinTemplates={morning:DEF.filter(function(b){return b.id===30})[0].detail,evening:DEF.filter(function(b){return b.id===28})[0].detail};
S.r.forEach(function(item){
 if(Array.isArray(item.detail)&&item.detail.length)return;
 var label=String(item.n||"");
 if(!/(face|facial|skin[\s-]?care)/i.test(label))return;
 var hour=parseInt(String(item.t||"0:00").slice(0,2),10)||0,evening=/evening|night/i.test(label)||hour>=15;
 item.detail=JSON.parse(JSON.stringify(evening?skinTemplates.evening:skinTemplates.morning));
});
if(routineVersion<15){
 S.r.forEach(function(item){var label=String(item.n||"");
  if(/non[\s-]?shower|no[\s-]?shower/i.test(label))item.d="days:2,4,6";
  else if(/\bshower\b/i.test(label))item.d="days:1,3,5,0";
  if(/\bhair[\s-]*wash(?:ing)?\b|\bwash(?:ing)?\b.*\bhair\b|\bshampoo\b/i.test(label))item.d="days:0,3";
 });
}
if(!Number.isFinite(+S.wt)||S.wt<1)S.wt=2000;
if(!S.xp||typeof S.xp!=="object")S.xp={total:0,days:{}};
if(!Number.isFinite(+S.xp.total)||S.xp.total<0)S.xp.total=0;else S.xp.total=+S.xp.total;
if(!S.xp.days||typeof S.xp.days!=="object")S.xp.days={};
S.v=15;
function save(){try{localStorage.setItem("rt1",JSON.stringify(S))}catch(e){alert("RoutineHub could not save your change. Browser storage may be full or disabled.")}}
save();
function key(d){d=d||new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
var XP_PER_LEVEL=250,XP_RANKS=["Ashen Wayfarer","Kindled Sentinel","Rune-Seeker","Dusk Warden","Gravebound Knight","Dawnforged"],QUESTS=[
 {id:"rhythm",name:"Keep the daily vows",reward:12},
 {id:"water",name:"Fill the healing flask",reward:12},
 {id:"sleep",name:"Rest by the hearth",reward:8},
 {id:"meals",name:"Pack two field rations",reward:12},
 {id:"training",name:"Train with intent",reward:15}
];
function xpDay(date){date=date||key();var rec=S.xp.days[date]||(S.xp.days[date]={});if(!rec.routines||typeof rec.routines!=="object")rec.routines={};if(!rec.meals||typeof rec.meals!=="object")rec.meals={};if(!rec.quests||typeof rec.quests!=="object")rec.quests={};return rec}
function completeQuests(){var rec=xpDay(),todayData=S.days[key()]||{d:{},w:0},checks=Object.keys(rec.routines).length,meals=Object.keys(rec.meals).length,ready={rhythm:checks>=3,water:(+todayData.w||0)>=S.wt,sleep:(+todayData.sl||0)>0,meals:meals>=2,training:!!rec.lift};QUESTS.forEach(function(q){if(ready[q.id]&&!rec.quests[q.id]){rec.quests[q.id]=true;S.xp.total+=q.reward}})}
function awardActionXP(kind,id){var rec=xpDay(),amount=0;
 if(kind==="routine"){id=String(id);if(rec.routines[id]||Object.keys(rec.routines).length>=5)return false;rec.routines[id]=true;amount=3}
 else if(kind==="meal"){id=String(id);if(rec.meals[id]||Object.keys(rec.meals).length>=3)return false;rec.meals[id]=true;amount=4}
 else if(kind==="water"){if(rec.water)return false;rec.water=true;amount=8}
 else if(kind==="sleep"){if(rec.sleep)return false;rec.sleep=true;amount=6}
 else if(kind==="lift"){if(rec.lift)return false;rec.lift=true;amount=8}
 else return false;
 S.xp.total+=amount;completeQuests();return true
}
function xpLevel(){return Math.floor(S.xp.total/XP_PER_LEVEL)+1}
function questCard(){var rec=xpDay(),todayData=S.days[key()]||{d:{},w:0},checks=Math.min(3,Object.keys(rec.routines).length),mealCount=Math.min(2,Object.keys(rec.meals).length),items=[
 ["rhythm","Keep the daily vows",checks+" / 3",checks/3,!!rec.quests.rhythm],
 ["water","Fill the healing flask",Math.min(+todayData.w||0,S.wt)+" / "+S.wt+" ml",Math.min(1,(+todayData.w||0)/S.wt),!!rec.quests.water],
 ["sleep","Rest by the hearth",(+todayData.sl||0)>0?"Logged":"Log last night's sleep",(+todayData.sl||0)>0?1:0,!!rec.quests.sleep],
 ["meals","Pack two field rations",mealCount+" / 2 meals",mealCount/2,!!rec.quests.meals],
 ["training","Train with intent",rec.lift?"Set recorded":"Record one working set",rec.lift?1:0,!!rec.quests.training]
 ],total=S.xp.total||0,level=xpLevel(),within=total%XP_PER_LEVEL,rank=XP_RANKS[Math.floor((level-1)/5)%XP_RANKS.length];
 return '<section class="card quest-panel"><div class="quest-title-row"><div class="quest-topline"><span class="quest-sigil" aria-hidden="true">✧</span><div><p class="eyebrow" style="margin:0 0 4px">THE ASHEN PATH</p><div class="quest-rank">'+rank+'</div><div class="quest-note">Every small act adds to your journey.</div></div></div><div class="quest-level">LEVEL<b>'+level+'</b></div></div><div class="quest-meta" style="margin-top:16px"><span class="quest-note">EMBER EXPERIENCE</span><b>'+total.toLocaleString("en-GB")+' XP</b></div><div class="quest-meter" role="progressbar" aria-label="Progress to next level" aria-valuenow="'+within+'" aria-valuemin="0" aria-valuemax="'+XP_PER_LEVEL+'"><i style="width:'+Math.round(within/XP_PER_LEVEL*100)+'%"></i></div><div class="quest-note" style="text-align:right;margin-top:5px">'+within+' / '+XP_PER_LEVEL+' XP to level '+(level+1)+'</div><div class="quest-list"><div class="eyebrow">DAILY QUESTS</div>'+items.map(function(x){return '<div class="quest-row'+(x[4]?' done':'')+'"><span class="quest-check" aria-hidden="true">'+(x[4]?'✓':'·')+'</span><span class="quest-name">'+x[1]+'<small style="display:block;font-weight:500;color:var(--rh-muted);margin-top:3px">'+x[2]+'</small></span><span class="quest-reward">+'+QUESTS.filter(function(q){return q.id===x[0]})[0].reward+' XP</span></div>'}).join("")+'</div><p class="quest-note" style="margin:12px 0 0">No streak penalties. Return whenever you are ready.</p></section>'}
function updateXPBadge(){var el=document.getElementById("xp-badge");if(el){var total=S.xp.total||0;el.textContent="✧ "+total.toLocaleString("en-GB")+" XP · Lv "+xpLevel()}}
function day(k){return S.days[k]||(S.days[k]={d:{},w:0})}
function mins(t){var a=(t||"0:0").split(":");return+a[0]*60+ +a[1]}
function ord(t){var m=mins(t);return m<360?m+1440:m}
function list(){return S.r.slice().sort(function(a,b){return ord(a.t)-ord(b.t)})}
function app(b,k){var dt=new Date(k+"T00:00:00"),g=dt.getDay();return!b.d||(b.d==="wk"?g>0&&g<6:b.d==="we"?g===0||g===6:b.d==="m1"?dt.getDate()===1:b.d.indexOf("days:")===0?b.d.slice(5).split(",").map(Number).indexOf(g)!==-1:/^d\d$/.test(b.d)?g===+b.d.charAt(1):true)}
function slp(){var a=S.r.filter(function(b){return b.id===1})[0],z=S.r.filter(function(b){return b.id===100})[0];if(!a||!z)return null;return{wake:a.t,bed:z.t,h:((mins(a.t)-mins(z.t)+1440)%1440)/60}}
function pct(k){var dd=S.days[k]||{d:{}},en=S.r.filter(function(b){return b.on!==false&&app(b,k)}),n=en.filter(function(b){return dd.d[b.id]}).length;return en.length?Math.round(100*n/en.length):0}
function bar(p,w){var v=Math.max(0,Math.min(100,+p||0));return'<span class="meter"><i style="width:'+v+'%"></i></span>'}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function today(){
 var k=key(),dd=day(k),nw=new Date(),nm=nw.getHours()*60+nw.getMinutes();nm=nm<360?nm+1440:nm;
 var L=list().filter(function(b){return b.on!==false&&app(b,k)}),nx=-1;
 for(var i=0;i<L.length;i++)if(!dd.d[L[i].id]&&ord(L[i].t)>=nm-30){nx=i;break}
 if(nx<0)for(i=0;i<L.length;i++)if(!dd.d[L[i].id]){nx=i;break}
 var p=pct(k),wp=Math.round(100*dd.w/S.wt);
 var h='<div class="page-intro"><p class="eyebrow">YOUR DAILY RHYTHM</p><h1>Today</h1><p class="tip"><span class="eyebrow" style="display:inline">YOUR LOCAL DAY</span> · '+esc(nw.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}))+'<br>Small, steady steps across routines, rest and hydration.</p></div>';
 h+=questCard();
 h+='<div class="card"><b>Routine progress</b><div class="tip" style="margin-top:6px">'+bar(p,20)+' '+p+'%</div></div>';
 var sp=slp();if(sp)h+='<div class="card"><b>> SLEEP</b><div class="tip" style="margin-top:6px">Lights out '+sp.bed+', wake '+sp.wake+', plan '+sp.h.toFixed(1)+' hours</div><div class="row" style="margin-top:6px"><span class="tip">Last night (hours)</span><input type="number" step="0.5" id="sl" value="'+(dd.sl||"")+'" inputmode="decimal" style="width:90px"></div></div>';
 h+='<div class="card"><b>Water</b><div class="tip" style="margin-top:6px">'+bar(wp,20)+' '+dd.w+' / '+S.wt+' ml</div><div class="w"><button data-w="250">+250 ml</button><button data-w="100">+100 ml</button><button data-w="-250">−250 ml</button></div></div>';
 L.forEach(function(b,i){h+='<div class="card'+(dd.d[b.id]?' done':'')+(i===nx?' next':'')+'"><div class="row"><input type="checkbox" data-b="'+b.id+'"'+(dd.d[b.id]?' checked':'')+'><span class="t">'+esc(b.t)+'</span><span style="flex:1">'+esc(b.n)+'</span><span class="tip">'+(b.ml?"+"+b.ml+"ml ":"")+(IC[b.c]||"")+'</span></div>'+(Array.isArray(b.detail)&&b.detail.length?'<details class="routine-detail"><summary>Show skincare steps</summary><ol>'+b.detail.map(function(step){return'<li>'+esc(step)+'</li>'}).join('')+'</ol></details>':'')+(i===nx?'<div class="tip rd" style="margin-top:4px">&gt; next up</div>':'')+'</div>'});
 return h}
function week(){
 var h='<div class="page-intro"><p class="eyebrow">YOUR LAST SEVEN DAYS</p><h1>This week</h1></div>',tot=0,st=0,run=0,nm=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
 for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=key(d),p=pct(k),w=(S.days[k]||{w:0}).w;tot+=p;
  h+='<div class="card"><div class="row"><b>'+nm[d.getDay()]+' '+k.slice(5)+'</b><span class="tip">'+p+'%</span></div><div class="tip" style="margin-top:6px">'+bar(p,20)+'</div><div class="tip">water '+bar(Math.round(100*w/S.wt),10)+' '+w+'ml</div></div>'}
 for(i=0;i<60;i++){var d2=new Date();d2.setDate(d2.getDate()-i);if(pct(key(d2))>=70)run++;else if(i>0)break;else if(i===0)continue}
 return h+'<div class="card"><b>> SUMMARY</b><div class="tip" style="margin-top:6px">7-day average: '+Math.round(tot/7)+'%'+(function(){var t=0,n=0;for(var i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);var v=(S.days[key(d)]||{}).sl;if(v>0){t+=v;n++}}return n?'<br>Average sleep: '+(t/n).toFixed(1)+'h ('+n+' nights logged)':''})()+'<br>Streak of days at 70% or more: '+run+'</div></div>'}
function edit(){
 var h='<h1>Routine settings</h1><p class="tip">Change times, names or switch blocks off. Times before 06:00 count as after midnight.</p><div class="card"><span class="tip">Water target (ml)</span><input type="number" id="wt" value="'+S.wt+'" inputmode="numeric"></div><div class="card"><b>Shift the whole day</b><div class="tip">Moves every time earlier or later. Use it to move your sleep 15 minutes at a time.</div><button data-sh="-15">15 min earlier</button> <button data-sh="15">15 min later</button></div>';
 list().forEach(function(b){h+='<div class="card"><div class="row"><input type="checkbox" data-on="'+b.id+'"'+(b.on!==false?' checked':'')+'><input type="time" data-t="'+b.id+'" value="'+esc(b.t)+'" style="width:120px"><select data-d="'+b.id+'" style="width:110px"><option value="all"'+(!b.d?" selected":"")+'>Every day</option><option value="wk"'+(b.d==="wk"?" selected":"")+'>Mon-Fri</option><option value="we"'+(b.d==="we"?" selected":"")+'>Sat-Sun</option><option value="d1"'+(b.d==="d1"?" selected":"")+'>Mon only</option><option value="d0"'+(b.d==="d0"?" selected":"")+'>Sun only</option><option value="days:1,3,5,0"'+(b.d==="days:1,3,5,0"?" selected":"")+'>Mon/Wed/Fri/Sun</option><option value="days:2,4,6"'+(b.d==="days:2,4,6"?" selected":"")+'>Tue/Thu/Sat</option><option value="days:0,3"'+(b.d==="days:0,3"?" selected":"")+'>Wed/Sun</option><option value="m1"'+(b.d==="m1"?" selected":"")+'>Monthly (1st)</option></select><button data-x="'+b.id+'">[delete]</button></div><input type="text" data-n="'+b.id+'" value="'+esc(b.n)+'" style="margin-top:6px"></div>'});
 return h+'<button id="add">Add routine block</button> <button id="rs" class="tip">Reset routine</button><div class="card backup-card"><b>Back up your data</b><p class="tip">All three sections are stored in this browser. Export a combined backup before changing devices or restoring data.</p><button data-all="export">Download full backup</button> <button data-all="import">Restore full backup</button><input id="backupFile" type="file" accept="application/json" hidden></div>'}
function render(){var y=window.scrollY;document.getElementById("app").innerHTML=tab===1?today():tab===2?week():edit();window.scrollTo(0,y);bind();updateXPBadge()}
function bind(){var q=function(s){return document.querySelectorAll(s)};
 q("[data-b]").forEach(function(e){e.onchange=function(){var d=day(key()),b=S.r.filter(function(x){return x.id==e.dataset.b})[0];d.d[e.dataset.b]=e.checked?1:0;if(b&&b.ml)d.w=Math.max(0,d.w+(e.checked?1:-1)*b.ml);if(d.w>=S.wt)awardActionXP("water");if(e.checked)awardActionXP("routine",e.dataset.b);completeQuests();save();render()}});
 q("[data-w]").forEach(function(e){e.onclick=function(){var d=day(key());d.w=Math.max(0,d.w+(+e.dataset.w));if(d.w>=S.wt)awardActionXP("water");completeQuests();save();render()}});
 q("[data-on]").forEach(function(e){e.onchange=function(){S.r.forEach(function(b){if(b.id==e.dataset.on)b.on=e.checked});save()}});
 q("[data-t]").forEach(function(e){e.onchange=function(){S.r.forEach(function(b){if(b.id==e.dataset.t&&e.value)b.t=e.value});save();render()}});
 q("[data-d]").forEach(function(e){e.onchange=function(){S.r.forEach(function(b){if(b.id==e.dataset.d){if(e.value==="all")delete b.d;else b.d=e.value}});save()}});
 q("[data-n]").forEach(function(e){e.onchange=function(){S.r.forEach(function(b){if(b.id==e.dataset.n)b.n=e.value});save()}});
 q("[data-sh]").forEach(function(e){e.onclick=function(){S.r.forEach(function(b){var m=(mins(b.t)+(+e.dataset.sh)+1440)%1440;b.t=("0"+Math.floor(m/60)).slice(-2)+":"+("0"+m%60).slice(-2)});save();render()}});
 var sl=document.getElementById("sl");if(sl)sl.onchange=function(){day(key()).sl=+sl.value||0;if(+sl.value>0)awardActionXP("sleep");completeQuests();save();render()};
 q("[data-x]").forEach(function(e){e.onclick=function(){if(confirm("Delete this block?")){S.r=S.r.filter(function(b){return b.id!=e.dataset.x});save();render()}}});
 var a=document.getElementById("add");if(a)a.onclick=function(){var m=0;S.r.forEach(function(b){m=Math.max(m,b.id)});S.r.push({id:m+1,t:"12:00",n:"New block",c:"free"});save();render()};
 var r=document.getElementById("rs");if(r)r.onclick=function(){if(confirm("Reset the routine to the suggested one?")){S.r=JSON.parse(JSON.stringify(DEF));save();render()}};
 var w=document.getElementById("wt");if(w)w.onchange=function(){S.wt=Math.max(250,+w.value||2000);save()};
 q("[data-all]").forEach(function(e){e.onclick=function(){if(e.dataset.all==="export")exportAllData();else document.getElementById("backupFile").click()}});
 var bf=document.getElementById("backupFile");if(bf)bf.onchange=restoreAllData;
}
function exportAllData(){var stores={};["rt1","mp4","lift_redesign_v1"].forEach(function(k){stores[k]=localStorage.getItem(k)});var blob=new Blob([JSON.stringify({format:"RoutineHubBackup",version:1,createdAt:new Date().toISOString(),stores:stores},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="routinehub-backup-"+key()+".json";a.click();setTimeout(function(){URL.revokeObjectURL(url)},1000)}
function validRoutineBackup(x){if(!x||x.format!=="RoutineHubBackup"||x.version!==1||!x.stores)return false;try{["rt1","mp4","lift_redesign_v1"].forEach(function(k){if(!Object.prototype.hasOwnProperty.call(x.stores,k))throw Error()});if(typeof x.stores.rt1!=="string"||!x.stores.rt1||["mp4","lift_redesign_v1"].some(function(k){return x.stores[k]!==null&&(typeof x.stores[k]!=="string"||!x.stores[k])}))return false;var r=JSON.parse(x.stores.rt1),m=x.stores.mp4===null?null:JSON.parse(x.stores.mp4),l=x.stores.lift_redesign_v1===null?null:JSON.parse(x.stores.lift_redesign_v1);return r&&Array.isArray(r.r)&&r.days&&(x.stores.mp4===null||(m&&Array.isArray(m.plan)&&m.plan.length===14))&&(x.stores.lift_redesign_v1===null||(l&&l.logs&&typeof l.logs==="object"))}catch(e){return false}}
function restoreAllData(e){var f=e.target.files&&e.target.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){var x;try{x=JSON.parse(rd.result)}catch(err){}if(!validRoutineBackup(x)){alert("This is not a valid RoutineHub full backup.");e.target.value="";return}if(!confirm("Restore this backup? A backup of the current app data will download first.")){e.target.value="";return}exportAllData();try{["rt1","mp4","lift_redesign_v1"].forEach(function(k){if(x.stores[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,x.stores[k])});location.reload()}catch(err){alert("Restore could not finish because browser storage is unavailable. Your previous data backup was downloaded first.")}};rd.readAsText(f)}
function syncExistingRoutineQuest(){var rec=xpDay(),d=S.days[key()]||{d:{}};S.r.forEach(function(b){if(d.d&&d.d[b.id])rec.routines[String(b.id)]=true});completeQuests();save()}
function handleQuestMessage(event){if(event.origin!==window.location.origin||!event.data||event.data.type!=="routinehub:xp")return;var mealFrame=document.getElementById("mealsFrame"),liftFrame=document.getElementById("liftFrame"),ok=false;if(mealFrame&&event.source===mealFrame.contentWindow&&event.data.activity==="meal"&&Number.isInteger(event.data.slot)&&event.data.slot>=0&&event.data.slot<=3)ok=awardActionXP("meal",event.data.slot);else if(liftFrame&&event.source===liftFrame.contentWindow&&event.data.activity==="lift")ok=awardActionXP("lift");if(ok){completeQuests();save();updateXPBadge();if(activeSection==="today"&&tab===1)render()}}
function showHubTab(which){
 const m=document.getElementById("embedded-meals"),l=document.getElementById("embedded-lift"),routine=document.getElementById("routine-view");
 m.classList.remove("active");l.classList.remove("active");
 routine.hidden=which!=="routine";
 document.querySelectorAll("[data-section]").forEach(b=>{const selected=b.dataset.section===activeSection;b.classList.toggle("active",selected);b.setAttribute("aria-current",selected?"page":"false")});
 if(which==="meals")m.classList.add("active");else if(which==="lift")l.classList.add("active");
}
function showSection(section){
 activeSection=section;
 if(section==="today"||section==="week"||section==="edit"){
  tab=section==="today"?1:section==="week"?2:3;
  showHubTab("routine");render();
 }else if(section==="meals"||section==="lift")showHubTab(section);
}
document.querySelectorAll("[data-section]").forEach(b=>b.onclick=function(){showSection(b.dataset.section)});
var xpBadge=document.getElementById("xp-badge");if(xpBadge)xpBadge.onclick=function(){showSection("today")};
window.addEventListener("message",handleQuestMessage);
syncExistingRoutineQuest();
render();showSection("today");
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(function(){});

