﻿import { MenuAPI, escapeHTML, showToast } from './api.js';
import { UIMinimal } from './ui-minimal.js'; // Importamos el diseño de Stitch

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
        modal.classList.remove("opacity-0");
        document.getElementById("modal-content").classList.remove("scale-95");
      }, 10);
    }
  },
  
  closeModal() { 
    const modal = document.getElementById("order-modal");
    if (modal) {
      modal.classList.add("opacity-0");
      document.getElementById("modal-content").classList.add("scale-95");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  },

  // --- MOTOR DE APARIENCIA (Lee los colores del JSON) ---
  aplicarTema(tema) {
    if (!tema) return;
    const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const val = (v) => { if (!v) return null; const s = String(v).trim(); return HEX.test(s) ? s : null; };

    const colorPrimario   = val(tema.colorPrimario);
    const colorFondo      = val(tema.colorFondo);
    
    if (colorPrimario || colorFondo) {
      let styleEl = document.getElementById('dynamic-theme');
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-theme'; document.head.appendChild(styleEl); }
      let css = ':root {\n';
      if (colorPrimario) { 
        css += `  --color-primary: ${colorPrimario};\n`; 
      }
      if (colorFondo) { 
        css += `  --color-surface: ${colorFondo};\n`; 
      }
      css += '}';
      styleEl.textContent = css;
    }
    
    // Aplicar fuentes si vienen en el JSON
    if (tema.fuenteHeroEslogan) {
      document.getElementById('brand-slogan').style.fontFamily = `'${tema.fuenteHeroEslogan}', sans-serif`;
    }
  },

  updateUI() {
    const list = this.getSelection(); 
    const totalCount = list.reduce((acc, curr) => acc + curr.cantidad, 0); 
    const fabContainer = document.getElementById("fab-container");
    
    if (totalCount > 0 && fabContainer) { 
      fabContainer.classList.remove("hidden"); 
      document.getElementById("fab-badge").innerText = totalCount; 
    } else if (fabContainer) { 
      fabContainer.classList.add("hidden"); 
      this.closeModal(); 
    }
    
    const modalList = document.getElementById("modal-item-list"); 
    if (!modalList) return;
    
    if (list.length === 0) {
      modalList.innerHTML = `<div class="text-center py-8"><span class="material-symbols-outlined text-gray-300 text-5xl mb-2">shopping_cart</span><p class="text-gray-500">Tu lista está vacía.</p></div>`;
    } else {
      modalList.innerHTML = list.map(item => {
        const platoInfo = this.allItems.find(p => p.id === item.id);
        const precio = platoInfo ? platoInfo.precio : 0;
        return `
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div class="flex flex-col">
              <span class="font-semibold text-gray-800">${escapeHTML(item.nombre)}</span>
              <span class="text-sm text-gray-500">$${(precio * item.cantidad).toLocaleString('es-CO')}</span>
            </div>
            <div class="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
              <button data-action="decrease" data-id="${item.id}" class="text-gray-600 hover:text-black font-bold">-</button>
              <span class="text-sm font-semibold w-4 text-center">${item.cantidad}</span>
              <button data-action="increase" data-id="${item.id}" class="text-gray-600 hover:text-black font-bold">+</button>
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

      // INYECTAR DATOS EN EL HTML DE STITCH
      document.getElementById('brand-title').innerText = "Green Bowl";
      document.getElementById('brand-slogan').innerText = this.tema.eslogan || "Come limpio, vive mejor";
      document.getElementById('brand-desc').innerText = "Ingredientes orgánicos, cosechados éticamente y preparados al instante para nutrir tu día.";

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

    // BOTÓN DE WHATSAPP
    bindClick("btn-whatsapp-checkout", () => {
      const list = this.getSelection();
      if (list.length === 0) {
        showToast("Agrega platos a tu lista primero", "error");
        return;
      }
      
      const numeroWhatsApp = "573000000000"; // Pon el número real aquí
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
    
    // Inyectamos los botones con el diseño de Stitch (píldoras)
    categoryBar.innerHTML = categoriasVisibles.map(cat => `
      <button data-category="${escapeHTML(cat)}" class="category-btn shrink-0 rounded-full px-6 py-2.5 font-semibold text-sm transition-all duration-200 
      ${this.selectedCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}">
        ${escapeHTML(cat)}
      </button>
    `).join("");

    const titleEl = document.getElementById("current-category-title");
    if (titleEl) titleEl.innerText = this.selectedCategory;
  },

  renderMenu() {
    const grid = document.getElementById("menu-grid"); 
    if (!grid) return;
    
    const filtered = this.allItems.filter(i => {
      // Filtramos por la categoría seleccionada
      return i.categoria === this.selectedCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-500">No hay platos en esta categoría.</p></div>`;
      return;
    }

    // Renderizamos usando la UI Minimal
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