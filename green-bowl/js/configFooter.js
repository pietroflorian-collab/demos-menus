export const datosEstablecimiento = {
    nombre: "Green Bowl",
    correoPQR: "hola@greenbowl.com",
    desarrollador: "Pietro Florian Galea",
    whatsappDev: "+573025303152",
    urlSIC: "https://www.sic.gov.co/"
};

export const footerHTML = `
<footer class="bg-white text-gray-500 font-sans mt-auto border-t border-gray-200">
  <div class="flex flex-col md:flex-row flex-wrap justify-between items-start px-5 md:px-12 py-8 max-w-7xl mx-auto gap-8">

    <div class="flex flex-col mb-4 md:mb-0 w-full md:w-auto">
      <div class="text-xl font-bold text-gray-900 mb-2">${datosEstablecimiento.nombre}</div>
      <div class="text-sm">© 2026 ${datosEstablecimiento.nombre}. Todos los Derechos Reservados.</div>
    </div>

    <div class="flex flex-col w-full md:w-auto">
      <h4 class="text-sm font-bold text-gray-900 mb-3">Atención al Cliente</h4>
      <a href="mailto:${datosEstablecimiento.correoPQR}" class="text-sm hover:text-blue-600 transition-colors mb-1">${datosEstablecimiento.correoPQR}</a>
      <span class="text-xs mt-1">Respuesta PQR: máx. 15 días hábiles</span>
    </div>

    <div class="flex flex-col w-full md:w-auto">
      <h4 class="text-sm font-bold text-gray-900 mb-3">Información Legal</h4>
      <a href="terminos.html" class="text-sm hover:text-blue-600 transition-colors mb-2">Términos y Condiciones</a>
      <a href="privacidad.html" class="text-sm hover:text-blue-600 transition-colors mb-2">Política de Privacidad</a>
      <a href="${datosEstablecimiento.urlSIC}" target="_blank" rel="noopener noreferrer" class="text-sm hover:text-blue-600 transition-colors">Superintendencia (SIC)</a>
    </div>
  </div>

  <div class="border-t border-gray-200 py-4 text-center text-xs text-gray-400 px-5">
    Desarrollado por ${datosEstablecimiento.desarrollador} | <a href="https://wa.me/${datosEstablecimiento.whatsappDev}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 underline transition-colors">WhatsApp: ${datosEstablecimiento.whatsappDev}</a>
  </div>
</footer>
`;