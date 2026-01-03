
// ============================================
// INITIALIZATION
// ============================================

// Escuchar cuando Supabase esté listo
window.addEventListener('supabase-ready', () => {
    console.log('🔔 Supabase listo, inicializando suscripciones...');
    initializeRealtimeSubscriptions();
});

// Escuchar actualizaciones de productos
window.addEventListener('products-updated', () => {
    console.log('🔄 Productos actualizados, recargando catálogo...');
    renderCatalog();
});

// Inicializar suscripciones en tiempo real
function initializeRealtimeSubscriptions() {
    if (typeof window.supabaseAPI === 'undefined') return;
    
    // Suscribirse a cambios en productos
    window.supabaseAPI.subscribeToProducts((payload) => {
        console.log('🔔 Cambio en productos:', payload.eventType);
        // Recargar catálogo cuando haya cambios
        setTimeout(() => {
            loadProducts().then(() => {
                renderCatalog();
            });
        }, 500);
    });
    
    // Suscribirse a cambios en pedidos (para admin)
    window.supabaseAPI.subscribeToOrders((payload) => {
        console.log('🔔 Cambio en pedidos:', payload.eventType);
        // Actualizar panel de admin si está abierto
        if (isAdminLogged()) {
            setTimeout(() => {
                loadAdminPanel();
            }, 500);
        }
    });
}

// Initialize AOS con verificación
function initAOS() {
    if (typeof AOS !== 'undefined') {
AOS.init({
    duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
        console.log('✓ AOS inicializado');
    } else {
        console.warn('⚠️ AOS no está disponible, continuando sin animaciones');
        // Agregar clase para que los elementos se muestren sin animación
        document.body.classList.add('aos-disabled');
    }
}

// Intentar inicializar AOS
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAOS);
} else {
    initAOS();
}

// ============================================
// LOADING SCREEN
// ============================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1500);
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ============================================
// MOBILE MENU
// ============================================
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Cerrar menú móvil si está abierto
            if (navMenu && navMenu.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        } else {
            console.warn(`No se encontró el elemento: ${href}`);
        }
    });
});

// Verificar que todas las secciones existan
// Verificar secciones (se ejecuta en initializeApp)
function verifySections() {
    const sections = ['inicio', 'catalogo', 'nosotros', 'proceso', 'contacto'];
    const missing = [];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (!section) {
            console.error(`⚠️ Sección no encontrada: #${id}`);
            missing.push(id);
        } else {
            console.log(`✓ Sección encontrada: #${id}`);
        }
    });
    return missing.length === 0;
}

// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('i');
const savedTheme = localStorage.getItem('theme') || 'light';

// Apply saved theme
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeIcon.className = 'fas fa-sun';
} else {
    themeIcon.className = 'fas fa-moon';
}

themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    if (isDark) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
    
    themeToggle.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNav() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNav);

// ============================================
// ANIMATED COUNTERS
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
        }
    }, 16);
}

// Observe stats for animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && statNumber.dataset.target) {
                const target = parseInt(statNumber.dataset.target);
                statNumber.textContent = '0';
                setTimeout(() => {
                    animateCounter(statNumber, target, 2000);
                }, 200);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card, .about-stat').forEach(item => {
    statsObserver.observe(item);
});

// ============================================
// SHOPPING CART
// ============================================
let shoppingCart = [];

// Tallas disponibles (34-41)
const AVAILABLE_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41'];

