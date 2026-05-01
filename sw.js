// ── AULA OS · Service Worker ──────────────────────────────────────────────────
// Versión: cambia este número cada vez que actualices los archivos
// para que el móvil descargue la versión nueva automáticamente.
const VERSION = 'aula-os-v1';

// Lista de todos los archivos que se guardan en el dispositivo para uso offline
const ARCHIVOS = [
  './',
  './PORTAL_DOCENTE.html',
  './autoavaliacion_alumnado.html',
  './avaliacion_oral.html',
  './caderno_docente.html',
  './caderno_tarefas.html',
  './carnes_lectores.html',
  './coevaluacion.html',
  './competencias_lomloe.html',
  './control_deberes.html',
  './control_saidas.html',
  './diario_aula.html',
  './diario_reflexion_docente.html',
  './importador_manual.html',
  './importador_programacion.html',
  './lectura_velocidade.html',
  './medidas_apoio.html',
  './medidor_ruido.html',
  './obradoiro_expresion.html',
  './obradoiro_problemas.html',
  './obxectivos_rubricas.html',
  './panel_clase.html',
  './planificador_semanal.html',
  './plano_aula.html',
  './problema_do_dia.html',
  './sistema_puntos.html',
  './temporizador_aula.html',
  './titoria.html',
  './votacion_aula.html',
  './xestor_adaptacions.html',
  './xestor_bbdd.html',
  './xestor_cooperativo.html',
  './manifest.json'
];

// ── INSTALACIÓN: descarga y guarda todos los archivos en el dispositivo ────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      console.log('[Aula OS] Instalando archivos offline...');
      return cache.addAll(ARCHIVOS);
    }).then(() => {
      console.log('[Aula OS] Instalación completa.');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVACIÓN: elimina versiones antiguas ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== VERSION)
          .map(key => {
            console.log('[Aula OS] Eliminando caché antigua:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── INTERCEPTAR PETICIONES: sirve desde el dispositivo, sin internet ──────────
self.addEventListener('fetch', event => {
  // Solo interceptamos peticiones del mismo origen (nuestros archivos)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Archivo encontrado en el dispositivo → lo sirve sin internet
        return cached;
      }
      // Si no está en caché, intenta la red (por si hay archivos nuevos)
      return fetch(event.request).catch(() => {
        // Sin internet y sin caché: muestra página de error amigable
        return new Response(
          `<!DOCTYPE html><html lang="gl"><head><meta charset="UTF-8">
          <title>Sin conexión</title>
          <style>body{font-family:sans-serif;text-align:center;padding:3rem;background:#080e1a;color:#eef2ff}
          h1{color:#fbbf24}p{color:rgba(238,242,255,.6)}</style></head>
          <body><h1>📡 Sen conexión</h1>
          <p>Este arquivo non está gardado no dispositivo.<br>
          Conéctate a internet unha vez para descargalo.</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      });
    })
  );
});
