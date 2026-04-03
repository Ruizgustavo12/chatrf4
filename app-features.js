// app-features.js — Cargador de módulos de funcionalidad
// Se importa dinámicamente desde app-core.js después del DOMContentLoaded
// Los módulos se cargan en cadena para respetar dependencias

import('./features-stories.js')
  .then(() => import('./features-feed.js'))
  .then(() => import('./features-profile.js'))
  .then(() => import('./features-social.js'))
  .then(() => {
    // Todos los módulos cargados — disparar init si todavía no corrió
    if(typeof window._appReadyCallbacks === 'function') window._appReadyCallbacks();
  })
  .catch(e => console.error('[MiLatido] Error cargando módulos:', e));
