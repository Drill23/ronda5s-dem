// Guarda o app no aparelho para abrir sem internet.
// Ao atualizar o index.html, troque a versão abaixo (v1 -> v2) para os celulares baixarem a nova.
const VERSAO = 'ronda5s-dem-v2';
const PREFIXO = 'ronda5s-dem-';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // limpa só os caches deste app (nunca os de outros apps no mesmo domínio)
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIXO) && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request).then(resp => {
      if (resp.ok && new URL(e.request.url).origin === location.origin) {
        const cp = resp.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp));
      }
      return resp;
    }).catch(() => caches.match('./index.html').then(r2 => r2 || Response.error())))
  );
});
