const CACHE='academic-writing-workbench-v7';
const FILES=['./','index.html','assets/styles.css','assets/main.js','assets/config.js','assets/diagnostics.js','assets/source_tools.js','assets/tools.js','assets/problems_1.js','assets/problems_2.js','assets/problems_3.js','assets/problems_4.js','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
