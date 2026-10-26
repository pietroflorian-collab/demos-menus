﻿import { MenuAPI, escapeHTML, showToast } from './api.js';
import { AppConfig } from './config.js';
import { UIEditorial } from './ui-editorial.js';

const TrattoriaMenu = {
  allItems: [], 
  categoriesList: [], 
  selectedCategory: "", 
  STORAGE_KEY: "trattoria_selection",

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

   updateUI() {
    const list = this.getSelection(); 
    const totalCount = list.reduce((acc, curr) => acc + curr.cantidad, 0); 
    const fabContainer = document.getElementById("fab-container");
    
    if (totalCount > 0 && fabContainer) { 
      fabContainer.classList.remove("hidden"); 
      
      let totalPrecio = 0;
      list.forEach(item => {
        const platoInfo = this.allItems.find(p => p.id === item.id);
        if(platoInfo) totalPrecio += (platoInfo.precio * item.cantidad);
      });

      document.getElementById("cart-item-count").innerText = `Mi Pedido (${totalCount})`;
      document.getElementById("cart-total-price").innerText = `$${totalPrecio.toLocaleString('es-CO')}`;
      
    } else if (fabContainer) { 
      fabContainer.classList.add("hidden"); 
      this.closeModal(); 
    }
    
    const modalList = document.getElementById("modal-item-list"); 
    if (!modalList) return;
    
    if (list.length === 0) {
      modalList.innerHTML = `<div class="text-center py-8"><p class="text-gray-500 italic">La comanda está vacía.</p></div>`;
    } else {
      modalList.innerHTML = list.map(item => {
        const platoInfo = this.allItems.find(p => p.id === item.id);
        const precio = platoInfo ? platoInfo.precio : 0;
        return `
          <div class="flex items-center justify-between border-b border-[#ddc0bf] pb-3">
            <div class="flex flex-col">
              <span class="font-display font-bold text-gray-900">${escapeHTML(item.nombre)}</span>
              <span class="text-sm text-gray-700">$${(precio * item.cantidad).toLocaleString('es-CO')}</span>
            </div>
            <div class="flex items-center gap-3 border border-gray-400 px-2 py-1">
              <button data-action="decrease" data-id="${item.id}" class="text-gray-700 hover:text-black font-bold">-</button>
              <span class="text-sm font-semibold w-4 text-center text-gray-900">${item.cantidad}</span>
              <button data-action="increase" data-id="${item.id}" class="text-gray-700 hover:text-black font-bold">+</button>
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
      this.allItems = data.items || [];
      this.categoriesList = data.categories || [];
      
      // INYECCIÓN DE DATOS
      document.getElementById('brand-title').innerText = AppConfig.cliente.nombre;
      document.getElementById('brand-slogan').innerText = AppConfig.cliente.eslogan;
      document.getElementById('brand-desc').innerText = AppConfig.cliente.descripcionComercial;
      
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
      if (list.length === 0) { showToast("La comanda está vacía", "error"); return; }
      
      const numeroWhatsApp = AppConfig.cliente.whatsappCliente.replace(/\D/g,'');
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

    document.getElementById('category-bar')?.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-category]');
      if (link) {
        e.preventDefault();
        this.filterCategory(link.dataset.category);
      }
    });
  },

  setupCategoryFilter() {
    if (this.categoriesList.length === 0) return;
    
    let categoriasVisibles = this.categoriesList.map(c => c.nombre);
    if (!this.selectedCategory) this.selectedCategory = categoriasVisibles[0];

    const categoryBar = document.getElementById("category-bar");
    
    categoryBar.innerHTML = categoriasVisibles.map((cat, index) => `
      <li class="flex items-center gap-4">
        <a href="#" data-category="${escapeHTML(cat)}" class="font-display text-[15px] uppercase tracking-[0.14em] transition-colors ${this.selectedCategory === cat ? 'text-primary underline underline-offset-8 decoration-primary' : 'text-gray-800 hover:text-primary'}">
          ${escapeHTML(cat)}
        </a>
        ${index < categoriasVisibles.length - 1 ? '<span class="text-gray-400 select-none text-xs">•</span>' : ''}
      </li>
    `).join("");

    document.getElementById("current-category-title").innerText = this.selectedCategory;
  },

  renderMenu() {
    const grid = document.getElementById("menu-grid"); 
    if (!grid) return;
    
    const filtered = this.allItems.filter(i => i.categoria === this.selectedCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="text-center py-12"><p class="text-gray-500 italic">No hay platos en esta categoría.</p></div>`;
      return;
    }

    grid.innerHTML = filtered.map(item => UIEditorial.generarTarjetaPlato(item, 'client', this.getSelection())).join("");
  },

  filterCategory(cat) { 
    this.selectedCategory = cat; 
    this.setupCategoryFilter(); 
    this.renderMenu(); 
  }
};

document.addEventListener("DOMContentLoaded", () => {
  TrattoriaMenu.init();
});