// Funciones de persistencia del carrito
function saveCartToStorage() {
    try {
        localStorage.setItem('kalevshoes_cart', JSON.stringify(shoppingCart));
    } catch (error) {
        console.error('Error guardando carrito:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('kalebshoes_cart');
        if (savedCart) {
            shoppingCart = JSON.parse(savedCart);
            updateCart();
        }
    } catch (error) {
        console.error('Error cargando carrito:', error);
        shoppingCart = [];
    }
}

// Cargar carrito al iniciar
loadCartFromStorage();

// ============================================
// PRODUCT CATALOG DATA
// ============================================
// Los productos se cargan desde shared-functions.js
// Esta función obtiene los productos actualizados
function getProducts() {
    // Intentar acceder a la variable products desde el scope global
    if (typeof window.products !== 'undefined' && window.products.length > 0) {
        return window.products;
    }
    // Si no está en window, intentar desde el scope actual
    if (typeof products !== 'undefined' && products.length > 0) {
        return products;
    }
    // Si no están disponibles, intentar cargarlos
    if (typeof loadProducts === 'function') {
        loadProducts();
        // Esperar un momento y volver a intentar
        if (typeof products !== 'undefined') {
            return products;
        }
    }
    // Último recurso: cargar desde localStorage directamente
    try {
        const savedProducts = localStorage.getItem('kalevshoes_products');
        if (savedProducts) {
            return JSON.parse(savedProducts);
        }
    } catch (error) {
        console.error('Error cargando productos desde localStorage:', error);
    }
    return [];
}

// ============================================
// RENDER CATALOG
// ============================================
function renderCatalog(filteredProducts = null) {
    // Obtener productos desde shared-functions
    const allProducts = getProducts();
    
    // Si no se proporcionan productos filtrados, usar todos los activos
    if (!filteredProducts) {
        filteredProducts = allProducts.filter(p => p.active !== false);
    } else {
        // Asegurar que solo se muestren productos activos
        filteredProducts = filteredProducts.filter(p => p.active !== false);
    }
    try {
        const grid = document.getElementById('catalogGrid');
        const noResults = document.getElementById('noResults');
        
        if (!grid) {
            console.error('❌ No se encontró el elemento catalogGrid');
            return;
        }
        
        if (!filteredProducts || filteredProducts.length === 0) {
            console.warn('⚠️ No hay productos para mostrar');
            if (noResults) {
                noResults.style.display = 'block';
            }
    grid.innerHTML = '';
            return;
        }
        
    grid.innerHTML = '';
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        console.log(`📦 Renderizando ${filteredProducts.length} productos...`);
        
        filteredProducts.forEach((product, index) => {
            try {
        const card = document.createElement('div');
                card.className = 'product-card';
                
                // Solo agregar AOS si está disponible
                if (typeof AOS !== 'undefined') {
        card.setAttribute('data-aos', 'fade-up');
                    card.setAttribute('data-aos-delay', (index % 6) * 50);
                }
                
                card.onclick = () => openModal(product);
                
        card.innerHTML = `
                    <img src="${product.image}" alt="${product.reference}" class="product-image" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkthbGViIFNob2VzPC90ZXh0Pjwvc3ZnPg=='">
                    <div class="product-info">
                        <div class="product-reference">${product.reference}</div>
                        <div class="product-category">${product.category}</div>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">${product.priceFormatted}</div>
                </div>
        `;
                
        grid.appendChild(card);
            } catch (error) {
                console.error(`Error creando tarjeta para ${product.reference}:`, error);
            }
        });
        
        // Refrescar AOS solo si está disponible
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
        console.log(`✅ ${filteredProducts.length} productos renderizados correctamente`);
    } catch (error) {
        console.error('❌ Error en renderCatalog:', error);
        const grid = document.getElementById('catalogGrid');
        if (grid) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent);"></i>
                    <p>Error al cargar el catálogo. Por favor recarga la página.</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> Recargar Página
                    </button>
                </div>
            `;
        }
    }
}

// ============================================
// FILTER & SEARCH FUNCTIONALITY
// ============================================
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const sortFilter = document.getElementById('sortFilter')?.value || '';
    const searchQuery = document.getElementById('productSearch')?.value.trim().toLowerCase() || '';

    const allProducts = getProducts();
    let filtered = allProducts.filter(p => p.active !== false);

    // Aplicar búsqueda
    if (searchQuery) {
        filtered = filtered.filter(p => {
            const searchText = `${p.reference} ${p.category} ${p.description}`.toLowerCase();
            return searchText.includes(searchQuery);
        });
    }

    // Aplicar filtro de categoría
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Aplicar ordenamiento
    if (sortFilter) {
        switch (sortFilter) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.reference.localeCompare(b.reference));
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'popular':
                // Simular popularidad por cantidad de tallas disponibles
                filtered.sort((a, b) => (b.sizes?.length || 0) - (a.sizes?.length || 0));
                break;
            default:
                // Mantener orden original
                break;
        }
    }

    // Actualizar contador de resultados
    updateResultsCount(filtered.length, allProducts.length);

    const grid = document.getElementById('catalogGrid');
    if (grid) {
        grid.style.opacity = '0';
        grid.style.transform = 'translateY(20px)';

        setTimeout(() => {
            renderCatalog(filtered);
            grid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 300);
    }
}

function updateResultsCount(filteredCount, totalCount) {
    const resultsElement = document.getElementById('resultsCount');
    if (resultsElement) {
        resultsElement.textContent = `Mostrando ${filteredCount} de ${totalCount} productos`;
    }
}

// Función para limpiar todos los filtros
function clearAllFilters() {
    const filters = ['categoryFilter', 'sortFilter', 'productSearch'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            if (element.type === 'text' || element.tagName === 'SELECT') {
                element.value = '';
            }
        }
    });
    applyFilters();
}

// ============================================
// ADVANCED FILTERS TOGGLE
// ============================================
function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advancedFilters');
    const toggleBtn = document.getElementById('advancedFiltersToggle');
    const toggleIcon = toggleBtn?.querySelector('i');
    
    if (advancedFilters.style.display === 'none' || advancedFilters.style.display === '') {
        advancedFilters.style.display = 'block';
        advancedFilters.style.maxHeight = '0px';
        advancedFilters.style.overflow = 'hidden';
        
        setTimeout(() => {
            advancedFilters.style.maxHeight = '200px';
            advancedFilters.style.transition = 'max-height 0.3s ease';
        }, 10);
        
        if (toggleIcon) toggleIcon.className = 'fas fa-times';
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-times"></i> Ocultar Avanzados';
    } else {
        advancedFilters.style.maxHeight = '0px';
        
        setTimeout(() => {
            advancedFilters.style.display = 'none';
        }, 300);
        
        if (toggleIcon) toggleIcon.className = 'fas fa-sliders-h';
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-sliders-h"></i> Filtros Avanzados';
    }
}
// Event listener para búsqueda
let searchTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }
});

// ============================================
// MODAL FUNCTIONALITY
// ============================================
function openModal(product) {
    const modal = document.getElementById('productModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDescription = document.getElementById('modalDescription');
    const modalPrice = document.getElementById('modalPrice');
    const sizesGrid = document.getElementById('sizesGrid');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    // Guardar producto actual en el modal
    modal.dataset.productId = product.reference;
    
    modalImg.src = product.image;
    modalImg.alt = product.reference;
    modalTitle.textContent = product.reference;
    modalCategory.textContent = product.category;
    modalDescription.textContent = product.description;
    modalPrice.textContent = product.priceFormatted;
    
    // Generar selector de tallas
    sizesGrid.innerHTML = '';
    AVAILABLE_SIZES.forEach(size => {
        const sizeItem = document.createElement('div');
        sizeItem.className = 'size-item';
        sizeItem.innerHTML = `
            <label class="size-label">Talla ${size}</label>
            <div class="size-controls">
                <button class="size-btn" onclick="changeSizeQuantity('${size}', -1)" type="button">-</button>
                <input type="number" 
                       class="size-input" 
                       id="size_${size}" 
                       data-size="${size}"
                       value="0" 
                       min="0" 
                       max="100"
                       onchange="updateModalTotal()">
                <button class="size-btn" onclick="changeSizeQuantity('${size}', 1)" type="button">+</button>
            </div>
        `;
        sizesGrid.appendChild(sizeItem);
    });
    
    // Resetear total
    document.getElementById('modalTotalPairs').textContent = '0';
    
    // Configurar botón de agregar al carrito
    addToCartBtn.onclick = () => addProductToCart(product);

    // Configurar botón de WhatsApp del modal
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.onclick = (e) => {
            e.preventDefault();
            sendProductWhatsApp(product);
        };
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Enviar producto por WhatsApp desde el modal
function sendProductWhatsApp(product) {
    const sizesData = {};
    let totalPairs = 0;
    
    AVAILABLE_SIZES.forEach(size => {
        const input = document.getElementById(`size_${size}`);
        const quantity = parseInt(input?.value) || 0;
        if (quantity > 0) {
            sizesData[size] = quantity;
            totalPairs += quantity;
        }
    });
    
    // Formatear mensaje para WhatsApp
    const dateStr = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let whatsappMessage = `👋 *Hola! Estoy interesado en un producto*\n\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `📋 *INFORMACIÓN DEL PRODUCTO*\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    whatsappMessage += `📅 *Fecha del pedido:*\n${dateStr}\n\n`;
    whatsappMessage += `👟 *Producto:* ${product.reference}\n`;
    whatsappMessage += `📂 *Categoría:* ${product.category}\n`;
    whatsappMessage += `💰 *Precio:* ${product.priceFormatted}\n\n`;
    
    if (totalPairs > 0) {
        whatsappMessage += `📏 *TALLAS Y CANTIDADES:*\n`;
        whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        Object.entries(sizesData).forEach(([size, qty]) => {
            whatsappMessage += `• Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}\n`;
        });
        whatsappMessage += `\n📊 *Total:* ${totalPairs} par${totalPairs > 1 ? 'es' : ''}\n`;
        const totalPrice = product.price * totalPairs;
        whatsappMessage += `💰 *Total a pagar:* $${totalPrice.toLocaleString('es-CO')}\n\n`;
    } else {
        whatsappMessage += `ℹ️ *Nota:* Sin tallas seleccionadas aún\n\n`;
    }
    
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `_📱 Enviado desde Kalev Shoes - Catálogo Web_\n`;
    whatsappMessage += `_Fabricante: Juan Gregorio Dávila Zoraca_`;
    
    // Enviar por WhatsApp
    sendToWhatsApp(whatsappMessage);
}

// Cambiar cantidad de una talla
window.changeSizeQuantity = function(size, change) {
    const input = document.getElementById(`size_${size}`);
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, currentValue + change);
    input.value = newValue;
    updateModalTotal();
}

// Actualizar total en el modal
function updateModalTotal() {
    let total = 0;
    AVAILABLE_SIZES.forEach(size => {
        const input = document.getElementById(`size_${size}`);
        const quantity = parseInt(input.value) || 0;
        total += quantity;
    });
    document.getElementById('modalTotalPairs').textContent = total;
}

// Agregar producto al carrito
function addProductToCart(product) {
    const sizesData = {};
    let totalPairs = 0;
    
    AVAILABLE_SIZES.forEach(size => {
        const input = document.getElementById(`size_${size}`);
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            sizesData[size] = quantity;
            totalPairs += quantity;
        }
    });
    
    if (totalPairs === 0) {
        showNotification('Por favor selecciona al menos un par', 'error');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingIndex = shoppingCart.findIndex(item => item.reference === product.reference);
    
    if (existingIndex !== -1) {
        // Actualizar producto existente
        shoppingCart[existingIndex].sizes = sizesData;
        shoppingCart[existingIndex].totalPairs = totalPairs;
        showNotification(`Producto ${product.reference} actualizado en el carrito`, 'success');
    } else {
        // Agregar nuevo producto
        shoppingCart.push({
            reference: product.reference,
            category: product.category,
            price: product.price,
            priceFormatted: product.priceFormatted,
            image: product.image,
            sizes: sizesData,
            totalPairs: totalPairs
        });
        showNotification(`Producto ${product.reference} agregado al carrito`, 'success');
    }
    
    updateCart();
    saveCartToStorage();
    closeModal();
}

// Actualizar carrito visual
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotalPairs = document.getElementById('cartTotalPairs');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartSummary = document.getElementById('cartSummary');
    const cartSummaryGroup = document.getElementById('cartSummaryGroup');
    
    let totalPairs = 0;
    
    if (shoppingCart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Tu carrito está vacío</p>
                <p class="cart-empty-hint">Agrega productos desde el catálogo</p>
            </div>
        `;
        cartBadge.textContent = '0';
        cartTotalPairs.textContent = '0';
        checkoutBtn.disabled = true;
        cartSummaryGroup.style.display = 'none';
    } else {
        cartItems.innerHTML = shoppingCart.map((item, index) => {
            totalPairs += item.totalPairs;
            
            const sizesList = Object.entries(item.sizes)
                .filter(([size, qty]) => qty > 0)
                .map(([size, qty]) => `${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
                .join(', ');
            
            return `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.reference}">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.reference}</h4>
                        <p class="cart-item-category">${item.category}</p>
                        <p class="cart-item-sizes"><strong>Tallas:</strong> ${sizesList}</p>
                        <p class="cart-item-price">${item.priceFormatted} - ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}</p>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        cartBadge.textContent = shoppingCart.length;
        cartTotalPairs.textContent = totalPairs;
        checkoutBtn.disabled = false;
        
        // Actualizar resumen en el formulario
        cartSummary.innerHTML = shoppingCart.map(item => {
            const sizesList = Object.entries(item.sizes)
                .filter(([size, qty]) => qty > 0)
                .map(([size, qty]) => `Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
                .join(', ');
            
            return `
                <div class="summary-item">
                    <strong>${item.reference}</strong> - ${item.category}<br>
                    <small>${sizesList}</small><br>
                    <small>Total: ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''} - ${item.priceFormatted}</small>
                </div>
            `;
        }).join('');
        
        cartSummaryGroup.style.display = 'block';
    }
}

// Eliminar del carrito
window.removeFromCart = function(index) {
    shoppingCart.splice(index, 1);
    updateCart();
    saveCartToStorage();
    showNotification('Producto eliminado del carrito', 'success');
}

// Ir al checkout o enviar carrito por WhatsApp
window.goToCheckout = function() {
    if (shoppingCart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    // Verificar si el usuario está registrado
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer) {
        showNotification('Debes iniciar sesión o registrarte para realizar un pedido', 'error');
        setTimeout(() => {
            window.location.href = 'user.html';
        }, 2000);
        return;
    }
    
    // Ir al formulario de contacto en lugar de WhatsApp directamente
    // Cerrar carrito
    closeCart();
    
    // Scroll al formulario
    const contactoSection = document.getElementById('contacto');
    if (contactoSection) {
        contactoSection.scrollIntoView({ behavior: 'smooth' });
        
        // Cambiar automáticamente el tipo de consulta a "pedido"
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            subjectSelect.value = 'pedido';
            // Trigger change event para mostrar selector de productos
            subjectSelect.dispatchEvent(new Event('change'));
        }
        
        showNotification('Completa el formulario de contacto para finalizar tu pedido', 'success');
    }
}

// Enviar carrito completo por WhatsApp
function sendCartToWhatsApp() {
    if (shoppingCart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    const dateStr = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let whatsappMessage = `🛒 *Hola! Tengo un pedido de productos*\n\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `📋 *MI PEDIDO*\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    whatsappMessage += `📅 *Fecha del pedido:*\n${dateStr}\n\n`;
    whatsappMessage += `🛍️ *PRODUCTOS SOLICITADOS:*\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    let totalPairs = 0;
    let totalPrice = 0;
    
    shoppingCart.forEach((item, index) => {
        whatsappMessage += `${index + 1}. *${item.reference}* - ${item.category}\n`;
        whatsappMessage += `   💰 Precio unitario: ${item.priceFormatted}\n`;
        
        // Agregar tallas y cantidades
        const sizesList = Object.entries(item.sizes)
            .filter(([size, qty]) => qty > 0)
            .map(([size, qty]) => `Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
            .join(', ');
        
        whatsappMessage += `   📏 ${sizesList}\n`;
        whatsappMessage += `   📦 Cantidad: ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}\n`;
        
        const itemTotal = item.price * item.totalPairs;
        totalPrice += itemTotal;
        whatsappMessage += `   💵 Subtotal: $${itemTotal.toLocaleString('es-CO')}\n\n`;
        
        totalPairs += item.totalPairs;
    });
    
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `📊 *RESUMEN DEL PEDIDO:*\n`;
    whatsappMessage += `• Total de pares: ${totalPairs} par${totalPairs > 1 ? 'es' : ''}\n`;
    whatsappMessage += `• Total a pagar: $${totalPrice.toLocaleString('es-CO')}\n\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `_📱 Enviado desde Kalev Shoes - Catálogo Web_\n`;
    whatsappMessage += `_Fabricante: Juan Gregorio Dávila Zoraca_`;
    
    // Obtener información del usuario registrado
    const currentCustomer = getCurrentCustomer();
    const customerName = currentCustomer ? currentCustomer.name : 'Pedido desde carrito';
    const customerPhone = currentCustomer ? currentCustomer.phone : 'No proporcionado';
    const customerEmail = currentCustomer ? (currentCustomer.email || 'No proporcionado') : 'No proporcionado';
    
    // Guardar pedido en base de datos
    const orderData = {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        subject: 'pedido',
        products: JSON.parse(JSON.stringify(shoppingCart)),
        totalPairs: totalPairs,
        message: 'Pedido realizado directamente desde el carrito',
        status: 'nuevo',
        whatsappSent: true,
        emailSent: false,
        sendType: 'whatsapp'
    };
    
    saveOrderToDatabase(orderData);
    
    // Enviar por WhatsApp
    sendToWhatsApp(whatsappMessage);
    
    // Vaciar y cerrar carrito después de enviar
    shoppingCart = [];
    updateCart();
    saveCartToStorage();
    closeCart();
    
    // Actualizar panel admin si está abierto
    if (isAdminLogged()) {
        loadAdminPanel();
    }
}

// Abrir/cerrar carrito
const cartToggle = document.getElementById('cartToggle');
const cartPanel = document.getElementById('cartPanel');

cartToggle?.addEventListener('click', () => {
    cartPanel.classList.toggle('active');
});

window.closeCart = function() {
    cartPanel.classList.remove('active');
}

function closeModal() {
    const modal = document.getElementById('productModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.style.animation = 'slideDown 0.3s ease';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Modal event listeners
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalBackdrop')?.addEventListener('click', closeModal);

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('productModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

// Add slideDown animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(50px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// WHATSAPP NUMBER (Configurable)
// ============================================
const WHATSAPP_NUMBER = '573205891435';

// ============================================
// EMAIL CONFIGURATION
// ============================================
const CONTACT_EMAIL = 'bermudezdeibys51@gmail.com';

// EmailJS Configuration
// Nota: Debes configurar estas credenciales en tu cuenta de EmailJS (https://www.emailjs.com/)
// Para configurar:
// 1. Crea una cuenta en https://www.emailjs.com/
// 2. Crea un servicio de email (Gmail, Outlook, etc.)
// 3. Crea un template de email
// 4. Obtén tu Public Key (User ID)
// 5. Reemplaza los valores aquí abajo

const EMAILJS_CONFIG = {
    SERVICE_ID: 'default_service', // Cambia esto por tu Service ID
    TEMPLATE_ID: 'template_kalevshoes', // Cambia esto por tu Template ID  
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY' // Cambia esto por tu Public Key (User ID)
};

// Inicializar EmailJS si está disponible
if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

// ============================================
// LOCAL STORAGE DATABASE (Pedidos)
// ============================================
function saveOrderToDatabase(orderData) {
    try {
        // Obtener pedidos existentes
        const existingOrders = JSON.parse(localStorage.getItem('kalevshoes_orders') || '[]');
        
        // Agregar nuevo pedido con timestamp y estado
        const newOrder = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: 'nuevo',
            whatsappSent: false,
            whatsappSentAt: null,
            ...orderData
        };
        
        existingOrders.push(newOrder);
        
        // Ordenar por fecha (más recientes primero)
        existingOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Guardar en localStorage (máximo 200 pedidos)
        if (existingOrders.length > 200) {
            existingOrders.splice(200); // Mantener solo los 200 más recientes
        }
        
        localStorage.setItem('kalevshoes_orders', JSON.stringify(existingOrders));
        
        // Actualizar estadísticas
        updateOrderStats();
        
        console.log('✅ Pedido guardado en base de datos:', newOrder);
        return newOrder;
    } catch (error) {
        console.error('❌ Error guardando pedido:', error);
        return null;
    }
}

// Marcar pedido como enviado a WhatsApp
function markOrderAsSent(orderId) {
    try {
        const orders = getAllOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].whatsappSent = true;
            orders[orderIndex].whatsappSentAt = new Date().toISOString();
            localStorage.setItem('kalevshoes_orders', JSON.stringify(orders));
            updateOrderStats();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error marcando pedido como enviado:', error);
        return false;
    }
}

function getAllOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('kalevshoes_orders') || '[]');
        // Ordenar por fecha (más recientes primero)
        return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        return [];
    }
}

// Obtener estadísticas de pedidos
function getOrderStats() {
    const orders = getAllOrders();
    const stats = {
        total: orders.length,
        nuevos: orders.filter(o => o.status === 'nuevo').length,
        enviados: orders.filter(o => o.whatsappSent === true).length,
        porTipo: {},
        porDia: {}
    };
    
    // Estadísticas por tipo
    orders.forEach(order => {
        const tipo = order.subject || 'otro';
        stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
    });
    
    // Estadísticas por día
    orders.forEach(order => {
        const fecha = new Date(order.timestamp).toLocaleDateString('es-CO');
        stats.porDia[fecha] = (stats.porDia[fecha] || 0) + 1;
    });
    
    return stats;
}

// Actualizar estadísticas en la UI (si existe el panel)
function updateOrderStats() {
    const statsPanel = document.getElementById('adminStats');
    if (statsPanel && statsPanel.style.display !== 'none') {
        const stats = getOrderStats();
        statsPanel.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Pedidos</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.nuevos}</div>
                <div class="stat-label">Nuevos</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.enviados}</div>
                <div class="stat-label">Enviados</div>
            </div>
        `;
    }
}

// ============================================
// CONTACT FORM
// ============================================
// Configurar selector de productos (se ejecuta cuando el DOM está listo)
function setupProductSelector() {
    const contactForm = document.getElementById('contactForm');
    const subjectSelect = document.getElementById('subject');
    const productSelectGroup = document.getElementById('productSelectGroup');
    const productSelect = document.getElementById('productSelect');

    // Mostrar selector de productos cuando se selecciona "pedido"
    if (subjectSelect && productSelectGroup && productSelect) {
        subjectSelect.addEventListener('change', (e) => {
            if (e.target.value === 'pedido') {
                productSelectGroup.style.display = 'block';
                productSelect.required = false; // Opcional
            } else {
                productSelectGroup.style.display = 'none';
                productSelect.required = false;
            }
        });
        console.log('✅ Selector de productos configurado');
    } else {
        console.warn('⚠️ Elementos del selector de productos no encontrados');
    }
}

// Llenar selector de productos
function populateProductSelect() {
    try {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect) {
            console.warn('⚠️ Selector de productos no encontrado');
            return;
        }

        productSelect.innerHTML = '<option value="">Selecciona un producto</option>';

        if (!products || products.length === 0) {
            console.warn('⚠️ No hay productos para llenar el selector');
            return;
        }

        products.forEach(product => {
            try {
                const option = document.createElement('option');
                option.value = product.reference;
                option.textContent = `${product.reference} - ${product.category} (${product.priceFormatted})`;
                productSelect.appendChild(option);
            } catch (error) {
                console.error(`Error agregando producto ${product.reference} al selector:`, error);
            }
        });

        console.log(`✓ Selector de productos poblado con ${products.length} opciones`);
    } catch (error) {
        console.error('❌ Error en populateProductSelect:', error);
    }
}

// Formatear mensaje para WhatsApp con mejor formato
function formatWhatsAppMessage(formData, includeDate = true) {
    const { name, phone, email, subject, message } = formData;
    const dateStr = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Formato mejorado para WhatsApp
    let whatsappMessage = `👋 *Hola! Soy ${name}*\n\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `📋 *INFORMACIÓN DEL PEDIDO*\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (includeDate) {
        whatsappMessage += `📅 *Fecha del pedido:*\n${dateStr}\n\n`;
    }
    
    whatsappMessage += `📌 *Tipo de consulta:*\n${getSubjectLabel(subject)}\n\n`;
    
    whatsappMessage += `📞 *Datos de contacto:*\n`;
    whatsappMessage += `• Teléfono: ${phone}\n`;
    if (email && email.trim() !== '') {
        whatsappMessage += `• Email: ${email}\n`;
    }
    whatsappMessage += `\n`;
    
    // Agregar información del carrito si hay productos
    if (shoppingCart && shoppingCart.length > 0) {
        whatsappMessage += `🛒 *PRODUCTOS SOLICITADOS:*\n`;
        whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        let totalPairs = 0;
        let totalPrice = 0;
        
        shoppingCart.forEach((item, index) => {
            whatsappMessage += `${index + 1}. *${item.reference}* - ${item.category}\n`;
            whatsappMessage += `   Precio unitario: ${item.priceFormatted}\n`;
            
            // Agregar tallas y cantidades
            const sizesList = Object.entries(item.sizes)
                .filter(([size, qty]) => qty > 0)
                .map(([size, qty]) => `Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
                .join(', ');
            
            whatsappMessage += `   ${sizesList}\n`;
            whatsappMessage += `   Cantidad: ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}\n`;
            const itemTotal = item.price * item.totalPairs;
            totalPrice += itemTotal;
            whatsappMessage += `   Subtotal: $${itemTotal.toLocaleString('es-CO')}\n\n`;
            
            totalPairs += item.totalPairs;
        });
        
        whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
        whatsappMessage += `📊 *RESUMEN:*\n`;
        whatsappMessage += `• Total de pares: ${totalPairs} par${totalPairs > 1 ? 'es' : ''}\n`;
        whatsappMessage += `• Total: $${totalPrice.toLocaleString('es-CO')}\n\n`;
    }
    
    if (message) {
        whatsappMessage += `💬 *NOTAS DEL CLIENTE:*\n`;
        whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
        whatsappMessage += `${message}\n\n`;
    }
    
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `_📱 Enviado desde Kalev Shoes - Catálogo Web_\n`;
    whatsappMessage += `_Fabricante: Juan Gregorio Dávila Zoraca_`;
    
    return whatsappMessage;
}

