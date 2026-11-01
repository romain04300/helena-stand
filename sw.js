// Mémoire hors connexion de l'appli Hélèna Fuma
const CACHE = "helena-stand-v5";
const FICHIERS = [
  "./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest",
  "./logo-rond.png", "./branchage.png",
  "./icone-192.png", "./icone-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Les polices Google : on les garde en mémoire dès la première fois
  if (url.host.includes("fonts.googleapis.com") || url.host.includes("fonts.gstatic.com")) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(rep => {
        const copie = rep.clone();
        caches.open(CACHE).then(c => c.put(e.request, copie));
        return rep;
      }).catch(() => new Response("", { status: 503 })))
    );
    return;
  }
  // Les fichiers de l'appli : réseau d'abord (mises à jour), sinon la mémoire
  e.respondWith(
    fetch(e.request).then(rep => {
      const copie = rep.clone();
      caches.open(CACHE).then(c => c.put(e.request, copie));
      return rep;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
