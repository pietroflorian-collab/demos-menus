export const datosEstablecimiento = {
    nombre: "LA TRATTORIA",
    correoPQR: "hola@latrattoria.com",
    desarrollador: "Tu Agencia de Desarrollo",
    whatsappDev: "+573000000000",
    urlSIC: "https://www.sic.gov.co/"
};

export const footerHTML = `
<footer class="w-full bg-[#F4F1EA] border-t border-[#D6CDBF]">
  <div class="max-w-[1040px] mx-auto px-6 py-12">
    <div class="border-t border-b border-[#D6CDBF] py-8 my-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div class="space-y-2">
          <p class="text-xs uppercase text-primary tracking-[0.15em] font-bold">Ubicación</p>
          <p class="text-sm text-gray-800">${datosEstablecimiento.nombre}</p>
          <p class="text-xs text-gray-600">${datosEstablecimiento.correoPQR}</p>
        </div>
        <div class="space-y-2 text-center">
          <p class="font-display text-lg text-gray-900 uppercase tracking-[0.15em]">${datosEstablecimiento.nombre}</p>
          <p class="text-xs text-gray-600 italic max-w-xs mx-auto leading-relaxed">“Cucina di memoria, olio toscano frantoio a freddo e rispetto devoto per la stagionalità.”</p>
        </div>
        <div class="space-y-2 md:text-right">
          <p class="text-xs uppercase text-primary tracking-[0.15em] font-bold">Atención al Cliente</p>
          <a href="mailto:${datosEstablecimiento.correoPQR}" class="text-sm text-gray-800 hover:text-primary transition-colors block">${datosEstablecimiento.correoPQR}</a>
        </div>
      </div>
    </div>
    <div class="pt-4 flex flex-col md:flex-row items-center justify-between text-gray-500 text-[11px] uppercase tracking-[0.12em] gap-4">
      <p>© ${new Date().getFullYear()} ${datosEstablecimiento.nombre}. Todos los derechos reservados.</p>
      <div class="flex items-center gap-4">
        <a href="terminos.html" class="hover:text-primary transition-colors">Términos y Condiciones</a>
        <span class="text-[#D6CDBF]">|</span>
        <a href="privacidad.html" class="hover:text-primary transition-colors">Política de Privacidad</a>
      </div>
    </div>
  </div>
</footer>
`;