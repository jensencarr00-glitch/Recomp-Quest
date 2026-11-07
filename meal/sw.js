var C="mealprep-v17",F=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){e.respondWith(fetch(e.request).then(function(r){var c2=r.clone();caches.open(C).then(function(c){c.put(e.request,c2)});return r}).catch(function(){return caches.match(e.request)}))});
