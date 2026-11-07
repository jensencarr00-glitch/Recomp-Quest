const CACHE="routinehub-static-v2";
const FILES=["./","./index.html","./routine.css","./routine.js","./meals.html","./lift.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.delete("routinehub-single-v1").then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html"))));
});
