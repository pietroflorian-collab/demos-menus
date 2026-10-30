import { escapeHTML, formatPrice } from './api.js';

export const UIEditorial = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale' : '';
    const precioFormatted = formatPrice(item.precio);
    const imgUrl = item.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200';

    let tagHTML = '';
    if (item.etiquetas && item.etiquetas.length > 0) {
      tagHTML = `<span class="italic text-[#6c131c]/90 font-display text-[13px] ml-1">(${escapeHTML(item.etiquetas[0])})</span>`;
    }

    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `
        <div class="flex items-center gap-1.5 ml-4">
          <button data-action="edit" data-id="${item.id}" class="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-[#6c131c] hover:text-[#6c131c] transition-colors" title="Editar">
            <span class="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button data-action="toggle-pause" data-id="${item.id}" class="w-8 h-8 flex items-center justify-center border ${isPausado ? 'border-green-600 text-green-600' : 'border-gray-300 hover:border-gray-800'} transition-colors" title="${isPausado ? 'Reactivar' : 'Pausar'}">
            <span class="material-symbols-outlined text-[16px]">${isPausado ? 'play_arrow' : 'pause'}</span>
          </button>
          <button data-action="delete" data-id="${item.id}" class="w-8 h-8 flex items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-colors" title="Eliminar">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      `;
    } else {
      actionBtn = `
        <button data-action="add-to-cart" data-id="${item.id}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-7 h-7 border ${isSelected ? 'border-[#6c131c] bg-[#6c131c] text-white' : 'border-gray-800 text-gray-800 hover:bg-[#6c131c] hover:border-[#6c131c] hover:text-white'} flex items-center justify-center transition-all text-sm font-semibold ml-4">
          ${isSelected ? '✓' : '+'}
        </button>
      `;
    }

    return `
      <article class="w-full py-5 border-b border-[#ddc0bf] flex flex-col md:flex-row md:items-start gap-4 group transition-colors ${adminStyles}">
        <!-- Imagen miniatura -->
        <div class="w-[80px] h-[80px] min-w-[80px] min-h-[80px] border border-[#ddc0bf] bg-[#f3ede8] overflow-hidden relative shrink-0">
          <img alt="${escapeHTML(item.nombre)}" class="w-full h-full object-cover rounded-none" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'" />
        </div>
        
        <div class="flex-1 flex flex-col min-w-0 w-full">
          <div class="flex flex-col md:flex-row md:items-baseline w-full gap-2">
            <div class="flex items-baseline flex-1">
              <h3 class="font-display text-lg text-gray-900 tracking-tight whitespace-nowrap">
                ${escapeHTML(item.nombre)}
              </h3>
              <span class="flex-1 border-b border-dotted border-gray-400 mb-1 mx-2 min-w-[20px] opacity-60"></span>
            </div>
            <div class="flex items-center justify-between md:justify-end gap-3 whitespace-nowrap mt-2 md:mt-0">
              <span class="font-body text-lg text-[#6c131c] font-bold tabular-nums">
                ${precioFormatted}
              </span>
              ${rol === 'admin' ? actionBtn : `<div class="ml-2">${actionBtn}</div>`}
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2 leading-relaxed">
            ${escapeHTML(item.descripcion || '')} ${tagHTML}
          </p>
        </div>
      </article>
    `;
  }
};