// Formatear mensaje para Email
function formatEmailMessage(formData) {
    const { name, phone, email, subject, message } = formData;
    
    const subjectLine = `Nuevo ${getSubjectLabel(subject)} - Kalev Shoes - ${name}`;
    
    let emailBody = `Hola,\n\n`;
    emailBody += `Has recibido un nuevo ${getSubjectLabel(subject).toLowerCase()} desde el catálogo web de Kalev Shoes.\n\n`;
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailBody += `INFORMACIÓN DEL CLIENTE\n`;
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    emailBody += `Nombre: ${name}\n`;
    emailBody += `Teléfono/WhatsApp: ${phone}\n`;
    emailBody += `Email: ${email || 'No proporcionado'}\n`;
    emailBody += `Tipo de consulta: ${getSubjectLabel(subject)}\n\n`;
    
    // Agregar información del carrito si hay productos
    if (shoppingCart && shoppingCart.length > 0) {
        emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        emailBody += `PRODUCTOS SOLICITADOS\n`;
        emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        let totalPairs = 0;
        shoppingCart.forEach((item, index) => {
            emailBody += `${index + 1}. ${item.reference} - ${item.category}\n`;
            emailBody += `   Precio: ${item.priceFormatted}\n`;
            
            // Agregar tallas y cantidades
            const sizesList = Object.entries(item.sizes)
                .filter(([size, qty]) => qty > 0)
                .map(([size, qty]) => `Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
                .join(', ');
            
            emailBody += `   ${sizesList}\n`;
            emailBody += `   Total: ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}\n\n`;
            
            totalPairs += item.totalPairs;
        });
        
        emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        emailBody += `TOTAL GENERAL: ${totalPairs} par${totalPairs > 1 ? 'es' : ''}\n\n`;
    }
    
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailBody += `MENSAJE DEL CLIENTE\n`;
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    emailBody += `${message}\n\n`;
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    emailBody += `Este mensaje fue enviado desde el catálogo web de Kalev Shoes.\n`;
    emailBody += `Fabricante: Juan Gregorio Dávila Zoraca\n`;
    emailBody += `Fecha: ${new Date().toLocaleString('es-CO')}\n`;
    
    return {
        subject: subjectLine,
        body: emailBody
    };
}

// Enviar por Email usando EmailJS
function sendToEmail(formData) {
    return new Promise((resolve) => {
        // Si EmailJS está disponible y configurado, intentar usarlo
        if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
            sendEmailWithEmailJS(formData).then(resolve).catch(() => {
                sendEmailWithMailto(formData);
                resolve(false);
            });
        } else {
            // Fallback a mailto
            const result = sendEmailWithMailto(formData);
            resolve(result);
        }
    });
}

// Enviar email usando EmailJS
function sendEmailWithEmailJS(formData) {
    return new Promise((resolve, reject) => {
        try {
            const emailData = formatEmailMessage(formData);
            
            // Preparar datos del pedido para el template
            let productsText = '';
            let totalPairs = 0;
            let totalPrice = 0;
            
            if (shoppingCart && shoppingCart.length > 0) {
                shoppingCart.forEach((item, index) => {
                    const sizesList = Object.entries(item.sizes)
                        .filter(([size, qty]) => qty > 0)
                        .map(([size, qty]) => `Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
                        .join(', ');
                    
                    const itemTotal = item.price * item.totalPairs;
                    totalPrice += itemTotal;
                    totalPairs += item.totalPairs;
                    
                    productsText += `${index + 1}. ${item.reference} - ${item.category}\n`;
                    productsText += `   Precio unitario: ${item.priceFormatted}\n`;
                    productsText += `   ${sizesList}\n`;
                    productsText += `   Cantidad: ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}\n`;
                    productsText += `   Subtotal: $${itemTotal.toLocaleString('es-CO')}\n\n`;
                });
            }
            
            // Preparar parámetros para EmailJS (adaptar estos nombres a tu template)
            const templateParams = {
                to_email: CONTACT_EMAIL,
                from_name: formData.name,
                from_email: formData.email || CONTACT_EMAIL,
                subject: emailData.subject,
                message: emailData.body,
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email || 'No proporcionado',
                order_type: getSubjectLabel(formData.subject),
                products: productsText || 'No hay productos en el pedido',
                total_pairs: totalPairs.toString(),
                total_price: totalPrice > 0 ? `$${totalPrice.toLocaleString('es-CO')}` : 'N/A',
                customer_message: formData.message || 'Sin notas adicionales',
                order_date: new Date().toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // Enviar email usando EmailJS
            emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            ).then(
                function(response) {
                    console.log('✅ Email enviado exitosamente:', response.status, response.text);
                    showNotification('✅ Email enviado exitosamente a ' + CONTACT_EMAIL, 'success');
                    resolve(true);
                },
                function(error) {
                    console.error('❌ Error enviando email con EmailJS:', error);
                    showNotification('⚠️ EmailJS no disponible, usando método alternativo', 'info');
                    reject(error);
                }
            );
        } catch (error) {
            console.error('Error en sendEmailWithEmailJS:', error);
            reject(error);
        }
    });
}

