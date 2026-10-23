export const AppConfig = {
  // 1. DATOS DE IDENTIDAD — CLIENTE DE PRUEBA
  cliente: {
    nombre: "MENÚ TEST",
    eslogan: "PRUEBA DE CIRCUITO",
    descripcionComercial: "Cliente de prueba para verificar el motor de apariencia.",
    whatsappCliente: "+573000000000",
    correoPQR: "test@test.com",
    direccionLegal: "Calle Falsa 123",
    representanteLegal: "Test User",
    documentoIdentidad: "CC 12345678",
    declaracionTributaria: "No Responsable del INC ni del IVA",
    desarrollador: "Pietro Florian Galea",
    whatsappDev: "+573000000000"
  },

  // 2. FIREBASE — Reuso cuentas-cop (el menú público NO lee Firebase)
  firebase: {
    apiKey: "AIzaSyBhfhusKZVL-CkRfUSOLh4W2vjQ_nENmLI",
    authDomain: "cuentas-cop.firebaseapp.com",
    projectId: "cuentas-cop",
    storageBucket: "cuentas-cop.firebasestorage.app",
    messagingSenderId: "1011727605611",
    appId: "1:1011727605611:web:1ad9eafe3807627907762e"
  },

  // 3. URLs — apuntan al cliente de prueba
  urls: {
    produccion: "https://menu-test-code.pages.dev",
    recursosCdn: "https://menu-test-assets.pages.dev",
    instagram: "",
    facebook: "",
    tiktok: "",
    enteRegulador: "https://www.sic.gov.co/"
  },

  // 4. GITHUB — repo de assets del cliente de prueba
  github: {
    repoPath: "pietrofloriano23/menu-test-assets"
  },

  // 5. UI
  ui: {
    app_prefix: "menutest_v1",
    colores_canvas: {
      fondo_lienzo: "#0a0a0a",
      fondo_qr_box: "#FFFFFF",
      qr_oscuro: "#000000",
      qr_claro: "#FFFFFF",
      texto_etiqueta: "#FFFFFF"
    }
  }
};
