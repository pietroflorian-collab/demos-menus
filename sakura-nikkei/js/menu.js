﻿import { MenuAPI, escapeHTML, showToast } from './api.js';
import { UISakura } from './ui-sakura.js'; // <-- Importa el generador de tarjetas correcto

const SakuraMenu = {
  allItems: [], 
  categoriesList: [], 
  selectedCategory: "", 
  STORAGE_KEY: "sakura_order_selection",

  getSelection() { 
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; } catch (e) { return []; } 
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
        document.getElementById("modal-content")?.classList.remove("scale-95");
      }, 10);
    }
  },
  
  closeModal() { 
    const modal = document.getElementById("order-modal");
    if (modal) {
      modal.classList.add("opacity-0");
      document.getElementById("modal-content")?.classList.add("scale-95");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  },

  aplicarTema(tema) {
    if (!tema) return;
    const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const val = (v) => { if (!v) return null; const s = String(v).trim(); return HEX.test(s) ? s : null; };

    const colorPrimario   = val(tema.colorPrimario);
    const colorFondo      = val(tema.colorFondo);
    const colorTexto      = val(tema.colorTexto);
    const colorTextoSuave = val(tema.colorTextoSuave);
    
    if (colorPrimario || colorFondo || colorTexto || colorTextoSuave) {
      let styleEl = document.getElementById('dynamic-theme');
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-theme'; document.head.appendChild(styleEl); }
      
      let css = ':root {\n';
      if (colorPrimario) { css += `  --color-primary: ${colorPrimario};\n`; }
      if (colorFondo) { css += `  --color-surface: ${colorFondo};\n  --color-surface-container-lowest: ${colorFondo};\n`; }
      if (colorTexto) { css += `  --color-on-surface: ${colorTexto};\n  --color-sushi-white: ${colorTexto};\n`; }
      if (colorTextoSuave) { css += `  --color-on-surface-variant: ${colorTextoSuave};\n`; }
      css += '}';
      styleEl.textContent = css;
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
      modalList.innerHTML = `<div class="text-center py-8"><p class="text-gray-500">Tu lista está vacía.</p></div>`;
    } else {
      modalList.innerHTML = list.map(item => {
        const platoInfo = this.allItems.find(p => p.id === item.id);
        const precio = platoInfo ? platoInfo.precio : 0;
        return `
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div class="flex flex-col">
              <span class="font-semibold text-white">${escapeHTML(item.nombre)}</span>
              <span class="text-sm text-gray-400">$${(precio * item.cantidad).toLocaleString('es-CO')}</span>
            </div>
            <div class="flex items-center gap-3 bg-gray-800 rounded-lg px-2 py-1">
              <button data-action="decrease" data-id="${item.id}" class="text-gray-300 hover:text-white font-bold">-</button>
              <span class="text-sm font-semibold w-4 text-center text-white">${item.cantidad}</span>
              <button data-action="increase" data-id="${item.id}" class="text-gray-300 hover:text-white font-bold">+</button>
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

      // Inyección de datos en el HTML
      document.getElementById('brand-title').innerText = "SAKURA NIKKEI";
      document.getElementById('brand-slogan').innerText = "Fusión Sin Límites";
      document.getElementById('brand-desc').innerText = "Los mejores cortes de sushi y platos nikkei en un ambiente único.";

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

    bindClick("btn-whatsapp-checkout", () => {
      const list = this.getSelection();
      if (list.length === 0) { showToast("Agrega platos a tu lista primero", "error"); return; }
      
      const numeroWhatsApp = "573000000000"; // Configurar
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

    document.getElementById("menu-grid")?.addEventListener('click', (e) => { 
      const btn = e.target.closest('button[data-action="add-to-cart"]'); 
      if (btn) this.toggleSelection(btn.dataset.id, btn.dataset.name); 
    });

    document.getElementById("modal-item-list")?.addEventListener('click', (e) => { 
      const btn = e.target.closest('button[data-action]'); 
      if (!btn) return; 
      if (btn.dataset.action === 'decrease') this.updateQuantity(btn.dataset.id, -1); 
      if (btn.dataset.action === 'increase') this.updateQuantity(btn.dataset.id, 1); 
    });

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
    
    categoryBar.innerHTML = categoriasVisibles.map(cat => `
      <button data-category="${escapeHTML(cat)}" class="category-btn shrink-0 rounded-full px-6 py-2.5 font-semibold text-sm transition-all duration-200 
      ${this.selectedCategory === cat ? 'bg-[#AD2020] text-white shadow-sm' : 'bg-[#1f1f1f] text-gray-400 border border-gray-700 hover:bg-[#2a2a2a]'}">
        ${escapeHTML(cat)}
      </button>
    `).join("");

    document.getElementById("current-category-title").innerText = this.selectedCategory;
  },

  renderMenu() {
    const grid = document.getElementById("menu-grid"); 
    if (!grid) return;
    
    const filtered = this.allItems.filter(i => i.categoria === this.selectedCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-500">No hay platos en esta categoría.</p></div>`;
      return;
    }

    // LLAMADA CORREGIDA
    grid.innerHTML = filtered.map(item => UISakura.generarTarjetaPlato(item, 'client', this.getSelection())).join("");
  },

  filterCategory(cat) { 
    this.selectedCategory = cat; 
    this.setupCategoryFilter(); 
    this.renderMenu(); 
  }
};

document.addEventListener("DOMContentLoaded", () => {
  SakuraMenu.init();
});