// Enviar por Email usando mailto (fallback)
function sendEmailWithMailto(formData) {
    try {
        const emailData = formatEmailMessage(formData);
        const subject = encodeURIComponent(emailData.subject);
        const body = encodeURIComponent(emailData.body);
        const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        
        // Intentar abrir el cliente de email
        window.location.href = mailtoUrl;
        
        return true;
    } catch (error) {
        console.error('Error abriendo email:', error);
        // Mostrar modal con el contenido del email para copiar
        showEmailModal(formData);
        return false;
    }
}

// Mostrar modal con contenido del email para copiar
function showEmailModal(formData) {
    const emailData = formatEmailMessage(formData);
    const modal = document.createElement('div');
    modal.className = 'whatsapp-modal';
    modal.innerHTML = `
        <div class="whatsapp-modal-content">
            <div class="whatsapp-modal-header">
                <h3><i class="fas fa-envelope"></i> Mensaje para Email</h3>
                <button class="whatsapp-modal-close" onclick="this.closest('.whatsapp-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="whatsapp-modal-body">
                <p class="whatsapp-modal-instruction">
                    Copia el contenido y envíalo a: <strong>${CONTACT_EMAIL}</strong>
                </p>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Asunto:</label>
                    <input type="text" class="whatsapp-message-text" value="${emailData.subject}" readonly style="min-height: auto; padding: 0.75rem;">
                </div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Mensaje:</label>
                <textarea class="whatsapp-message-text" readonly>${emailData.body}</textarea>
                <div class="whatsapp-modal-actions">
                    <button class="btn btn-primary" onclick="copyEmailContent(this)">
                        <i class="fas fa-copy"></i> Copiar Todo
                    </button>
                    <a href="mailto:${CONTACT_EMAIL}" class="btn btn-secondary">
                        <i class="fas fa-envelope"></i> Abrir Email
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar función global para copiar
    window.copyEmailContent = function(btn) {
        const subject = modal.querySelector('input').value;
        const body = modal.querySelector('textarea').value;
        const fullContent = `Asunto: ${subject}\n\n${body}`;
        
        // Crear elemento temporal para copiar
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = fullContent;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
            btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> Copiar Todo';
                btn.style.background = '';
            }, 2000);
            showNotification('Contenido copiado al portapapeles', 'success');
        } catch (err) {
            showNotification('Selecciona y copia el texto manualmente', 'info');
        }
        
        document.body.removeChild(tempTextarea);
    };
}

function getSubjectLabel(value) {
    const labels = {
        'pedido': 'Realizar pedido',
        'consulta': 'Consulta sobre productos',
        'cotizacion': 'Solicitar cotización',
        'colaboracion': 'Colaboración',
        'otro': 'Otro'
    };
    return labels[value] || value;
}

// Enviar a WhatsApp con mejor manejo
function sendToWhatsApp(message) {
    try {
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Crear URL de WhatsApp
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        // Intentar abrir WhatsApp
        // En móvil abrirá la app, en desktop abrirá WhatsApp Web
        const whatsappWindow = window.open(whatsappUrl, '_blank');
        
        // Si no se puede abrir (bloqueador de popups), mostrar instrucciones
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
            // Crear modal con el mensaje para copiar
            showWhatsAppModal(message);
        } else {
            // Verificar si se abrió correctamente
            setTimeout(() => {
                if (whatsappWindow.closed) {
                    showWhatsAppModal(message);
                }
            }, 500);
        }
        
        return true;
    } catch (error) {
        console.error('Error abriendo WhatsApp:', error);
        showWhatsAppModal(message);
        return false;
    }
}

// Mostrar modal con mensaje para copiar si WhatsApp no se abre
function showWhatsAppModal(message) {
    const modal = document.createElement('div');
    modal.className = 'whatsapp-modal';
    modal.innerHTML = `
        <div class="whatsapp-modal-content">
            <div class="whatsapp-modal-header">
                <h3><i class="fab fa-whatsapp"></i> Mensaje para WhatsApp</h3>
                <button class="whatsapp-modal-close" onclick="this.closest('.whatsapp-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="whatsapp-modal-body">
                <p class="whatsapp-modal-instruction">
                    Copia el mensaje y pégalo en WhatsApp:
                </p>
                <textarea class="whatsapp-message-text" readonly>${message}</textarea>
                <div class="whatsapp-modal-actions">
                    <button class="btn btn-primary" onclick="copyWhatsAppMessage(this)">
                        <i class="fas fa-copy"></i> Copiar Mensaje
                    </button>
                    <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="btn btn-secondary">
                        <i class="fab fa-whatsapp"></i> Abrir WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar función global para copiar
    window.copyWhatsAppMessage = function(btn) {
        const textarea = document.querySelector('.whatsapp-message-text');
        textarea.select();
        textarea.setSelectionRange(0, 99999); // Para móviles
        
        try {
            document.execCommand('copy');
            btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
            btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> Copiar Mensaje';
                btn.style.background = '';
            }, 2000);
            showNotification('Mensaje copiado al portapapeles', 'success');
        } catch (err) {
            // Fallback: seleccionar texto
            textarea.focus();
            textarea.select();
            showNotification('Selecciona y copia el texto manualmente', 'info');
        }
    };
    
    // Auto-focus en el textarea
    setTimeout(() => {
        const textarea = modal.querySelector('.whatsapp-message-text');
        if (textarea) {
            textarea.focus();
            textarea.select();
        }
    }, 100);
}

// Variable para rastrear el tipo de envío
let sendType = 'whatsapp';

// Función para configurar los event listeners del formulario
function setupFormListeners() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailBtn = document.getElementById('emailBtn');
    
    if (!contactForm || !submitBtn || !emailBtn) {
        console.warn('⚠️ Elementos del formulario no encontrados, reintentando...');
        // Reintentar después de un breve delay si los elementos no están listos
        setTimeout(setupFormListeners, 100);
        return;
    }
    
    // Remover listeners anteriores si existen para evitar duplicados
    const newSubmitBtn = submitBtn.cloneNode(true);
    const newEmailBtn = emailBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    emailBtn.parentNode.replaceChild(newEmailBtn, emailBtn);
    
    // Configurar listener para el formulario (prevenir submit por defecto)
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    // Configurar listener para botón de WhatsApp
    const whatsappBtn = document.getElementById('submitBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sendType = 'whatsapp';
            handleFormSubmit();
        });
    }
    
    // Configurar listener para botón de Email
    const emailButton = document.getElementById('emailBtn');
    if (emailButton) {
        emailButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sendType = 'email';
            handleFormSubmit();
        });
    }
    
    console.log('✅ Event listeners del formulario configurados correctamente');
}

