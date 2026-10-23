import { showToast } from './api.js';

export const AuthManager = {
  currentUser: { uid: 'demo_user', email: 'demo@tuagencia.com' }, 
  userRole: 'administrador', // Forzamos el rol más alto para que pueda probar todo

  init(onSuccessCallback) {
    // Ocultamos el overlay de login inmediatamente
    const loginOverlay = document.getElementById('login-overlay');
    const adminLayout = document.getElementById('admin-layout');
    
    if (loginOverlay) loginOverlay.classList.add('hidden'); 
    if (adminLayout) adminLayout.classList.remove('hidden'); 
    
    // Ejecutamos el inicializador del panel administrativo
    if (onSuccessCallback) onSuccessCallback(); 
    
    // Mostramos un mensaje de bienvenida a la demo
    setTimeout(() => {
      showToast("¡Bienvenido al Modo Demo! Los cambios no se guardarán en el servidor real.", "info");
    }, 1000);
  },

  logout() { 
    showToast("Saliendo de la demo...", "info");
    setTimeout(() => window.location.reload(), 1000);
  },

  async registrarEmpleado(email, pass, rolAsignado) {
    showToast("En modo Demo no se pueden crear usuarios reales.", "error");
    return false; 
  }
};