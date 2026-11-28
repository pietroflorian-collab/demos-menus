import { escapeHTML, formatPrice } from './api.js';

export const UISakura = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);

    const adminStyles = rol === 'admin' && isPausado ? 'opacity-50 grayscale' : '';
    const precioFormatted = formatPrice(item.precio);

    let tagHTML = '';
    if (item.etiquetas && item.etiquetas.length > 0) {
      tagHTML = `<span class="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10 uppercase tracking-widest">${escapeHTML(item.etiquetas[0])}</span>`;
    }

    const fallbackUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
    const imgUrl = (item.imagen_url && String(item.imagen_url).trim() !== '') ? item.imagen_url.trim() : fallbackUrl;

    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `
        <div class="flex items-center gap-2 mt-2">
          <button data-action="edit" data-id="${item.id}" class="flex-1 flex items-center justify-center gap-1.5 bg-[#AD2020] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[14px]">edit</span> Editar
          </button>
          <button data-action="toggle-pause" data-id="${item.id}" class="flex items-center justify-center p-1.5 rounded-lg ${isPausado ? 'bg-[#ACC677] text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors">
            <span class="material-symbols-outlined text-[16px]">${isPausado ? 'play_arrow' : 'pause'}</span>
          </button>
          <button data-action="delete" data-id="${item.id}" class="flex items-center justify-center p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      `;
    } else {
      actionBtn = `
        <button data-action="add-to-cart" data-id="${item.id}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-[#ACC677] text-black font-bold shadow-md' : 'bg-[#AD2020]/10 text-[#AD2020] hover:bg-[#AD2020]/20'}" title="Agregar">
          <span class="material-symbols-outlined text-lg pointer-events-none">${isSelected ? 'check' : 'add'}</span>
        </button>
      `;
    }

    return `
      <!-- Tarjeta Compacta -->
      <article class="neon-border group ${adminStyles} bg-[#121212] overflow-hidden flex flex-col sm:flex-row transition-all duration-300 relative h-full">
        
        <!-- Imagen -->
        <div class="relative w-full h-40 sm:h-auto sm:w-2/5 bg-[#1a1a1a] overflow-hidden shrink-0">
          <img alt="${escapeHTML(item.nombre)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHTML(imgUrl)}" onerror="this.onerror=null;this.src='${fallbackUrl}';"/>
          ${tagHTML}
        </div>
        
        <!-- Textos -->
        <div class="p-3 sm:p-4 flex flex-col flex-grow justify-between bg-[#121212]">
          <div>
            <div class="text-[9px] font-bold text-[#ACC677] uppercase tracking-widest mb-1">
              ${escapeHTML(item.categoria || 'General')}
            </div>
            
            <div class="flex items-start justify-between gap-2 mb-1">
              <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-[#AD2020] transition-colors leading-tight line-clamp-1">
                ${escapeHTML(item.nombre)}
              </h3>
              <div class="bg-[#1f1f1f] px-2 py-0.5 rounded-full text-xs font-bold text-white border border-[#5b403e]/50 shrink-0">
                ${precioFormatted}
              </div>
            </div>
            
            <p class="text-[12px] sm:text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-3">
              ${escapeHTML(item.descripcion || '')}
            </p>
          </div>
          
          ${rol === 'admin' ? actionBtn : `
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#5b403e]/30">
              <span class="text-[10px] text-gray-500 italic">Foto referencial</span>
              ${actionBtn}
            </div>
          `}
        </div>
      </article>
    `;
  }
};