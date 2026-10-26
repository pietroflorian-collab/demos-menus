import { escapeHTML, formatPrice } from './api.js';

export const UIEditorial = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale-[50%]' : '';
    const precioFormatted = formatPrice(item.precio);
    const imgUrl = item.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200';

    // Extraer etiqueta si existe
    let tagHTML = '';
    if (item.etiquetas && item.etiquetas.length > 0) {
      tagHTML = `<span class="italic text-primary/90 font-display text-[13px]">(${escapeHTML(item.etiquetas[0])})</span>`;
    }

    // Botón de acción (Añadir para cliente / Editar para admin)
    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `<button onclick="window.abrirEditorAdmin('${item.id}')" class="w-7 h-7 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white flex items-center justify-center transition-all text-sm font-semibold">E</button>`;
    } else {
      actionBtn = `
        <button data-action="add-to-cart" data-id="${item.id}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-7 h-7 border ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-800 text-gray-800 hover:bg-primary hover:border-primary hover:text-white'} flex items-center justify-center transition-all text-sm font-semibold">
          ${isSelected ? '✓' : '+'}
        </button>
      `;
    }

    return `
      <article class="w-full py-6 border-b border-[#ddc0bf] flex items-start gap-4 md:gap-6 group transition-colors ${adminStyles}">
        <!-- Imagen miniatura de 80x80 -->
        <div class="w-[80px] h-[80px] min-w-[80px] min-h-[80px] border border-[#ddc0bf] bg-[#f3ede8] overflow-hidden relative">
          <img alt="${escapeHTML(item.nombre)}" class="w-full h-full object-cover rounded-none" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'" />
        </div>
        
        <div class="flex-1 flex flex-col min-w-0">
          <div class="flex items-baseline w-full gap-2">
            <h3 class="font-display text-lg text-gray-900 tracking-tight whitespace-nowrap">
              ${escapeHTML(item.nombre)}
            </h3>
            <span class="flex-1 border-b border-dotted border-gray-400 mb-1 mx-2 min-w-[20px] opacity-60"></span>
            <div class="flex items-center gap-3 whitespace-nowrap">
              <span class="font-body text-lg text-primary font-bold tabular-nums">
                ${precioFormatted}
              </span>
              ${actionBtn}
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-1 leading-relaxed">
            ${escapeHTML(item.descripcion || '')} ${tagHTML}
          </p>
        </div>
      </article>
    `;
  }
};