// Función para manejar el envío del formulario
function handleFormSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    const emailBtn = document.getElementById('emailBtn');
    const originalHTML = submitBtn.innerHTML;
    const originalEmailHTML = emailBtn.innerHTML;
    
    // Obtener datos del formulario
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    if (!nameInput || !phoneInput || !subjectInput || !messageInput) {
        console.error('❌ Elementos del formulario no encontrados');
        showNotification('Error: No se pueden leer los datos del formulario', 'error');
        return;
    }
    
    // Verificar si el usuario está registrado (solo para pedidos)
    if (subjectInput.value === 'pedido') {
        const currentCustomer = getCurrentCustomer();
        if (!currentCustomer) {
            showNotification('Debes iniciar sesión o registrarte para realizar un pedido', 'error');
            setTimeout(() => {
                window.location.href = 'user.html';
            }, 2000);
            return;
        }
    }
    
    // Si el usuario está registrado, usar sus datos
    const currentCustomer = getCurrentCustomer();
    const formData = {
        name: currentCustomer ? currentCustomer.name : nameInput.value.trim(),
        phone: currentCustomer ? currentCustomer.phone : phoneInput.value.trim(),
        email: currentCustomer ? (currentCustomer.email || '') : (emailInput ? emailInput.value.trim() : ''),
        subject: subjectInput.value,
        productSelect: document.getElementById('productSelect') ? document.getElementById('productSelect').value : '',
        message: messageInput.value.trim()
    };
    
    // Validación
    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        // Re-habilitar botones si hay error
        if (submitBtn) submitBtn.disabled = false;
        if (emailBtn) emailBtn.disabled = false;
        return;
    }
    
    // Verificar que los botones existan antes de deshabilitarlos
    if (!submitBtn || !emailBtn) {
        console.error('❌ Botones del formulario no encontrados');
        showNotification('Error: Botones del formulario no encontrados', 'error');
        return;
    }
    
    // Deshabilitar ambos botones
    submitBtn.disabled = true;
    emailBtn.disabled = true;
    
    // Mostrar estado de carga según el tipo
    if (sendType === 'whatsapp') {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Preparando mensaje...</span>';
    } else {
        emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Preparando email...</span>';
    }
    
    // Guardar pedido en "base de datos" local
    const orderData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || 'No proporcionado',
        subject: formData.subject,
        products: shoppingCart.length > 0 ? JSON.parse(JSON.stringify(shoppingCart)) : [],
        totalPairs: shoppingCart.reduce((sum, item) => sum + item.totalPairs, 0),
        message: formData.message,
        status: 'nuevo',
        whatsappSent: false,
        emailSent: false,
        sendType: sendType
    };
    
    // Guardar en base de datos
    const savedOrder = saveOrderToDatabase(orderData);
    
    if (!savedOrder) {
        showNotification('Error al guardar el pedido. Intenta nuevamente.', 'error');
        submitBtn.innerHTML = originalHTML;
        emailBtn.innerHTML = originalEmailHTML;
        submitBtn.disabled = false;
        emailBtn.disabled = false;
        return;
    }
    
    // Pequeño delay para mejor UX
    setTimeout(() => {
        if (sendType === 'whatsapp') {
            // Formatear mensaje para WhatsApp
            const whatsappMessage = formatWhatsAppMessage(formData);
            
            // Enviar a WhatsApp
            const sent = sendToWhatsApp(whatsappMessage);
            
            // Marcar como enviado si se abrió correctamente
            if (sent) {
                markOrderAsSent(savedOrder.id);
            }
            
            // Mostrar éxito
            submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>¡Guardado! Abriendo WhatsApp...</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)';
        } else {
            // Enviar por Email
            sendToEmail(formData).then((emailSent) => {
                if (emailSent) {
                    // Marcar como enviado por email
                    const orders = getAllOrders();
                    const orderIndex = orders.findIndex(o => o.id === savedOrder.id);
                    if (orderIndex !== -1) {
                        orders[orderIndex].emailSent = true;
                        orders[orderIndex].emailSentAt = new Date().toISOString();
                        localStorage.setItem('kalevshoes_orders', JSON.stringify(orders));
                    }
                }
                
                // Mostrar éxito
                emailBtn.innerHTML = '<i class="fas fa-check"></i> <span>¡Guardado! Email procesado...</span>';
                emailBtn.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
            }).catch((error) => {
                console.error('Error enviando email:', error);
                emailBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Error, revisa consola</span>';
            });
        }
        
        // Resetear formulario después de un momento
        setTimeout(() => {
            const contactFormElement = document.getElementById('contactForm');
            const productSelectGroupElement = document.getElementById('productSelectGroup');
            
            if (contactFormElement) {
                contactFormElement.reset();
            }
            
            if (productSelectGroupElement) {
                productSelectGroupElement.style.display = 'none';
            }
            
            if (submitBtn) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }
            
            if (emailBtn) {
                emailBtn.innerHTML = originalEmailHTML;
                emailBtn.style.background = '';
                emailBtn.disabled = false;
            }
            
            const message = sendType === 'whatsapp' 
                ? '✅ Pedido guardado y WhatsApp abierto con tu mensaje.'
                : '✅ Pedido guardado y email abierto con tu mensaje.';
            showNotification(message, 'success');
            
            // Limpiar carrito después de enviar
            shoppingCart = [];
            updateCart();
            
            // Actualizar paneles si están abiertos
            if (isAdminLogged()) {
                loadAdminPanel();
            }
            if (getCurrentCustomer()) {
                loadCustomerPanel();
                updateCustomerBadge();
            }
        }, 2000);
    }, 500);
}

// ============================================
// SCROLL TO TOP
// ============================================
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Notification styles
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: -400px;
        background: var(--bg);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
        transition: right 0.3s ease;
        border-left: 4px solid var(--primary);
        min-width: 300px;
    }
    
    .notification.show {
        right: 30px;
    }
    
    .notification-success {
        border-left-color: #27ae60;
    }
    
    .notification-error {
        border-left-color: #e74c3c;
    }
    
    .notification i {
        font-size: 1.2rem;
        color: var(--primary);
    }
    
    .notification-success i {
        color: #27ae60;
    }
    
    .notification-error i {
        color: #e74c3c;
    }
    
    .notification span {
        color: var(--text);
        font-weight: 500;
    }
`;
document.head.appendChild(notificationStyle);

// ============================================
// USER AUTHENTICATION SYSTEM
// ============================================
const ADMIN_CREDENTIALS = {
    username: 'kalebadmin',
    password: 'kaleb2025'
};

// ============================================
// USER REGISTRATION SYSTEM
// ============================================
function registerUser(userData) {
    try {
        const users = getRegisteredUsers();
        
        // Verificar si el usuario ya existe
        const existingUser = users.find(u => {
            const userPhone = u.phone.replace(/\s+/g, '').replace(/\+/g, '');
            const newPhone = userData.phone.replace(/\s+/g, '').replace(/\+/g, '');
            return userPhone === newPhone;
        });
        
        if (existingUser) {
            return { success: false, message: 'Ya existe un usuario con este teléfono' };
        }
        
        const newUser = {
            id: Date.now(),
            name: userData.name,
            phone: userData.phone,
            email: userData.email || '',
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('kalevshoes_users', JSON.stringify(users));
        
        return { success: true, user: newUser };
    } catch (error) {
        console.error('Error registrando usuario:', error);
        return { success: false, message: 'Error al registrar usuario' };
    }
}

function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem('kalevshoes_users') || '[]');
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return [];
    }
}

function getUserByPhone(phone) {
    const users = getRegisteredUsers();
    return users.find(u => {
        const userPhone = u.phone.replace(/\s+/g, '').replace(/\+/g, '');
        const searchPhone = phone.replace(/\s+/g, '').replace(/\+/g, '');
        return userPhone === searchPhone || userPhone.endsWith(searchPhone) || searchPhone.endsWith(userPhone);
    });
}

// Sistema de usuarios clientes (basado en teléfono)
function getCustomerOrders(phone) {
    const orders = getAllOrders();
    return orders.filter(order => {
        // Normalizar teléfono para comparación
        const orderPhone = order.phone.replace(/\s+/g, '').replace(/\+/g, '');
        const customerPhone = phone.replace(/\s+/g, '').replace(/\+/g, '');
        return orderPhone === customerPhone || orderPhone.endsWith(customerPhone) || customerPhone.endsWith(orderPhone);
    });
}

function getCurrentCustomer() {
    return JSON.parse(localStorage.getItem('kalevshoes_current_customer') || 'null');
}

function setCurrentCustomer(phone, name) {
    localStorage.setItem('kalevshoes_current_customer', JSON.stringify({
        phone: phone,
        name: name,
        loginDate: new Date().toISOString()
    }));
}

function clearCurrentCustomer() {
    localStorage.removeItem('kalevshoes_current_customer');
}

function updateCustomerBadge() {
    const customer = getCurrentCustomer();
    const badge = document.getElementById('customerBadge');
    
    if (customer && badge) {
        const orders = getCustomerOrders(customer.phone);
        if (orders.length > 0) {
            badge.textContent = orders.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } else if (badge) {
        badge.style.display = 'none';
    }
}

// ============================================
// CUSTOMER ACCESS & AUTHENTICATION
// ============================================
function openCustomerAccessModal() {
    const modal = document.getElementById('customerAccessModal');
    const body = document.getElementById('customerAccessBody');
    
    if (!modal || !body) return;
    
    // Verificar si ya hay un cliente logueado
    const currentCustomer = getCurrentCustomer();
    if (currentCustomer) {
        openCustomerPanel();
        return;
    }
    
    body.innerHTML = `
        <div class="customer-access-tabs">
            <button class="access-tab active" data-tab="login">
                <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
            <button class="access-tab" data-tab="register">
                <i class="fas fa-user-plus"></i> Registrarse
            </button>
        </div>
        <div class="customer-login-form" id="customerLoginForm">
            <div class="customer-login-error" id="customerLoginError" style="display: none;">
                <i class="fas fa-exclamation-circle"></i>
                <span id="customerLoginErrorText"></span>
            </div>
            <div class="form-group">
                <label for="customerPhone">Teléfono / WhatsApp *</label>
                <input type="tel" id="customerPhone" placeholder="+57 300 123 4567" required>
                <i class="fab fa-whatsapp"></i>
            </div>
            <button class="btn btn-primary btn-block" id="customerLoginBtn">
                <i class="fas fa-sign-in-alt"></i>
                <span>Iniciar Sesión</span>
            </button>
            <p class="customer-login-note">
                <i class="fas fa-info-circle"></i>
                Ingresa el mismo teléfono que usaste al realizar tus pedidos o regístrate si eres nuevo.
            </p>
        </div>
        <div class="customer-register-form" id="customerRegisterForm" style="display: none;">
            <div class="customer-register-error" id="customerRegisterError" style="display: none;">
                <i class="fas fa-exclamation-circle"></i>
                <span id="customerRegisterErrorText"></span>
            </div>
            <div class="form-group">
                <label for="registerName">Nombre Completo *</label>
                <input type="text" id="registerName" placeholder="Tu nombre completo" required>
                <i class="fas fa-user"></i>
            </div>
            <div class="form-group">
                <label for="registerPhone">Teléfono / WhatsApp *</label>
                <input type="tel" id="registerPhone" placeholder="+57 300 123 4567" required>
                <i class="fab fa-whatsapp"></i>
            </div>
            <div class="form-group">
                <label for="registerEmail">Correo Electrónico (Opcional)</label>
                <input type="email" id="registerEmail" placeholder="tu@email.com">
                <i class="fas fa-envelope"></i>
            </div>
            <button class="btn btn-primary btn-block" id="customerRegisterBtn">
                <i class="fas fa-user-plus"></i>
                <span>Registrarse</span>
            </button>
            <p class="customer-register-note">
                <i class="fas fa-info-circle"></i>
                Al registrarte podrás ver todos tus pedidos y consultas en un solo lugar.
            </p>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Event listeners para pestañas
    document.querySelectorAll('.access-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.access-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const loginForm = document.getElementById('customerLoginForm');
            const registerForm = document.getElementById('customerRegisterForm');
            
            if (tabName === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });
    
    // Add event listeners
    document.getElementById('customerLoginBtn')?.addEventListener('click', handleCustomerLogin);
    document.getElementById('customerRegisterBtn')?.addEventListener('click', handleCustomerRegister);
    
    // Allow Enter key to submit
    document.getElementById('customerPhone')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCustomerLogin();
        }
    });
    
    document.getElementById('registerPhone')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCustomerRegister();
        }
    });
}

