import { escapeHTML, formatPrice } from './api.js';

export const UIMinimal = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    const isPicante = String(item.es_picante).toLowerCase() === "true";
    const hasPromo = item.texto_promo && item.texto_promo.trim() !== "";
    
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale' : '';
    const precioFormatted = formatPrice(item.precio);
    const imgUrl = item.imagen_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';

    // Etiqueta de promoción
    let promoTagHTML = '';
    if (hasPromo) {
      promoTagHTML = `<span class="absolute top-4 left-4 bg-primary-light text-primary text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10">${escapeHTML(item.texto_promo)}</span>`;
    }

    // Etiqueta de picante
    let picanteHTML = '';
    if (isPicante) {
      picanteHTML = `
        <div class="flex items-center gap-1 text-red-500 font-semibold text-[11px] mt-1 bg-red-50 w-fit px-2 py-0.5 rounded-md">
          <span class="material-symbols-outlined text-[14px]">local_fire_department</span> Picante
        </div>
      `;
    }

    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `
        <div class="flex items-center gap-2 mt-4 w-full">
          <button data-action="edit" data-id="${item.id}" class="flex-1 flex items-center justify-center gap-1 bg-[#005ab7] text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm">
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
        <button data-action="add-to-cart" data-id="${item.id}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-10 h-10 rounded-full ${isSelected ? 'bg-green-600' : 'bg-primary'} text-white flex items-center justify-center shadow-md hover:bg-green-800 hover:scale-105 transition-all absolute bottom-5 right-5 z-20">
          <span class="material-symbols-outlined text-xl">${isSelected ? 'check' : 'add'}</span>
        </button>
      `;
    }

    return `
      <article class="group ${adminStyles} bg-white rounded-[32px] p-5 flex flex-col items-center text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 relative">
        
        ${promoTagHTML}

        <!-- Imagen Circular -->
        <div class="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-bg-main group-hover:border-primary-light transition-colors relative z-10">
          <img alt="${escapeHTML(item.nombre)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'"/>
        </div>
        
        <div class="flex flex-col flex-grow w-full relative">
          <div class="flex-grow">
            <h3 class="text-[15px] font-bold text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[40px]">${escapeHTML(item.nombre)}</h3>
            <p class="text-lg font-extrabold text-primary mb-2">${precioFormatted}</p>
            ${picanteHTML}
            
            <p class="text-[11px] text-gray-500 mt-2 leading-relaxed line-clamp-2">
              ${escapeHTML(item.descripcion || '')}
            </p>
          </div>
          
          ${rol === 'admin' ? actionBtn : ''}
        </div>
        ${rol !== 'admin' ? actionBtn : ''}
      </article>
    `;
  }
};