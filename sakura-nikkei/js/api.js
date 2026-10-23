export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[match]);
}

export function formatPrice(num) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num);
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white font-bold z-[9999] transition-opacity duration-300 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Clave para guardar los datos en el navegador
const DEMO_STORAGE_KEY = 'sukidesu_demo_data';

export const MenuAPI = {
  // Carga los datos iniciales (del menu.json o del localStorage si ya se editó)
  async fetchItems(isAdmin = false) {
    let dataStr = localStorage.getItem(DEMO_STORAGE_KEY);
    
    if (!dataStr) {
      try {
        // Lee el menu.json que está en la misma carpeta
        const res = await fetch(`./menu.json?v=${new Date().getTime()}`);
        if (!res.ok) throw new Error("JSON no encontrado");
        const data = await res.json();
        
        // Normalizamos la data para que tenga la estructura que espera el admin
        const initialData = {
          items: data.items || data.categorias?.flatMap(c => c.platos) || [],
          categories: data.categories || data.categorias || [],
          config: data.config || {}
        };
        
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
      } catch (error) {
        console.error("Error al cargar JSON inicial:", error);
        return { items: [], categories: [], config: {} };
      }
    }
    
    return JSON.parse(dataStr);
  },

  // Simula la publicación sin llamar a GitHub
  async publishMenuJSON() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'success', mensaje: "Simulación de publicación exitosa" });
      }, 800);
    });
  },

  // ---- OPERACIONES CRUD EN LOCALSTORAGE ----
  
  async createItem(data) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    data.id = 'item_' + Date.now();
    db.items.push(data);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    return { status: 'success' };
  },

  async updateItem(data) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    const idx = db.items.findIndex(i => i.id === data.id);
    if (idx !== -1) {
      db.items[idx] = { ...db.items[idx], ...data };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    }
    return { status: 'success' };
  },

  async deleteItem(id) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    db.items = db.items.filter(i => i.id !== id);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    return { status: 'success' };
  },

  async createCategory(data) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    data.id = 'cat_' + Date.now();
    data.es_pausada = false;
    db.categories.push(data);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    return { status: 'success' };
  },

  async updateCategory(data) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    const idx = db.categories.findIndex(c => c.id === data.id);
    if (idx !== -1) {
      db.categories[idx].es_pausada = data.es_pausada;
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    }
    return { status: 'success' };
  },

  async deleteCategory(id) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    db.categories = db.categories.filter(c => c.id !== id);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    return { status: 'success' };
  },

  async updateConfig(data) {
    const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY));
    db.config = { ...db.config, ...data };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    return { status: 'success' };
  }
};