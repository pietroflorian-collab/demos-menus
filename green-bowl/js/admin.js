import { MenuAPI, escapeHTML, showToast } from './api.js';
import { UIMinimal } from './ui-minimal.js'; // <-- CAMBIADO
import { AppConfig } from './config.js';    // <-- AGREGADO
import { AuthManager } from './auth.js';
import { QRGenerator } from './qr.js';
import { ImageUploader } from './image-uploader.js';


const SukidesuAdmin = {
  adminItems: [], 
  adminCategories: [], 
  adminConfig: {}, 
  selectedCategory: "", 
  searchQuery: "", 
  pendingConfirmAction: null,

  init() { 
    this.bindEvents(); 
    ImageUploader.init();
    this.loadAdminData(); 
    this.enableDragScroll("admin-category-bar"); 
    document.title = `Admin - ${AppConfig.cliente.nombre}`;
    document.getElementById('admin-sidebar-title').innerText = `Gestión de ${AppConfig.cliente.nombre}`;
  },

  bindEvents() {
    const bindClick = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    
    bindClick("nav-publish-btn", () => this.handlePublishMenu());
    bindClick("mobile-publish-btn", () => this.handlePublishMenu());
    bindClick("nav-promo-btn", () => this.openPromoModal()); 
    bindClick("nav-qr-btn", () => this.openQRModal()); 
    bindClick("nav-add-btn", () => this.openModal());
    bindClick("nav-cat-btn", () => this.openCategoryModal()); 
    bindClick("nav-emp-btn", () => this.showDemoToast()); 
    bindClick("nav-logout-btn", () => AuthManager.logout()); 
    
    const closeMobileMenu = () => document.getElementById('mobile-menu-overlay')?.classList.add('hidden');
    bindClick("mobile-new-btn", () => { closeMobileMenu(); this.openModal(); });
    bindClick("mobile-cat-btn", () => { closeMobileMenu(); this.openCategoryModal(); });
    bindClick("mobile-promo-btn", () => { closeMobileMenu(); this.openPromoModal(); });
    bindClick("mobile-qr-btn", () => { closeMobileMenu(); this.openQRModal(); });
    bindClick("mobile-emp-btn", () => { closeMobileMenu(); this.showDemoToast(); });
    bindClick("mobile-logout-btn", () => AuthManager.logout());
    
    bindClick("close-promo-btn", () => this.closeModalHelper("promoConfigModal")); 
    bindClick("close-cat-btn", () => this.closeModalHelper("categoryModal")); 
    bindClick("close-item-btn", () => this.closeModalHelper("itemModal"));
    bindClick("cancel-item-btn", () => this.closeModalHelper("itemModal")); 
    bindClick("close-qr-btn", () => this.closeModalHelper("qrModal"));
    bindClick("cancel-confirm-btn", () => this.closeConfirmDialog()); 
    bindClick("execute-confirm-btn", () => this.executeConfirmAction());
    bindClick("promo-save-btn", () => this.savePromoConfig()); 
    
    bindClick("confirm-crop-btn", () => {
      ImageUploader.confirmCrop(
        () => this.updateModalPreview(), 
        () => this.updatePromoPreview()
      );
    });
    
    document.getElementById("admin-search-input")?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    document.getElementById("itemForm")?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    document.getElementById("catForm")?.addEventListener('submit', (e) => this.handleCreateCategorySubmit(e));
    
    ['item-nombre', 'item-precio', 'item-categoria', 'item-descripcion', 'item-promo-texto'].forEach(id => { 
      document.getElementById(id)?.addEventListener('input', () => this.updateModalPreview()); 
    });
    
    document.getElementById('item-picante')?.addEventListener('change', () => this.updateModalPreview());
    
    ['config-promo-texto', 'config-promo-img'].forEach(id => { 
      document.getElementById(id)?.addEventListener('input', () => this.updatePromoPreview()); 
    });
    
    document.getElementById('config-promo-activa')?.addEventListener('change', () => this.updatePromoPreview());

    document.getElementById("admin-category-bar")?.addEventListener('click', (e) => { 
      const btn = e.target.closest('button[data-category]'); 
      if (btn) this.filterAdminCategory(btn.dataset.category); 
    });
    
    document.getElementById("admin-grid")?.addEventListener('click', (e) => {
      if (e.target.dataset.expandable) e.target.classList.toggle('line-clamp-3');
      const btn = e.target.closest('button[data-action]'); 
      if (!btn) return;
      if (btn.dataset.action === 'toggle-pause') this.togglePausado(btn.dataset.id);
      if (btn.dataset.action === 'edit') this.editItem(btn.dataset.id);
      if (btn.dataset.action === 'delete') this.deleteItem(btn.dataset.id);
    });

    document.getElementById("category-manage-list")?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]'); 
      if (!btn) return;
      if (btn.dataset.action === 'toggle-cat') this.toggleCategoryPause(btn.dataset.id, btn.dataset.state === 'true');
      if (btn.dataset.action === 'delete-cat') this.deleteCategory(btn.dataset.id);
    });
  },

  showDemoToast() {
    showToast("La gestión de personal no está disponible en el modo Demo.", "info");
  },

  async handlePublishMenu() {
    this.showConfirmDialog(
      "Publicar Menú en Vivo", 
      `¡Estás en Modo Demo!\n\nEn el sistema real, aquí se publicarían los cambios a tu página web. ¿Quieres simular la publicación?`, 
      async () => {
        const pcBtn = document.getElementById("nav-publish-btn");
        const mobBtn = document.getElementById("mobile-publish-btn");
        const originalPcText = pcBtn ? pcBtn.innerHTML : "";
        
        try {
          if (pcBtn) { pcBtn.innerHTML = `<span class="material-symbols-outlined mr-2 text-base animate-spin">sync</span> Publicando...`; pcBtn.disabled = true; }
          if (mobBtn) { mobBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">sync</span>`; mobBtn.disabled = true; }

          await MenuAPI.publishMenuJSON();
          
          document.getElementById("pending-changes-banner")?.classList.add("hidden");
          if (this.adminConfig) this.adminConfig.cambios_pendientes = false;
          showToast("¡Publicación simulada con éxito!", "success");
        } catch (error) {
          showToast(`Error: ${error.message}`, "error");
        } finally {
          if (pcBtn) { pcBtn.innerHTML = originalPcText; pcBtn.disabled = false; }
          if (mobBtn) { mobBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] pointer-events-none">cloud_upload</span>`; mobBtn.disabled = false; }
        }
      }
    );
  },

  enableDragScroll(id) {
    const slider = document.getElementById(id); 
    if (!slider) return; 
    let isDown = false, startX, scrollLeft;
    
    slider.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseleave', () => isDown = false); 
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); slider.scrollLeft = scrollLeft - ((e.pageX - slider.offsetLeft) - startX) * 2; });
    slider.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { e.preventDefault(); slider.scrollLeft += e.deltaY; } }, { passive: false });
  },

  async loadAdminData() {
    document.getElementById("admin-loading").classList.remove("hidden"); 
    document.getElementById("admin-grid").classList.add("hidden");
    
    const res = await MenuAPI.fetchItems(true); 
    this.adminItems = res.items || []; 
    this.adminCategories = res.categories || []; 
    
    document.getElementById("admin-loading").classList.add("hidden"); 
    document.getElementById("admin-grid").classList.remove("hidden");
    
    this.populateCategorySelect(); 
    this.setupAdminCategories(); 
    this.renderAdminGrid();
  },

  openModalHelper(id) { document.getElementById(id)?.classList.replace("hidden", "flex"); },
  closeModalHelper(id) { document.getElementById(id)?.classList.replace("flex", "hidden"); },

  showConfirmDialog(title, message, action) {
    document.getElementById('confirm-title').innerText = title; 
    document.getElementById('confirm-message').innerText = message;
    this.pendingConfirmAction = action; 
    this.openModalHelper('confirmModal');
  },
  
  closeConfirmDialog() { this.closeModalHelper('confirmModal'); this.pendingConfirmAction = null; },
  executeConfirmAction() { this.closeModalHelper('confirmModal'); if (this.pendingConfirmAction) { this.pendingConfirmAction(); this.pendingConfirmAction = null; } },

  openPromoModal() {
    document.getElementById("config-promo-file").value = "";
    ImageUploader.pendingPromoImageBase64 = null;
    document.getElementById("config-promo-activa").checked = String(this.adminConfig.promo_activa).toLowerCase() === "true"; 
    document.getElementById("config-promo-texto").value = this.adminConfig.promo_texto || "";
    document.getElementById("config-promo-img").value = this.adminConfig.promo_imagen || ""; 
    this.updatePromoPreview(); 
    this.openModalHelper("promoConfigModal");
  },
  
  updatePromoPreview() {
    const texto = document.getElementById("config-promo-texto").value || "Tu texto aparecerá aquí..."; 
    const url = document.getElementById("config-promo-img").value.trim();
    document.getElementById("admin-preview-promo-texto").innerText = texto; 
    const imgEl = document.getElementById("admin-preview-promo-img");
    
    if (url) { imgEl.src = url; imgEl.classList.remove("hidden"); } else { imgEl.src = ""; imgEl.classList.add("hidden"); }
  },
  
  async savePromoConfig() {
    const btn = document.getElementById("promo-save-btn"); 
    btn.innerText = "Procesando..."; 
    btn.disabled = true;
    
    try {
      let finalImageUrl = document.getElementById("config-promo-img").value;
      if (ImageUploader.pendingPromoImageBase64) {
        btn.innerText = "Procesando imagen..."; 
        finalImageUrl = await ImageUploader.uploadToGitHub(ImageUploader.pendingPromoImageBase64, true);
      }

      const payload = { 
        promo_activa: document.getElementById("config-promo-activa").checked.toString(), 
        promo_texto: document.getElementById("config-promo-texto").value, 
        promo_imagen: finalImageUrl 
      };
      
      const res = await MenuAPI.updateConfig(payload); 
      if(res && res.status === "success") { 
        showToast("Anuncio guardado", "success"); 
        this.adminConfig = payload; 
        this.closeModalHelper("promoConfigModal"); 
      } 
    } catch (error) { showToast(`Error: ${error.message}`, "error"); } 
    finally { btn.innerText = "Guardar Anuncio"; btn.disabled = false; }
  },

  openQRModal() { this.openModalHelper("qrModal"); QRGenerator.init(); QRGenerator.update(); },

  populateCategorySelect() { 
    const categoriasReales = this.adminCategories.filter(cat => { const name = (cat.nombre || "").toLowerCase(); return name !== "combos y promo" && name !== "combos y promos"; }); 
    document.getElementById("item-categoria").innerHTML = categoriasReales.map(cat => `<option value="${escapeHTML(cat.nombre)}">${escapeHTML(cat.nombre)}</option>`).join(""); 
  },
  
  setupAdminCategories() {
    if (this.adminCategories.length === 0) return;
    let categoriasVisibles = this.adminCategories.filter(c => { const name = (c.nombre || "").toLowerCase(); return !name.includes("combo") && !name.includes("promo"); }); 
    categoriasVisibles.push({ nombre: "Combos y Promo", es_pausada: false });
    
    if (!this.selectedCategory || !categoriasVisibles.some(c => c.nombre === this.selectedCategory)) {
      this.selectedCategory = categoriasVisibles[0].nombre;
    }
    document.getElementById("admin-category-bar").innerHTML = categoriasVisibles.map(cat => `<button data-category="${escapeHTML(cat.nombre)}" class="w-44 h-11 px-3 py-2 rounded-full font-label-bold text-sm shrink-0 transition-all ${cat.es_pausada ? 'opacity-50 grayscale border-dashed' : ''} ${this.selectedCategory === cat.nombre ? 'bg-primary text-sushi-white' : 'bg-surface-container-highest text-tertiary hover:bg-surface-bright'}">${escapeHTML(cat.nombre)}</button>`).join("");
  },
  
  filterAdminCategory(cat) { this.selectedCategory = cat; this.setupAdminCategories(); this.renderAdminGrid(); }, 
  handleSearch(query) { this.searchQuery = query.toLowerCase().trim(); this.renderAdminGrid(); },

  renderAdminGrid() {
    const grid = document.getElementById("admin-grid");
    const filtered = this.adminItems.filter(i => { 
      const safeName = i.nombre || ""; 
      const matchesSearch = !this.searchQuery || safeName.toLowerCase().includes(this.searchQuery); 
      let matchesCategory = false; 
      if (this.selectedCategory === "Combos y Promo") { 
        const cat = (i.categoria || "").toLowerCase(); 
        matchesCategory = (cat === "combos" || cat === "promociones" || cat === "promos" || cat === "promo" || (i.dias_promo && i.dias_promo.trim() !== "")); 
      } else { matchesCategory = this.searchQuery ? true : (i.categoria === this.selectedCategory); } 
      return matchesSearch && matchesCategory; 
    });
    
    const itemsHTML = filtered.map(item => UIMinimal.generarTarjetaPlato(item, 'admin')).join(""); 
    grid.innerHTML = itemsHTML + `<div id="btn-add-grid" class="rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center min-h-[240px] cursor-pointer group"><div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><span class="material-symbols-outlined text-3xl">add</span></div><span class="font-label-bold text-tertiary group-hover:text-primary">Añadir Nuevo</span></div>`;
    document.getElementById("btn-add-grid")?.addEventListener('click', () => this.openModal());
  },

  openCategoryModal() { this.renderCategoryManageList(); this.openModalHelper("categoryModal"); },
  
  renderCategoryManageList() {
    document.getElementById("category-manage-list").innerHTML = this.adminCategories.map(cat => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high border border-outline-30">
        <span class="font-label-bold text-sm ${cat.es_pausada ? 'line-through text-secondary' : 'text-on-surface'}">${escapeHTML(cat.nombre)}</span>
        <div class="flex gap-2">
          <button data-action="toggle-cat" data-id="${escapeHTML(cat.id)}" data-state="${!cat.es_pausada}" class="px-3 py-1 rounded text-xs font-label-bold ${cat.es_pausada ? 'bg-primary text-sushi-white' : 'bg-surface-variant text-secondary'}">${cat.es_pausada ? 'Reactivar' : 'Pausar'}</button>
          <button data-action="delete-cat" data-id="${escapeHTML(cat.id)}" class="p-1 text-error hover:bg-error/10 rounded"><span class="material-symbols-outlined pointer-events-none">delete</span></button>
        </div>
      </div>
    `).join("");
  },
  
  async handleCreateCategorySubmit(e) {
    e.preventDefault(); 
    const btn = document.getElementById("add-cat-btn"); 
    btn.disabled = true; btn.innerText = "Creando...";
    try { 
      const res = await MenuAPI.createCategory({ nombre: document.getElementById("new-cat-name").value.trim() }); 
      if (res && res.status === "success") { 
        document.getElementById("new-cat-name").value = ""; 
        showToast("Categoría creada", "success"); 
        await this.loadAdminData(); 
        this.renderCategoryManageList(); 
      } 
    } catch (error) { showToast(`Error: ${error.message}`, "error"); } 
    finally { btn.disabled = false; btn.innerText = "+ Crear"; }
  },
  
  async toggleCategoryPause(id, esPausada) { 
    try { await MenuAPI.updateCategory({ id: id, es_pausada: esPausada }); showToast("Estado actualizado", "info"); await this.loadAdminData(); this.renderCategoryManageList(); } 
    catch (error) { showToast(`Error: ${error.message}`, "error"); } 
  },
  
  async deleteCategory(id) {
    this.showConfirmDialog("Eliminar Categoría", "Esta acción es irreversible y podría afectar los platos.", async () => {
      try { 
        await MenuAPI.deleteCategory(id); 
        showToast("Eliminada", "success"); 
        await this.loadAdminData(); 
        this.renderCategoryManageList(); 
      } catch (error) { showToast(`Error: ${error.message}`, "error"); }
    });
  },

  updateModalPreview() {
    const itemEnVivo = { 
      nombre: document.getElementById("item-nombre").value || "Nombre del Plato", 
      categoria: document.getElementById("item-categoria").value || "Categoría", 
      descripcion: document.getElementById("item-descripcion").value || "Descripción del plato...", 
      precio: document.getElementById("item-precio").value || 0, 
      imagen_url: document.getElementById("item-imagen-url").value || "", 
      es_picante: document.getElementById("item-picante").checked, 
      es_pausado: document.getElementById("item-pausado").checked, 
      texto_promo: document.getElementById("item-promo-texto").value.trim() 
    };
    const contenedor = document.getElementById("preview-container"); 
    if (contenedor && typeof UIMinimal !== 'undefined') contenedor.innerHTML = UIMinimal.generarTarjetaPlato(itemEnVivo, 'preview');
  },
  
  async togglePausado(id) {
    const item = this.adminItems.find(i => i.id == id); 
    if (!item) return; 
    item.es_pausado = !(String(item.es_pausado).toLowerCase() === "true");
    try { 
      await MenuAPI.updateItem(item); 
      showToast("Estado actualizado", "info"); 
      this.renderAdminGrid(); 
    } catch (error) { item.es_pausado = !item.es_pausado; showToast(`Error: ${error.message}`, "error"); }
  },
  
  openModal(item = null) {
    document.getElementById("itemForm").reset(); 
    document.getElementById("item-id").value = item ? item.id : ""; 
    document.getElementById("item-file-input").value = ""; 
    ImageUploader.pendingImageBase64 = null; 
    document.getElementById("modal-title").innerText = item ? "Editar Plato" : "Añadir Nuevo Plato"; 
    document.querySelectorAll('input[name="promo-dia"]').forEach(cb => cb.checked = false);
    
    if (item) {
      document.getElementById("item-nombre").value = item.nombre || ""; 
      document.getElementById("item-precio").value = item.precio || 0; 
      document.getElementById("item-categoria").value = item.categoria || ""; 
      document.getElementById("item-imagen-url").value = item.imagen_url || ""; 
      document.getElementById("item-descripcion").value = item.descripcion || ""; 
      document.getElementById("item-picante").checked = String(item.es_picante).toLowerCase() === "true"; 
      document.getElementById("item-pausado").checked = String(item.es_pausado).toLowerCase() === "true"; 
      document.getElementById("item-promo-texto").value = item.texto_promo || ""; 
      if (item.dias_promo) { 
        const activeDays = item.dias_promo.split(',').map(d => d.trim()); 
        document.querySelectorAll('input[name="promo-dia"]').forEach(cb => { if (activeDays.includes(cb.value)) cb.checked = true; }); 
      }
    } else { document.getElementById("item-imagen-url").value = ""; } 
    this.updateModalPreview(); 
    this.openModalHelper("itemModal");
  },
  
  editItem(id) { const item = this.adminItems.find(i => i.id == id); if (item) this.openModal(item); },
  
  async deleteItem(id) { 
    this.showConfirmDialog("Eliminar Plato", "¿Estás seguro? El plato desaparecerá de la demo.", async () => {
      try { 
        const res = await MenuAPI.deleteItem(id); 
        if (res && res.status === "success") { 
          showToast("Plato eliminado", "success"); 
          await this.loadAdminData(); 
        } 
      } catch (error) { showToast(`Error: ${error.message}`, "error"); }
    });
  },

  async handleFormSubmit(e) {
    e.preventDefault(); 
    const btn = document.getElementById("submit-btn"); 
    btn.disabled = true; 
    try {
      const nombreInput = document.getElementById("item-nombre").value.trim();
      const itemId = document.getElementById("item-id").value;
      const esDuplicado = this.adminItems.some(item => item.nombre.toLowerCase() === nombreInput.toLowerCase() && item.id !== itemId);
      if (esDuplicado) { showToast("Ya existe un plato con este nombre.", "error"); btn.disabled = false; return; }

      let finalImageUrl = document.getElementById("item-imagen-url").value;
      if (ImageUploader.pendingImageBase64) { btn.innerText = "Procesando imagen..."; finalImageUrl = await ImageUploader.uploadToGitHub(ImageUploader.pendingImageBase64, false); }
      
      const payload = {
        nombre: nombreInput, 
        precio: document.getElementById("item-precio").value, 
        categoria: document.getElementById("item-categoria").value,
        imagen_url: finalImageUrl, 
        descripcion: document.getElementById("item-descripcion").value, 
        es_picante: document.getElementById("item-picante").checked, 
        es_pausado: document.getElementById("item-pausado").checked, 
        texto_promo: document.getElementById("item-promo-texto").value.trim(), 
        dias_promo: Array.from(document.querySelectorAll('input[name="promo-dia"]:checked')).map(cb => cb.value).join(',')
      };
      
      if (itemId) { payload.id = itemId; }
      
      const res = itemId ? await MenuAPI.updateItem(payload) : await MenuAPI.createItem(payload);
      
      if (res && res.status === "success") { 
        showToast("Plato guardado con éxito", "success"); 
        this.closeModalHelper("itemModal"); 
        await this.loadAdminData(); 
      } 
    } catch (error) { showToast(`Error: ${error.message}`, "error"); } 
    finally { btn.disabled = false; btn.innerText = "Guardar Plato"; }
  }
};

document.addEventListener("DOMContentLoaded", () => AuthManager.init(() => SukidesuAdmin.init()));