import { escapeHTML, formatPrice } from './api.js';

export const UIMinimal = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    
    // Estilos para el admin si el plato está pausado
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale' : '';
    const precioFormatted = formatPrice(item.precio);
    
    // Etiquetas
    let tagHTML = '';
    if (item.etiquetas && item.etiquetas.length > 0) {
      tagHTML = `<span class="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-xs font-semibold text-gray-800 px-3 py-1 rounded-full shadow-sm">${escapeHTML(item.etiquetas[0])}</span>`;
    } else if (item.texto_promo && rol !== 'admin') {
      tagHTML = `<span class="absolute top-4 left-4 bg-[#005ab7]/90 backdrop-blur-md text-xs font-semibold text-white px-3 py-1 rounded-full shadow-sm">${escapeHTML(item.texto_promo)}</span>`;
    }

    // Imagen con fallback
    const imgUrl = item.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

    // Botones de acción según el Rol
    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `
        <div class="flex items-center gap-2 mt-4">
          <button data-action="edit" data-id="${item.id}" class="flex-1 flex items-center justify-center gap-1.5 bg-[#005ab7] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[16px]">edit</span> Editar
          </button>
          <button data-action="toggle-pause" data-id="${item.id}" class="flex items-center justify-center p-2 rounded-lg ${isPausado ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors" title="${isPausado ? 'Reactivar' : 'Pausar'}">
            <span class="material-symbols-outlined text-[18px]">${isPausado ? 'play_arrow' : 'pause'}</span>
          </button>
          <button data-action="delete" data-id="${item.id}" class="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Eliminar">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `;
    } else {
      actionBtn = `
        <button data-action="add-to-cart" data-id="${item.id}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="flex items-center gap-2 ${isSelected ? 'bg-green-600 text-white' : 'bg-[#005ab7] text-white'} px-4 py-2 rounded-full font-medium text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">${isSelected ? 'check' : 'add'}</span>
          <span>${isSelected ? 'Agregado' : 'Añadir'}</span>
        </button>
      `;
    }

    return `
      <article class="group ${adminStyles} bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        <div class="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <img alt="${escapeHTML(item.nombre)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'"/>
          ${tagHTML}
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <div class="flex-grow">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-[#005ab7] transition-colors line-clamp-1">
              ${escapeHTML(item.nombre)}
            </h3>
            <p class="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">
              ${escapeHTML(item.descripcion || '')}
            </p>
          </div>
          
          ${rol === 'admin' ? actionBtn : `
            <div class="flex items-center justify-between mt-6 pt-2">
              <span class="text-lg font-bold text-gray-900">${precioFormatted}</span>
              ${actionBtn}
            </div>
          `}
        </div>
      </article>
    `;
  }
};