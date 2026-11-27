﻿import { MenuAPI, escapeHTML, showToast } from './api.js';
import { UIMinimal } from './ui-minimal.js';

const GreenBowlMenu = {
  allItems: [], 
  categoriesList: [], 
  config: {}, 
  selectedCategory: "", 
  STORAGE_KEY: "greenbowl_order_selection",

  getSelection() { 
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; } 
    catch (e) { return []; } 
  },
  
  saveSelection(list) { 
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list)); 
    this.updateUI(); 
  },
  
  toggleSelection(itemId, itemNombre) { 
    let list = this.getSelection(); 
    const index = list.findIndex(i => i.id === itemId); 
    if (index >= 0) list.splice(index, 1); 
    else list.push({ id: itemId, nombre: itemNombre, cantidad: 1 }); 
    this.saveSelection(list); 
    this.renderMenu(); 
  },
  
  updateQuantity(itemId, delta) { 
    let list = this.getSelection(); 
    const item = list.find(i => i.id === itemId); 
    if (item) { 
      item.cantidad += delta; 
      if (item.cantidad <= 0) list = list.filter(i => i.id !== itemId); 
      this.saveSelection(list); 
      this.renderMenu(); 
    } 
  },
  
  clearList() { 
    localStorage.removeItem(this.STORAGE_KEY); 
    this.updateUI(); 
    this.renderMenu(); 
  },
  
  openModal() { 
    const modal = document.getElementById("order-modal");
    if (modal) {
      modal.classList.remove("hidden");
      setTimeout(() => {
        modal.classList.add("modal-enter");
      }, 10);
    }
  },
  
  closeModal() { 
    const modal = document.getElementById("order-modal");
    if (modal) {
      modal.classList.remove("modal-enter");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  },

  aplicarTema(tema) {
    if (!tema) return;
    const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const val = (v) => { if (!v) return null; const s = String(v).trim(); return HEX.test(s) ? s : null; };

    const colorPrimario = val(tema.colorPrimario);
    const colorFondo = val(tema.colorFondo);
    
    if (colorPrimario || colorFondo) {
      let styleEl = document.getElementById('dynamic-theme');
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-theme'; document.head.appendChild(styleEl); }
      let css = ':root {\n';
      if (colorPrimario) css += `  --color-primary: ${colorPrimario};\n`; 
      if (colorFondo) css += `  --color-surface: ${colorFondo};\n`; 
      css += '}';
      styleEl.textContent = css;
    }
    
    if (tema.fuenteHeroEslogan) {
      document.getElementById('brand-slogan').style.fontFamily = `'${tema.fuenteHeroEslogan}', sans-serif`;
    }
  },

  updateUI() {
    const list = this.getSelection(); 
    const totalCount = list.reduce((acc, curr) => acc + curr.cantidad, 0); 
    const fabContainer = document.getElementById("fab-container");
    
    // Calcular el precio total del pedido
    let totalPrecio = 0;
    list.forEach(item => {
      const platoInfo = this.allItems.find(p => p.id === item.id);
      if(platoInfo) totalPrecio += (platoInfo.precio * item.cantidad);
    });

    // Actualizar botón flotante
    if (totalCount > 0 && fabContainer) { 
      fabContainer.classList.remove("hidden"); 
      document.getElementById("cart-item-count").innerText = totalCount;
    } else if (fabContainer) { 
      fabContainer.classList.add("hidden"); 
      this.closeModal(); 
    }
    
    // Actualizar el Total en el Modal
    const modalTotalEl = document.getElementById("modal-total-price");
    if (modalTotalEl) {
      modalTotalEl.innerText = `$${totalPrecio.toLocaleString('es-CO')}`;
    }
    
    // Renderizar la lista dentro del modal
    const modalList = document.getElementById("modal-item-list"); 
    if (!modalList) return;
    
    if (list.length === 0) {
      modalList.innerHTML = `<div class="text-center py-8"><p class="text-on-surface-variant italic">La comanda está vacía.</p></div>`;
    } else {
      modalList.innerHTML = list.map(item => {
        const platoInfo = this.allItems.find(p => p.id === item.id);
        const precioUnitario = platoInfo ? platoInfo.precio : 0;
        return `
          <div class="flex items-center justify-between border-b border-gray-200 pb-3 mb-1">
            <div class="flex flex-col">
              <span class="font-bold text-gray-900 text-sm leading-tight mb-1">${escapeHTML(item.nombre)}</span>
              <span class="text-[11px] text-gray-500 font-medium">$${precioUnitario.toLocaleString('es-CO')} c/u</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-primary">$${(precioUnitario * item.cantidad).toLocaleString('es-CO')}</span>
              
              <div class="flex items-center gap-2 bg-white border border-gray-200 px-2 py-1 rounded-lg shadow-sm">
                <button data-action="decrease" data-id="${item.id}" class="text-gray-500 hover:text-primary font-bold px-1">-</button>
                <span class="text-sm font-semibold w-4 text-center text-gray-900">${item.cantidad}</span>
                <button data-action="increase" data-id="${item.id}" class="text-gray-500 hover:text-primary font-bold px-1">+</button>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
  },

  async init() {
    this.bindEvents();
    try {
      const data = await MenuAPI.fetchItems();
      this.config = data.config || {};
      this.tema = data.tema || {};
      this.aplicarTema(this.tema);

      document.getElementById('brand-title').innerText = "Green Bowl";
      document.getElementById('brand-slogan').innerText = this.tema.eslogan || "Diseño Green Bowl";
      document.getElementById('brand-desc').innerText = "Energía que te impulsa. Nutrición que te transforma.";

      this.allItems = data.items || [];
      this.categoriesList = data.categories || [];
      
    } catch (e) {
      console.error("Error cargando menú", e);
      return;
    }

    document.getElementById("loading-spinner")?.classList.add("hidden");
    document.getElementById("menu-grid")?.classList.remove("hidden");
    this.setupCategoryFilter();
    this.renderMenu();
    this.updateUI();
  },

  bindEvents() {
    const bindClick = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    
    bindClick("btn-open-cart", () => this.openModal()); 
    bindClick("btn-close-cart", () => this.closeModal()); 
    bindClick("btn-clear-cart", () => this.clearList()); 

    // --- LÓGICA DE WHATSAPP ---
    bindClick("btn-whatsapp-checkout", () => {
      const list = this.getSelection();
      if (list.length === 0) {
        showToast("Agrega platos a tu lista primero", "error");
        return;
      }
      
      const numeroWhatsApp = "573025303152"; // RECUERDA PONER TU NÚMERO AQUÍ
      let mensaje = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
      let total = 0;
      
      list.forEach(item => {
        const platoInfo = this.allItems.find(p => p.id === item.id);
        const precio = platoInfo ? platoInfo.precio : 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        mensaje += `▪ ${item.cantidad}x ${item.nombre} - $${subtotal.toLocaleString('es-CO')}\n`;
      });
      
      mensaje += `\n*Total: $${total.toLocaleString('es-CO')}*`;
      window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, '_blank');
    });

    // EVENTOS DE LA GRILLA (Añadir platos)
    document.getElementById("menu-grid")?.addEventListener('click', (e) => { 
      const btn = e.target.closest('button[data-action="add-to-cart"]'); 
      if (btn) this.toggleSelection(btn.dataset.id, btn.dataset.name); 
    });

    // EVENTOS DEL MODAL (Sumar/Restar cantidades)
    document.getElementById("modal-item-list")?.addEventListener('click', (e) => { 
      const btn = e.target.closest('button[data-action]'); 
      if (!btn) return; 
      if (btn.dataset.action === 'decrease') this.updateQuantity(btn.dataset.id, -1); 
      if (btn.dataset.action === 'increase') this.updateQuantity(btn.dataset.id, 1); 
    });

    // EVENTOS DE CATEGORÍA
    document.getElementById("category-bar")?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (btn) this.filterCategory(btn.dataset.category);
    });
  },

  setupCategoryFilter() {
    if (this.categoriesList.length === 0) return;
    
    let categoriasVisibles = this.categoriesList.map(c => c.nombre);
    if (!this.selectedCategory) this.selectedCategory = categoriasVisibles[0];

    const categoryBar = document.getElementById("category-bar");
    
    const getIcon = (nombre) => {
      const n = nombre.toLowerCase();
      if (n.includes('hamburguesa') || n.includes('perro')) return 'lunch_dining';
      if (n.includes('salchipapa') || n.includes('alita')) return 'local_fire_department';
      if (n.includes('arepa') || n.includes('patacón') || n.includes('patacon')) return 'bakery_dining';
      if (n.includes('bebida') || n.includes('jugo')) return 'local_drink';
      return 'restaurant';
    };

    categoryBar.innerHTML = categoriasVisibles.map(cat => {
      const isActive = this.selectedCategory === cat;
      const icon = getIcon(cat);
      
      return `
      <button data-category="${escapeHTML(cat)}" class="flex flex-col items-center gap-2 group min-w-[70px] outline-none">
        <div class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-green-900/20 scale-110' : 'bg-white shadow-sm text-primary group-hover:bg-primary-light'}">
          <span class="material-symbols-outlined text-2xl">${icon}</span>
        </div>
        <span class="text-[11px] font-semibold transition-colors text-center leading-tight ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}">
          ${escapeHTML(cat)}
        </span>
      </button>
      `;
    }).join("");

    const titleEl = document.getElementById("current-category-title");
    if (titleEl) titleEl.innerText = this.selectedCategory;
  },

  renderMenu() {
    const grid = document.getElementById("menu-grid"); 
    if (!grid) return;
    
    const filtered = this.allItems.filter(i => {
      return i.categoria === this.selectedCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-500">No hay platos en esta categoría.</p></div>`;
      return;
    }

    grid.innerHTML = filtered.map(item => UIMinimal.generarTarjetaPlato(item, 'client', this.getSelection())).join("");
  },

  filterCategory(cat) { 
    this.selectedCategory = cat; 
    this.setupCategoryFilter(); 
    this.renderMenu(); 
  }
};

document.addEventListener("DOMContentLoaded", () => {
  GreenBowlMenu.init();
});