function handleCustomerRegister() {
    const name = document.getElementById('registerName')?.value.trim();
    const phone = document.getElementById('registerPhone')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const errorDiv = document.getElementById('customerRegisterError');
    const errorText = document.getElementById('customerRegisterErrorText');
    
    if (!name || !phone) {
        showCustomerRegisterError('Por favor completa todos los campos requeridos');
        return;
    }
    
    const result = registerUser({ name, phone, email });
    
    if (result.success) {
        setCurrentCustomer(phone, name);
        closeCustomerAccessModal();
        openCustomerPanel();
        updateCustomerBadge();
        showNotification(`¡Bienvenido ${name}! Tu cuenta ha sido creada correctamente`, 'success');
    } else {
        showCustomerRegisterError(result.message || 'Error al registrar usuario');
    }
}

function showCustomerRegisterError(message) {
    const errorDiv = document.getElementById('customerRegisterError');
    const errorText = document.getElementById('customerRegisterErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function handleCustomerLogin() {
    const phone = document.getElementById('customerPhone')?.value.trim();
    
    if (!phone) {
        showCustomerLoginError('Por favor ingresa tu número de teléfono');
        return;
    }
    
    // Primero verificar si el usuario está registrado
    const registeredUser = getUserByPhone(phone);
    
    if (registeredUser) {
        // Usuario registrado - actualizar último login
        const users = getRegisteredUsers();
        const userIndex = users.findIndex(u => u.id === registeredUser.id);
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('kalevshoes_users', JSON.stringify(users));
        }
        
        setCurrentCustomer(phone, registeredUser.name);
        closeCustomerAccessModal();
        openCustomerPanel();
        updateCustomerBadge();
        
        const orders = getCustomerOrders(phone);
        showNotification(`¡Bienvenido de nuevo ${registeredUser.name}! Tienes ${orders.length} pedido(s)`, 'success');
        return;
    }
    
    // Si no está registrado, verificar si tiene pedidos
    const orders = getCustomerOrders(phone);
    
    if (orders.length === 0) {
        showCustomerLoginError('No se encontraron pedidos con ese número. ¿Deseas registrarte?');
        // Cambiar a pestaña de registro
        setTimeout(() => {
            const registerTab = document.querySelector('.access-tab[data-tab="register"]');
            if (registerTab) registerTab.click();
        }, 1000);
        return;
    }
    
    // Usuario con pedidos pero no registrado - usar nombre del pedido
    const lastOrder = orders[0];
    const customerName = lastOrder.name || 'Cliente';
    
    // Guardar sesión del cliente
    setCurrentCustomer(phone, customerName);
    
    closeCustomerAccessModal();
    openCustomerPanel();
    updateCustomerBadge();
    
    showNotification(`Bienvenido ${customerName}. Tienes ${orders.length} pedido(s)`, 'success');
}

