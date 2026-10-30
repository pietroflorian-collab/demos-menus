import { escapeHTML, formatPrice } from './api.js';

export const UISakura = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    
    // Estilos para el admin si el plato está pausado
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale' : '';
    const precioFormatted = formatPrice(item.precio);
    
    // Etiquetas
    let tagHTML = '';
    if (item.etiquetas && item.etiquetas.length > 0) {
      tagHTML = `<span class="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10 uppercase tracking-widest">${escapeHTML(item.etiquetas[0])}</span>`;
    }

    // Imagen
    const imgUrl = item.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

    // Botones según el Rol
    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `
        <div class="flex items-center gap-2 mt-4">
          <button data-action="edit" data-id="${item.id}" class="flex-1 flex items-center justify-center gap-1.5 bg-[#AD2020] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[16px]">edit</span> Editar
          </button>
          <button data-action="toggle-pause" data-id="${item.id}" class="flex items-center justify-center p-2 rounded-lg ${isPausado ? 'bg-[#ACC677] text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors" title="${isPausado ? 'Reactivar' : 'Pausar'}">
            <span class="material-symbols-outlined text-[18px]">${isPausado ? 'play_arrow' : 'pause'}</span>
          </button>
          <button data-action="delete" data-id="${item.id}" class="flex items-center justify-center p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors" title="Eliminar">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `;
    } else {
      actionBtn = `
        <button data-action="add-to-cart" data-id="${item.id}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-[#ACC677] text-black font-bold shadow-md' : 'bg-[#AD2020]/10 text-[#AD2020] hover:bg-[#AD2020]/20'}" title="Agregar">
          <span class="material-symbols-outlined pointer-events-none">${isSelected ? 'check' : 'add'}</span>
        </button>
      `;
    }

    // Tarjeta Escritorio (Horizontal) y Móvil (Vertical)
    return `
      <article class="group ${adminStyles} bg-[#121212] rounded-xl border border-[#5b403e]/50 overflow-hidden flex flex-col sm:flex-row transition-all duration-300 relative hover:border-[#AD2020]/50 shadow-lg">
        
        <!-- Imagen -->
        <div class="relative sm:w-2/5 w-full aspect-[4/3] sm:aspect-auto sm:min-h-[220px] bg-[#1a1a1a] overflow-hidden shrink-0">
          <img alt="${escapeHTML(item.nombre)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'"/>
          ${tagHTML}
        </div>
        
        <!-- Contenido -->
        <div class="p-5 flex flex-col flex-grow justify-between bg-[#121212]">
          <div>
            <div class="text-[10px] font-bold text-[#ACC677] uppercase tracking-widest mb-1">
              ${escapeHTML(item.categoria || 'General')}
            </div>
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="text-xl font-bold text-white group-hover:text-[#AD2020] transition-colors leading-tight">
                ${escapeHTML(item.nombre)}
              </h3>
              <div class="bg-[#1f1f1f] px-3 py-1 rounded-full text-sm font-bold text-white border border-[#5b403e]/50 shrink-0">
                ${precioFormatted}
              </div>
            </div>
            
            <p class="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-3">
              ${escapeHTML(item.descripcion || '')}
            </p>
          </div>
          
          ${rol === 'admin' ? actionBtn : `
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-[#5b403e]/30">
              <span class="text-xs text-gray-500 italic">Foto referencial</span>
              ${actionBtn}
            </div>
          `}
        </div>
      </article>
    `;
  }
};