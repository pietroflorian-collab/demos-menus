import { escapeHTML, formatPrice } from './api.js';

export const UIMinimal = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    const isPicante = String(item.es_picante).toLowerCase() === "true";
    const hasPromo = item.texto_promo && item.texto_promo.trim() !== "";
    
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale' : '';
    const precioFormatted = formatPrice(item.precio);
    const imgUrl = item.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

    // Etiqueta de promoción (Solo si hay texto)
    let promoTagHTML = '';
    if (hasPromo) {
      promoTagHTML = `<span class="absolute top-4 left-4 bg-[#005ab7] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm z-10">${escapeHTML(item.texto_promo)}</span>`;
    }

    // Etiqueta de picante
    let picanteHTML = '';
    if (isPicante) {
      picanteHTML = `
        <div class="flex items-center gap-1 text-red-500 font-semibold text-xs mt-1">
          <span class="material-symbols-outlined text-[14px]">local_fire_department</span> Picante
        </div>
      `;
    }

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
      <article class="group ${adminStyles} bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        
        <div class="relative w-full aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-100">
          <img alt="${escapeHTML(item.nombre)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'"/>
          ${promoTagHTML}
        </div>
        
        <div class="p-5 flex flex-col flex-grow bg-white">
          <div class="flex-grow">
            <div class="text-[11px] font-bold text-[#005ab7] uppercase tracking-widest mb-1.5">
              ${escapeHTML(item.categoria || 'General')}
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-[#005ab7] transition-colors line-clamp-1">
              ${escapeHTML(item.nombre)}
            </h3>
            
            <p class="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">
              ${escapeHTML(item.descripcion || '')}
            </p>
            ${picanteHTML}
          </div>
          
          ${rol === 'admin' ? actionBtn : `
            <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <span class="text-xl font-bold text-gray-900">${precioFormatted}</span>
              ${actionBtn}
            </div>
          `}
        </div>
      </article>
    `;
  }
};