function showCustomerLoginError(message) {
    const errorDiv = document.getElementById('customerLoginError');
    const errorText = document.getElementById('customerLoginErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function closeCustomerAccessModal() {
    const modal = document.getElementById('customerAccessModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openCustomerPanel() {
    const customer = getCurrentCustomer();
    if (!customer) {
        openCustomerAccessModal();
        return;
    }
    
    const panel = document.getElementById('customerPanelContainer');
    if (panel) {
        panel.style.display = 'block';
        loadCustomerPanel();
    }
}

function closeCustomerPanel() {
    const panel = document.getElementById('customerPanelContainer');
    if (panel) {
        panel.style.display = 'none';
    }
}

function loadCustomerPanel() {
    const customer = getCurrentCustomer();
    if (!customer) return;
    
    const orders = getCustomerOrders(customer.phone);
    renderCustomerOrdersList(orders, customer);
}

function renderCustomerOrdersList(orders, customer) {
    const ordersList = document.getElementById('customerOrdersList');
    if (!ordersList) return;
    
    // Calcular estadísticas del cliente
    const totalOrders = orders.length;
    const totalPairs = orders.reduce((sum, order) => sum + (order.totalPairs || 0), 0);
    const totalSpent = orders.reduce((sum, order) => {
        if (order.products && order.products.length > 0) {
            return sum + order.products.reduce((itemSum, item) => itemSum + (item.price * item.totalPairs), 0);
        }
        return sum;
    }, 0);
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="customer-info">
                <h4><i class="fas fa-user"></i> ${customer.name}</h4>
                <p><i class="fab fa-whatsapp"></i> ${customer.phone}</p>
            </div>
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No tienes pedidos aún</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = `
        <div class="customer-info">
            <h4><i class="fas fa-user"></i> ${customer.name}</h4>
            <p><i class="fab fa-whatsapp"></i> ${customer.phone}</p>
            <div class="customer-stats">
                <div class="customer-stat-item">
                    <div class="customer-stat-value">${totalOrders}</div>
                    <div class="customer-stat-label">Pedidos</div>
                </div>
                <div class="customer-stat-item">
                    <div class="customer-stat-value">${totalPairs}</div>
                    <div class="customer-stat-label">Pares</div>
                </div>
                <div class="customer-stat-item">
                    <div class="customer-stat-value">$${totalSpent.toLocaleString('es-CO')}</div>
                    <div class="customer-stat-label">Total</div>
                </div>
            </div>
        </div>
        <div class="customer-orders-header">
            <h5><i class="fas fa-list"></i> Historial de Pedidos</h5>
        </div>
        ${orders.map(order => {
            const badgeClass = order.whatsappSent || order.emailSent ? 'badge-enviado' : 'badge-nuevo';
            const badgeText = order.whatsappSent || order.emailSent ? 'Enviado' : 'En Proceso';
            
            let productsHtml = '';
            let orderTotal = 0;
            if (order.products && order.products.length > 0) {
                productsHtml = '<div class="order-products-list"><strong>Productos:</strong><ul>';
                order.products.forEach(item => {
                    const sizesList = Object.entries(item.sizes || {})
                        .filter(([size, qty]) => qty > 0)
                        .map(([size, qty]) => `Talla ${size}: ${qty}`)
                        .join(', ');
                    const itemTotal = item.price * item.totalPairs;
                    orderTotal += itemTotal;
                    productsHtml += `<li><strong>${item.reference}</strong> - ${item.category}<br>
                        <small>${sizesList} (${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}) - ${item.priceFormatted} c/u</small><br>
                        <small>Subtotal: $${itemTotal.toLocaleString('es-CO')}</small></li>`;
                });
                productsHtml += `</ul><div class="order-total"><strong>Total del pedido: $${orderTotal.toLocaleString('es-CO')}</strong></div></div>`;
            }
            
            return `
                <div class="order-item">
                    <div class="order-header">
                        <div>
                            <div class="order-name">Pedido #${order.id}</div>
                            <div class="order-date">${order.dateFormatted || new Date(order.timestamp).toLocaleString('es-CO')}</div>
                        </div>
                        <span class="order-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="order-details">
                        <div><strong>Tipo:</strong> ${getSubjectLabel(order.subject)}</div>
                        ${productsHtml}
                        ${order.message ? `<div class="order-message"><strong>Mensaje:</strong> ${order.message}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function logoutCustomer() {
    clearCurrentCustomer();
    closeCustomerPanel();
    updateCustomerBadge();
    showNotification('Sesión cerrada correctamente', 'success');
}

// Exponer función global
window.closeCustomerPanel = closeCustomerPanel;
window.logoutCustomer = logoutCustomer;

// ============================================
// ADMIN ACCESS & AUTHENTICATION
// ============================================

// Check if admin is logged in
function isAdminLogged() {
    return localStorage.getItem('adminLogged') === 'true';
}

// Show/hide admin panel based on login status
function checkAdminStatus() {
    const adminPanelContainer = document.getElementById('adminPanelContainer');
    if (isAdminLogged() && adminPanelContainer) {
        adminPanelContainer.style.display = 'block';
        loadAdminPanel();
    } else if (adminPanelContainer) {
        adminPanelContainer.style.display = 'none';
    }
}

// Open admin access modal
function openAdminAccessModal() {
    const modal = document.getElementById('adminAccessModal');
    const body = document.getElementById('adminAccessBody');
    
    if (!modal || !body) return;
    
    // Show initial options
    body.innerHTML = `
        <div class="admin-access-options">
            <div class="admin-access-option" id="userAccessOption">
                <i class="fas fa-user"></i>
                <h4>Entrar como Usuario</h4>
                <p>Navegar el catálogo normalmente</p>
            </div>
            <div class="admin-access-option" id="adminAccessOption">
                <i class="fas fa-user-shield"></i>
                <h4>Entrar como Administrador</h4>
                <p>Acceder al panel de administración</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('userAccessOption')?.addEventListener('click', () => {
        closeAdminAccessModal();
    });
    
    document.getElementById('adminAccessOption')?.addEventListener('click', () => {
        showAdminLoginForm();
    });
    
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Show admin login form
function showAdminLoginForm() {
    const body = document.getElementById('adminAccessBody');
    if (!body) return;
    
    body.innerHTML = `
        <div class="admin-login-form">
            <div class="admin-login-error" id="adminLoginError">
                <i class="fas fa-exclamation-circle"></i>
                <span id="adminLoginErrorText">Credenciales incorrectas. Intenta nuevamente.</span>
            </div>
            <div class="form-group">
                <label for="adminUsername">Usuario</label>
                <input type="text" id="adminUsername" placeholder="Ingresa tu usuario" required>
                <i class="fas fa-user"></i>
            </div>
            <div class="form-group">
                <label for="adminPassword">Contraseña</label>
                <input type="password" id="adminPassword" placeholder="Ingresa tu contraseña" required>
                <i class="fas fa-lock"></i>
            </div>
            <button class="btn btn-primary btn-block" id="adminLoginBtn">
                <i class="fas fa-sign-in-alt"></i>
                <span>Iniciar Sesión</span>
            </button>
            <button class="btn btn-secondary btn-block" id="adminBackBtn">
                <i class="fas fa-arrow-left"></i>
                <span>Volver</span>
            </button>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('adminLoginBtn')?.addEventListener('click', handleAdminLogin);
    document.getElementById('adminBackBtn')?.addEventListener('click', openAdminAccessModal);
    
    // Allow Enter key to submit
    document.getElementById('adminPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAdminLogin();
        }
    });
}

// Handle admin login
function handleAdminLogin() {
    const username = document.getElementById('adminUsername')?.value.trim();
    const password = document.getElementById('adminPassword')?.value.trim();
    const errorDiv = document.getElementById('adminLoginError');
    
    if (!username || !password) {
        showAdminLoginError('Por favor completa todos los campos');
        return;
    }
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Login successful
        localStorage.setItem('adminLogged', 'true');
        closeAdminAccessModal();
        // Redirect to admin page
        window.location.href = 'admin.html';
    } else {
        showAdminLoginError('Usuario o contraseña incorrectos');
    }
}

// Show login error
function showAdminLoginError(message) {
    const errorDiv = document.getElementById('adminLoginError');
    const errorText = document.getElementById('adminLoginErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// Close admin access modal
function closeAdminAccessModal() {
    const modal = document.getElementById('adminAccessModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Logout admin
function logoutAdmin() {
    localStorage.removeItem('adminLogged');
    checkAdminStatus();
    closeAdminPanel();
    showNotification('Sesión cerrada correctamente', 'success');
}

// ============================================
// ADMIN PANEL
// ============================================
function openAdminPanel() {
    if (!isAdminLogged()) {
        openAdminAccessModal();
        return;
    }
    
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'block';
        loadAdminPanel();
    }
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function loadAdminPanel() {
    renderAdminTabs();
    updateOrderStats();
    renderOrdersList();
    // Las otras pestañas se cargarán cuando se seleccionen
}

// Renderizar pestañas del panel admin
function renderAdminTabs() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) return;
    
    // Verificar si ya existen las pestañas
    if (adminPanel.querySelector('.admin-tabs')) return;
    
    const panelHeader = adminPanel.querySelector('.admin-panel-header');
    if (!panelHeader) return;
    
    // Crear estructura de pestañas
    const tabsHTML = `
        <div class="admin-tabs">
            <button class="admin-tab active" data-tab="orders">
                <i class="fas fa-shopping-bag"></i> Pedidos
            </button>
            <button class="admin-tab" data-tab="products">
                <i class="fas fa-box"></i> Productos
            </button>
            <button class="admin-tab" data-tab="stats">
                <i class="fas fa-chart-bar"></i> Estadísticas
            </button>
        </div>
    `;
    
    const contentWrapper = adminPanel.querySelector('.admin-content-wrapper');
    if (contentWrapper) {
        contentWrapper.insertAdjacentHTML('beforebegin', tabsHTML);
    } else {
        panelHeader.insertAdjacentHTML('afterend', tabsHTML);
    }
    
    // Event listeners para pestañas
    setTimeout(() => {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
            });
        });
    }, 100);
}

function switchTab(tabName) {
    // Actualizar pestañas activas
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Ocultar todos los contenedores
    const adminStats = document.getElementById('adminStats');
    const ordersTab = document.getElementById('adminOrdersList');
    const productsTab = document.getElementById('adminProductsContainer');
    const statsTab = document.getElementById('adminStatsContainer');
    
    // Ocultar todos
    if (adminStats) adminStats.style.display = 'none';
    if (ordersTab) ordersTab.style.display = 'none';
    if (productsTab) productsTab.style.display = 'none';
    if (statsTab) statsTab.style.display = 'none';
    
    // Mostrar el seleccionado
    if (tabName === 'orders') {
        if (adminStats) adminStats.style.display = 'block';
        if (ordersTab) ordersTab.style.display = 'block';
    } else if (tabName === 'products') {
        if (productsTab) {
            productsTab.style.display = 'block';
            renderAdminProductsList();
        }
    } else if (tabName === 'stats') {
        if (statsTab) {
            statsTab.style.display = 'block';
            renderAdminStats();
        }
    }
}

function renderOrdersList() {
    const ordersList = document.getElementById('adminOrdersList');
    if (!ordersList) return;
    
    const orders = getAllOrders();
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No hay pedidos guardados aún</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => {
        const badgeClass = order.whatsappSent ? 'badge-enviado' : 'badge-nuevo';
        const badgeText = order.whatsappSent ? 'Enviado' : 'Nuevo';
        
        return `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <div class="order-name">${order.name}</div>
                        <div class="order-date">${order.dateFormatted || new Date(order.timestamp).toLocaleString('es-CO')}</div>
                    </div>
                    <span class="order-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="order-details">
                    <div><strong>Tipo:</strong> ${getSubjectLabel(order.subject)}</div>
                    <div><strong>Teléfono:</strong> ${order.phone}</div>
                    ${order.product && order.product !== 'Ninguno' ? `<div><strong>Producto:</strong> ${order.product}</div>` : ''}
                    <div style="margin-top: 0.5rem; font-style: italic;">${order.message.substring(0, 100)}${order.message.length > 100 ? '...' : ''}</div>
                </div>
                <div class="order-actions">
                    <button class="order-btn order-btn-view" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewOrderDetails(orderId) {
    const orders = getAllOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Pedido no encontrado', 'error');
        return;
    }
    
    // Formatear mensaje para WhatsApp
    const formData = {
        name: order.name,
        phone: order.phone,
        email: order.email,
        subject: order.subject,
        productSelect: order.product !== 'Ninguno' ? order.product : '',
        message: order.message
    };
    
    const whatsappMessage = formatWhatsAppMessage(formData);
    sendToWhatsApp(whatsappMessage);
    
    // Marcar como enviado si no lo estaba
    if (!order.whatsappSent) {
        markOrderAsSent(orderId);
        renderOrdersList();
        updateOrderStats();
    }
}

// ============================================
// ADMIN FUNCTIONS (Para ver pedidos guardados)
// ============================================
function viewAllOrders() {
    const orders = getAllOrders();
    console.log('=== PEDIDOS GUARDADOS ===');
    console.log(`Total: ${orders.length} pedidos`);
    console.table(orders);
    return orders;
}

// Función para limpiar pedidos antiguos (más de 30 días)
function cleanOldOrders() {
    const orders = getAllOrders();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate > thirtyDaysAgo;
    });
    
    localStorage.setItem('kalevshoes_orders', JSON.stringify(filteredOrders));
    const deleted = orders.length - filteredOrders.length;
    console.log(`Pedidos limpiados. Eliminados: ${deleted}`);
    showNotification(`${deleted} pedidos antiguos eliminados`, 'success');
    
    if (document.getElementById('adminPanel')?.classList.contains('active')) {
        loadAdminPanel();
    }
}

// ============================================
// PRODUCT MANAGEMENT (Admin)
// ============================================
function renderAdminProductsList() {
    const container = document.getElementById('adminProductsContainer');
    if (!container) return;
    
    const activeProducts = products.filter(p => p.active !== false);
    
    container.innerHTML = `
        <div class="admin-products-header">
            <h4><i class="fas fa-box"></i> Gestión de Productos</h4>
            <button class="btn btn-primary" onclick="openAddProductModal()">
                <i class="fas fa-plus"></i> Agregar Producto
            </button>
        </div>
        <div class="admin-products-stats">
            <div class="stat-box">
                <div class="stat-value">${products.length}</div>
                <div class="stat-label">Total Productos</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${activeProducts.length}</div>
                <div class="stat-label">Activos</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${products.length - activeProducts.length}</div>
                <div class="stat-label">Inactivos</div>
            </div>
        </div>
        <div class="admin-products-list" id="adminProductsList">
            ${renderProductsListItems(products)}
        </div>
    `;
}

function renderProductsListItems(productsList) {
    if (productsList.length === 0) {
        return `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No hay productos registrados</p>
                <button class="btn btn-primary" onclick="openAddProductModal()" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Agregar Primer Producto
                </button>
            </div>
        `;
    }
    
    return productsList.map(product => `
        <div class="admin-product-item ${product.active === false ? 'inactive' : ''}">
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.reference}" onerror="this.src='https://via.placeholder.com/100x100?text=Sin+Imagen'">
            </div>
            <div class="admin-product-info">
                <h4>${product.reference}</h4>
                <p><strong>Categoría:</strong> ${product.category}</p>
                <p><strong>Precio:</strong> ${product.priceFormatted}</p>
                <p><strong>Estado:</strong> <span class="product-status ${product.active === false ? 'inactive' : 'active'}">${product.active === false ? 'Inactivo' : 'Activo'}</span></p>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-secondary btn-sm" onclick="openEditProductModal('${product.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="toggleProductStatus('${product.id}')">
                    <i class="fas fa-${product.active === false ? 'check' : 'times'}"></i> ${product.active === false ? 'Activar' : 'Desactivar'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function openAddProductModal() {
    showProductModal();
}

function openEditProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    showProductModal(product);
}

function showProductModal(product = null) {
    const isEdit = product !== null;
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.id = 'productModalAdmin';
    modal.innerHTML = `
        <div class="admin-modal-backdrop" onclick="closeProductModal()"></div>
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i> ${isEdit ? 'Editar' : 'Agregar'} Producto</h3>
                <button class="admin-modal-close" onclick="closeProductModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="admin-modal-body">
                <form id="productForm">
                    <div class="form-group">
                        <label for="productReference">Referencia *</label>
                        <input type="text" id="productReference" value="${product?.reference || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="productCategory">Categoría *</label>
                        <select id="productCategory" required>
                            ${categories.map(cat => `<option value="${cat}" ${product?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="productPrice">Precio *</label>
                        <input type="number" id="productPrice" value="${product?.price || ''}" min="0" step="1000" required>
                    </div>
                    <div class="form-group">
                        <label for="productDescription">Descripción *</label>
                        <textarea id="productDescription" rows="3" required>${product?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="productImage">URL de Imagen *</label>
                        <input type="url" id="productImage" value="${product?.image || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="productActive" ${product?.active !== false ? 'checked' : ''}>
                            Producto Activo
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeProductModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> ${isEdit ? 'Guardar Cambios' : 'Agregar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listener para el formulario
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct(product?.id);
    });
}

function saveProduct(productId = null) {
    const reference = document.getElementById('productReference').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    const image = document.getElementById('productImage').value.trim();
    const active = document.getElementById('productActive').checked;
    
    if (!reference || !category || !price || !description || !image) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    if (productId) {
        // Editar producto existente
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                reference,
                category,
                price,
                priceFormatted: `$${price.toLocaleString('es-CO')}`,
                description,
                image,
                active
            };
            showNotification('Producto actualizado correctamente', 'success');
        }
    } else {
        // Agregar nuevo producto
        const newProduct = {
            id: reference,
            reference,
            category,
            price,
            priceFormatted: `$${price.toLocaleString('es-CO')}`,
            description,
            image,
            colors: [],
            sizes: ['35', '36', '37', '38', '39', '40', '41'],
            active,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        showNotification('Producto agregado correctamente', 'success');
    }
    
    saveProducts();
    closeProductModal();
    renderAdminProductsList();
    renderCatalog(); // Actualizar catálogo público
}

function toggleProductStatus(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    product.active = product.active === false ? true : false;
    saveProducts();
    renderAdminProductsList();
    renderCatalog();
    showNotification(`Producto ${product.active ? 'activado' : 'desactivado'} correctamente`, 'success');
}

function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        renderAdminProductsList();
        renderCatalog();
        showNotification('Producto eliminado correctamente', 'success');
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModalAdmin');
    if (modal) {
        modal.remove();
    }
}

function renderAdminStats() {
    const container = document.getElementById('adminStatsContainer');
    if (!container) return;
    
    const orders = getAllOrders();
    const stats = getOrderStats();
    const activeProducts = products.filter(p => p.active !== false).length;
    
    // Calcular total de ingresos (aproximado)
    let totalRevenue = 0;
    orders.forEach(order => {
        if (order.products && order.products.length > 0) {
            order.products.forEach(item => {
                totalRevenue += item.price * item.totalPairs;
            });
        }
    });
    
    container.innerHTML = `
        <div class="admin-stats-grid">
            <div class="stat-card-large">
                <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
                <div class="stat-content">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Pedidos</div>
                </div>
            </div>
            <div class="stat-card-large">
                <div class="stat-icon"><i class="fas fa-box"></i></div>
                <div class="stat-content">
                    <div class="stat-value">${activeProducts}</div>
                    <div class="stat-label">Productos Activos</div>
                </div>
            </div>
            <div class="stat-card-large">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-content">
                    <div class="stat-value">${stats.enviados}</div>
                    <div class="stat-label">Pedidos Enviados</div>
                </div>
            </div>
            <div class="stat-card-large">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-content">
                    <div class="stat-value">$${totalRevenue.toLocaleString('es-CO')}</div>
                    <div class="stat-label">Ingresos Totales</div>
                </div>
            </div>
        </div>
        <div class="admin-stats-charts">
            <h4>Pedidos por Tipo</h4>
            <div class="stats-chart">
                ${Object.entries(stats.porTipo).map(([tipo, count]) => `
                    <div class="chart-bar">
                        <div class="chart-label">${getSubjectLabel(tipo)}</div>
                        <div class="chart-value-bar">
                            <div class="chart-fill" style="width: ${(count / stats.total) * 100}%"></div>
                            <span class="chart-count">${count}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Exponer funciones globales
window.closeAdminPanel = closeAdminPanel;
window.viewOrderDetails = viewOrderDetails;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.closeProductModal = closeProductModal;

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================
function initializeApp() {

        console.log('🚀 Inicializando Kaleb Shoes...');
        
        // Verificar secciones
        verifySections();
        
        // Verificar que los productos se generaron
        const allProducts = getProducts();
        if (!allProducts || allProducts.length === 0) {
            console.warn('⚠️ No se encontraron productos. Se cargarán desde shared-functions.js');
        } else {
            console.log(`✓ ${allProducts.length} productos disponibles`);
        }
        
        // Verificar elementos del DOM
        const catalogGrid = document.getElementById('catalogGrid');
        
        if (!catalogGrid) {
            console.error('❌ No se encontró catalogGrid en el DOM');
        } else {
            console.log('✓ Elemento catalogGrid encontrado');
        }
        
    // Render initial catalog - esperar a que los productos se carguen
    if (catalogGrid) {
        // Esperar un momento para que shared-functions.js cargue los productos
        setTimeout(() => {
            const allProducts = getProducts();
            if (allProducts.length > 0) {
                renderCatalog();
            } else {
                console.warn('⚠️ No hay productos disponibles aún, reintentando...');
                setTimeout(() => {
                    renderCatalog();
                }, 500);
            }
        }, 200);
    } else {
        console.error('❌ No se puede renderizar el catálogo: catalogGrid no existe');
    }
    
    // Inicializar carrito
    updateCart();
    console.log('✓ Carrito inicializado');
        
        // Llenar selector de productos
        try {
            populateProductSelect();
        } catch (error) {
            console.error('❌ Error poblando selector de productos:', error);
        }
        
        // Verificar y configurar formulario de contacto
        setupFormListeners();
        setupProductSelector();
        
        // Verificar que los elementos del formulario existan
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            console.log('✓ Formulario de contacto encontrado y configurado');
        } else {
            console.error('❌ Formulario de contacto no encontrado');
        }
        
        // Add filter event listeners
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const materialFilter = document.getElementById('materialFilter');
        const seasonFilter = document.getElementById('seasonFilter');
        const collectionFilter = document.getElementById('collectionFilter');
        const productSearch = document.getElementById('productSearch');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de categoría configurado');
        } else {
            console.warn('⚠️ Filtro de categoría no encontrado');
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de ordenamiento configurado');
        } else {
            console.warn('⚠️ Filtro de ordenamiento no encontrado');
        }
        
        if (materialFilter) {
            materialFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de material configurado');
        } else {
            console.warn('⚠️ Filtro de material no encontrado');
        }
        
        if (seasonFilter) {
            seasonFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de temporada configurado');
        } else {
            console.warn('⚠️ Filtro de temporada no encontrado');
        }
        
        if (collectionFilter) {
            collectionFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de colección configurado');
        } else {
            console.warn('⚠️ Filtro de colección no encontrado');
        }
        
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    applyFilters();
                }, 300);
            });
            console.log('✓ Búsqueda de productos configurada');
        }
        
        // Limpiar pedidos antiguos al cargar
        try {
            cleanOldOrders();
        } catch (error) {
            console.error('Error limpiando pedidos antiguos:', error);
        }
        
        // Customer access button
        const customerAccessBtn = document.getElementById('customerAccessBtn');
        if (customerAccessBtn) {
            customerAccessBtn.addEventListener('click', openCustomerAccessModal);
            console.log('✓ Botón de acceso cliente configurado');
        }
        
        // Update customer badge on load
        updateCustomerBadge();
        
        // Customer access modal close
        document.getElementById('customerAccessClose')?.addEventListener('click', closeCustomerAccessModal);
        document.getElementById('customerAccessBackdrop')?.addEventListener('click', closeCustomerAccessModal);
        
        // Customer logout button
        const customerLogoutBtn = document.getElementById('customerLogoutBtn');
        if (customerLogoutBtn) {
            customerLogoutBtn.addEventListener('click', logoutCustomer);
        }
        
        // Admin access button
        const adminAccessBtn = document.getElementById('adminAccessBtn');
        if (adminAccessBtn) {
            adminAccessBtn.addEventListener('click', () => {
                window.location.href = 'admin.html';
            });
            console.log('✓ Botón de acceso administrador configurado');
        }
        
        // Admin access modal close
        document.getElementById('adminAccessClose')?.addEventListener('click', closeAdminAccessModal);
        document.getElementById('adminAccessBackdrop')?.addEventListener('click', closeAdminAccessModal);
        
        // Admin logout button
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', logoutAdmin);
        }
        
        // Check admin status on load
        checkAdminStatus();
        console.log('✓ Sistema de autenticación configurado');
        
        // Exponer funciones de administración en consola
        window.kalevshoesAdmin = {
            viewOrders: viewAllOrders,
            cleanOrders: cleanOldOrders,
            getOrdersCount: () => getAllOrders().length,
            getStats: getOrderStats,
            openPanel: openAdminPanel,
            closePanel: closeAdminPanel,
            reloadCatalog: () => {
                console.log('🔄 Recargando catálogo...');
                renderCatalog();
            },
            checkProducts: () => {
                const allProducts = getProducts();
                console.log(`📦 Total de productos: ${allProducts.length}`);
                console.table(allProducts.slice(0, 10));
                return allProducts.length;
            },
            diagnose: () => {
                console.log('\n🔍 === DIAGNÓSTICO KALEV SHOES ===\n');
                
                // Verificar productos
                const allProducts = getProducts();
                console.log(`📦 Productos: ${allProducts.length} disponibles`);
                if (allProducts.length === 0) {
                    console.error('❌ PROBLEMA: No hay productos disponibles');
                } else {
                    console.log('✅ Productos OK');
                }
                
                // Verificar elementos del DOM
                const elements = {
                    'catalogGrid': document.getElementById('catalogGrid'),
                    'contactForm': document.getElementById('contactForm'),
                    'categoryFilter': document.getElementById('categoryFilter'),
                    'sortFilter': document.getElementById('sortFilter'),
                    'materialFilter': document.getElementById('materialFilter'),
                    'seasonFilter': document.getElementById('seasonFilter'),
                    'collectionFilter': document.getElementById('collectionFilter'),
                    'productSearch': document.getElementById('productSearch')
                };
                
                console.log('\n📋 Elementos del DOM:');
                Object.keys(elements).forEach(key => {
                    if (elements[key]) {
                        console.log(`✅ ${key}: Encontrado`);
                    } else {
                        console.error(`❌ ${key}: NO ENCONTRADO`);
                    }
                });
                
                // Verificar librerías
                console.log('\n📚 Librerías:');
                console.log(typeof AOS !== 'undefined' ? '✅ AOS: Disponible' : '⚠️ AOS: No disponible');
                
                // Verificar secciones
                console.log('\n📄 Secciones:');
                const sections = ['inicio', 'catalogo', 'nosotros', 'proceso', 'contacto'];
                sections.forEach(id => {
                    const section = document.getElementById(id);
                    console.log(section ? `✅ #${id}` : `❌ #${id} NO ENCONTRADA`);
                });
                
                // Estado del catálogo
                const grid = document.getElementById('catalogGrid');
                if (grid) {
                    const cards = grid.querySelectorAll('.product-card');
                    console.log(`\n🖼️ Catálogo: ${cards.length} productos mostrados`);
                    if (cards.length === 0 && products.length > 0) {
                        console.error('❌ PROBLEMA: Hay productos pero no se están mostrando');
                        console.log('💡 Solución: Ejecuta kalevshoesAdmin.reloadCatalog()');
                    }
                }
                
                console.log('\n✅ Diagnóstico completo\n');
            }
        };
        
        console.log('\n✅ Kaleb Shoes - Inicialización completa');
        console.log(`📦 Productos disponibles: ${products.length}`);
        console.log(`💾 Pedidos guardados: ${getAllOrders().length}`);
    console.log('\n=== FUNCIONES DE ADMINISTRACIÓN ===');
    console.log('Usa estas funciones en la consola:');
    console.log('- kalevshoesAdmin.diagnose() - 🔍 DIAGNÓSTICO COMPLETO (ejecuta esto si hay problemas)');
    console.log('- kalevshoesAdmin.viewOrders() - Ver todos los pedidos');
    console.log('- kalevshoesAdmin.cleanOrders() - Limpiar pedidos antiguos');
    console.log('- kalevshoesAdmin.getOrdersCount() - Contar pedidos');
    console.log('- kalevshoesAdmin.reloadCatalog() - Recargar catálogo');
    console.log('- kalevshoesAdmin.checkProducts() - Verificar productos');
    
    // Ejecutar diagnóstico automático si hay problemas
    setTimeout(() => {
        const grid = document.getElementById('catalogGrid');
        if (grid && products.length > 0) {
            const cards = grid.querySelectorAll('.product-card');
            if (cards.length === 0) {
                console.warn('\n⚠️ ADVERTENCIA: Los productos no se están mostrando');
                console.log('💡 Ejecuta: kalevshoesAdmin.diagnose() para ver qué está pasando');
                console.log('💡 O ejecuta: kalevshoesAdmin.reloadCatalog() para forzar la recarga\n');
            }
        }
    }, 2000);

    // Inicializar menú móvil
    initMobileMenu();
    console.log('✓ Menú móvil inicializado');
} // Fin de initializeApp()

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM ya está listo
    initializeApp();
}
