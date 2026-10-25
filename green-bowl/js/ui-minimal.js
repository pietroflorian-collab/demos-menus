import { escapeHTML, formatPrice } from './api.js';

export const UIMinimal = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const isSelected = currentSelection.some(i => i.id === item.id);
    
    // Si el plato está pausado (en admin), lo mostramos con opacidad
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-60 grayscale-[40%]' : '';
    
    // Formatear precio (manejando si viene como string o número)
    const precioFormatted = formatPrice(item.precio);
    
    // Etiquetas (Favorito del Chef, Vegano, etc.)
    let tagHTML = '';
    if (item.etiquetas && item.etiquetas.length > 0) {
      const tag = item.etiquetas[0]; // Tomamos la primera etiqueta
      tagHTML = `<span class="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-primary px-3 py-1 rounded-full shadow-sm">${escapeHTML(tag)}</span>`;
    }

    // Imagen con fallback
    const imgUrl = item.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

    // Botón de acción (Añadir para cliente / Editar para admin)
    let actionBtn = '';
    if (rol === 'admin') {
      actionBtn = `
        <button onclick="window.abrirEditorAdmin('${item.id}')" class="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          <span>Editar</span>
        </button>
      `;
    } else {
      actionBtn = `
        <button onclick="window.toggleSelection('${item.id}', '${escapeHTML(item.nombre).replace(/'/g, "\\'")}')" class="flex items-center gap-2 ${isSelected ? 'bg-wasabi-green text-surface' : 'bg-secondary text-on-secondary'} px-4 py-2 rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">${isSelected ? 'check' : 'add'}</span>
          <span>${isSelected ? 'Agregado' : 'Añadir'}</span>
        </button>
      `;
    }

    return `
      <article class="group ${adminStyles} bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        <div class="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
          <img alt="${escapeHTML(item.nombre)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" src="${escapeHTML(imgUrl)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'"/>
          ${tagHTML}
        </div>
        <div class="p-5 flex flex-col flex-grow justify-between bg-surface-container-lowest">
          <div>
            <h3 class="font-headline-md text-headline-md text-primary group-hover:text-secondary transition-colors line-clamp-1">
              ${escapeHTML(item.nombre)}
            </h3>
            <p class="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed line-clamp-2">
              ${escapeHTML(item.descripcion || '')}
            </p>
          </div>
          <div class="flex items-center justify-between mt-6 pt-2">
            <span class="font-headline-md text-headline-md text-primary">${precioFormatted}</span>
            ${actionBtn}
          </div>
        </div>
      </article>
    `;
  }
};