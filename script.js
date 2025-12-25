// ============================================
// INITIALIZATION
// ============================================

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

// ============================================
// PRODUCT CATALOG DATA
// ============================================
const products = [];

const categories = ['Plataformas', 'Planas', 'De Goma', 'Melisa', 'Tacón', 'Sandalias', 'Botas', 'Deportivos'];
const colors = ['Negro', 'Blanco', 'Rosa', 'Azul', 'Rojo', 'Beige', 'Plateado'];
const sizes = ['35', '36', '37', '38', '39', '40', '41'];

// Generate products from J260 to J320
console.log('📦 Generando productos...');
try {
for (let i = 260; i <= 320; i++) {
        const numColors = Math.floor(Math.random() * 4) + 1;
        const numSizes = Math.floor(Math.random() * 5) + 3;
        const productColors = colors.slice(0, numColors);
        const productSizes = sizes.slice(0, numSizes);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = (Math.floor(Math.random() * 100) + 100) * 1000;
        
        products.push({
            id: `J${i}`,
            reference: `J${i}`,
            category: category,
            price: price,
            priceFormatted: `$${price.toLocaleString('es-CO')}`,
            description: `Zapato elegante modelo J${i}, perfecto para ocasiones especiales. Diseñado con materiales premium y atención al detalle para brindar máximo confort y estilo.`,
            colors: productColors,
            sizes: productSizes,
            image: `https://via.placeholder.com/400x300?text=CT+Shoes+J${i}`
        });
    }
    console.log(`✅ ${products.length} productos generados correctamente`);
} catch (error) {
    console.error('❌ Error generando productos:', error);
}

// ============================================
// RENDER CATALOG
// ============================================
function renderCatalog(filteredProducts = products) {
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
                    <img src="${product.image}" alt="${product.reference}" class="product-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=CT+Shoes+${product.reference}'">
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
// FILTER FUNCTIONALITY
// ============================================
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const priceFilter = document.getElementById('priceFilter')?.value || '';
    
    let filtered = products;
    
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    if (priceFilter) {
        filtered = filtered.filter(p => {
            return priceFilter === 'low' ? p.price < 150000 : p.price >= 150000;
        });
    }
    
    const grid = document.getElementById('catalogGrid');
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        renderCatalog(filtered);
        grid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
    }, 300);
}

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

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
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
    showNotification('Producto eliminado del carrito', 'success');
}

// Ir al checkout
window.goToCheckout = function() {
    if (shoppingCart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
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
        }
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
// ⚠️ IMPORTANTE: Cambia este número por tu número real de WhatsApp
// Formato: código de país + número (sin espacios, sin +, sin guiones)
// Ejemplo: 573001234567 (Colombia) o 521234567890 (México)
const WHATSAPP_NUMBER = '573205891435';

// ============================================
// EMAIL CONFIGURATION
// ============================================
const CONTACT_EMAIL = 'bermudezdeibys51@gmail.com';

// ============================================
// LOCAL STORAGE DATABASE (Pedidos)
// ============================================
function saveOrderToDatabase(orderData) {
    try {
        // Obtener pedidos existentes
        const existingOrders = JSON.parse(localStorage.getItem('ctshoes_orders') || '[]');
        
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
        
        localStorage.setItem('ctshoes_orders', JSON.stringify(existingOrders));
        
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
            localStorage.setItem('ctshoes_orders', JSON.stringify(orders));
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
        const orders = JSON.parse(localStorage.getItem('ctshoes_orders') || '[]');
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
    if (statsPanel) {
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
const contactForm = document.getElementById('contactForm');
const subjectSelect = document.getElementById('subject');
const productSelectGroup = document.getElementById('productSelectGroup');
const productSelect = document.getElementById('productSelect');

// Mostrar selector de productos cuando se selecciona "pedido"
subjectSelect?.addEventListener('change', (e) => {
    if (e.target.value === 'pedido') {
        productSelectGroup.style.display = 'block';
        productSelect.required = false; // Opcional
    } else {
        productSelectGroup.style.display = 'none';
        productSelect.required = false;
    }
});

// Llenar selector de productos
function populateProductSelect() {
    try {
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
function formatWhatsAppMessage(formData) {
    const { name, phone, email, subject, message } = formData;
    
    // Formato mejorado para WhatsApp
    let whatsappMessage = `👋 *Hola! Soy ${name}*\n\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `📋 *INFORMACIÓN DEL PEDIDO*\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
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
        shoppingCart.forEach((item, index) => {
            whatsappMessage += `${index + 1}. *${item.reference}* - ${item.category}\n`;
            whatsappMessage += `   Precio: ${item.priceFormatted}\n`;
            
            // Agregar tallas y cantidades
            const sizesList = Object.entries(item.sizes)
                .filter(([size, qty]) => qty > 0)
                .map(([size, qty]) => `Talla ${size}: ${qty} par${qty > 1 ? 'es' : ''}`)
                .join(', ');
            
            whatsappMessage += `   ${sizesList}\n`;
            whatsappMessage += `   Total: ${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}\n\n`;
            
            totalPairs += item.totalPairs;
        });
        
        whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
        whatsappMessage += `📊 *TOTAL GENERAL:* ${totalPairs} par${totalPairs > 1 ? 'es' : ''}\n\n`;
    }
    
    whatsappMessage += `💬 *MENSAJE:*\n`;
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `${message}\n\n`;
    
    whatsappMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
    whatsappMessage += `_📱 Enviado desde CT Shoes - Catálogo Web_\n`;
    whatsappMessage += `_Fabricante: Juan Gregorio Dávila Zoraca_`;
    
    return whatsappMessage;
}

// Formatear mensaje para Email
function formatEmailMessage(formData) {
    const { name, phone, email, subject, message } = formData;
    
    const subjectLine = `Nuevo ${getSubjectLabel(subject)} - CT Shoes - ${name}`;
    
    let emailBody = `Hola,\n\n`;
    emailBody += `Has recibido un nuevo ${getSubjectLabel(subject).toLowerCase()} desde el catálogo web de CT Shoes.\n\n`;
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
    emailBody += `Este mensaje fue enviado desde el catálogo web de CT Shoes.\n`;
    emailBody += `Fabricante: Juan Gregorio Dávila Zoraca\n`;
    emailBody += `Fecha: ${new Date().toLocaleString('es-CO')}\n`;
    
    return {
        subject: subjectLine,
        body: emailBody
    };
}

// Enviar por Email usando mailto
function sendToEmail(formData) {
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

// Manejar clic en botón de WhatsApp
document.getElementById('submitBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    sendType = 'whatsapp';
    handleFormSubmit();
});

// Manejar clic en botón de Email
document.getElementById('emailBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    sendType = 'email';
    handleFormSubmit();
});

// Función para manejar el envío del formulario
function handleFormSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    const emailBtn = document.getElementById('emailBtn');
    const originalHTML = submitBtn.innerHTML;
    const originalEmailHTML = emailBtn.innerHTML;
    
    // Obtener datos del formulario
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value,
        productSelect: document.getElementById('productSelect').value,
        message: document.getElementById('message').value.trim()
    };
    
    // Validación
    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
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
            const emailSent = sendToEmail(formData);
            
            if (emailSent) {
                // Marcar como enviado por email
                const orders = getAllOrders();
                const orderIndex = orders.findIndex(o => o.id === savedOrder.id);
                if (orderIndex !== -1) {
                    orders[orderIndex].emailSent = true;
                    orders[orderIndex].emailSentAt = new Date().toISOString();
                    localStorage.setItem('ctshoes_orders', JSON.stringify(orders));
                }
            }
            
            // Mostrar éxito
            emailBtn.innerHTML = '<i class="fas fa-check"></i> <span>¡Guardado! Abriendo email...</span>';
            emailBtn.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
        }
        
        // Resetear formulario después de un momento
        setTimeout(() => {
            contactForm.reset();
            productSelectGroup.style.display = 'none';
            submitBtn.innerHTML = originalHTML;
            emailBtn.innerHTML = originalEmailHTML;
            submitBtn.style.background = '';
            emailBtn.style.background = '';
            submitBtn.disabled = false;
            emailBtn.disabled = false;
            
            const message = sendType === 'whatsapp' 
                ? '✅ Pedido guardado y WhatsApp abierto con tu mensaje.'
                : '✅ Pedido guardado y email abierto con tu mensaje.';
            showNotification(message, 'success');
            
            // Limpiar carrito después de enviar
            shoppingCart = [];
            updateCart();
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
// ADMIN PANEL
// ============================================
function openAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.add('active');
        loadAdminPanel();
    }
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('active');
    }
}

function loadAdminPanel() {
    updateOrderStats();
    renderOrdersList();
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

function exportOrders() {
    const orders = getAllOrders();
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_ctshoes_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Pedidos exportados exitosamente', 'success');
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
    
    localStorage.setItem('ctshoes_orders', JSON.stringify(filteredOrders));
    const deleted = orders.length - filteredOrders.length;
    console.log(`Pedidos limpiados. Eliminados: ${deleted}`);
    showNotification(`${deleted} pedidos antiguos eliminados`, 'success');
    
    if (document.getElementById('adminPanel')?.classList.contains('active')) {
        loadAdminPanel();
    }
}

// Exponer función global
window.closeAdminPanel = closeAdminPanel;
window.viewOrderDetails = viewOrderDetails;

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================
function initializeApp() {
    try {
        console.log('🚀 Inicializando CT Shoes...');
        
        // Verificar secciones
        verifySections();
        
        // Verificar que los productos se generaron
        if (!products || products.length === 0) {
            console.error('❌ No se generaron productos. Verificando...');
            // Los productos deberían estar generados antes de este punto
        } else {
            console.log(`✓ ${products.length} productos generados`);
        }
        
        // Verificar elementos del DOM
        const catalogGrid = document.getElementById('catalogGrid');
        const contactForm = document.getElementById('contactForm');
        
        if (!catalogGrid) {
            console.error('❌ No se encontró catalogGrid en el DOM');
        } else {
            console.log('✓ Elemento catalogGrid encontrado');
        }
        
        if (!contactForm) {
            console.error('❌ No se encontró contactForm en el DOM');
        } else {
            console.log('✓ Formulario de contacto encontrado');
        }
        
    // Render initial catalog
    if (catalogGrid) {
        renderCatalog();
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
        if (contactForm) {
            console.log('✓ Formulario de contacto encontrado y configurado');
            // El formulario ya tiene sus event listeners configurados arriba
        } else {
            console.error('❌ Formulario de contacto no encontrado');
        }
        
        // Add filter event listeners
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de categoría configurado');
        } else {
            console.warn('⚠️ Filtro de categoría no encontrado');
        }
        
        if (priceFilter) {
            priceFilter.addEventListener('change', applyFilters);
            console.log('✓ Filtro de precio configurado');
        } else {
            console.warn('⚠️ Filtro de precio no encontrado');
        }
        
        // Limpiar pedidos antiguos al cargar
        try {
            cleanOldOrders();
        } catch (error) {
            console.error('Error limpiando pedidos antiguos:', error);
        }
        
        // Admin panel toggle
        const adminToggle = document.getElementById('adminToggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                const panel = document.getElementById('adminPanel');
                if (panel?.classList.contains('active')) {
                    closeAdminPanel();
                } else {
                    openAdminPanel();
                }
            });
            console.log('✓ Panel de administración configurado');
        }
        
        // Exponer funciones de administración en consola
        window.ctshoesAdmin = {
            viewOrders: viewAllOrders,
            exportOrders: exportOrders,
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
                console.log(`📦 Total de productos: ${products.length}`);
                console.table(products.slice(0, 10));
                return products.length;
            },
            diagnose: () => {
                console.log('\n🔍 === DIAGNÓSTICO CT SHOES ===\n');
                
                // Verificar productos
                console.log(`📦 Productos: ${products.length} generados`);
                if (products.length === 0) {
                    console.error('❌ PROBLEMA: No hay productos generados');
                } else {
                    console.log('✅ Productos OK');
                }
                
                // Verificar elementos del DOM
                const elements = {
                    'catalogGrid': document.getElementById('catalogGrid'),
                    'contactForm': document.getElementById('contactForm'),
                    'categoryFilter': document.getElementById('categoryFilter'),
                    'priceFilter': document.getElementById('priceFilter'),
                    'productSelect': document.getElementById('productSelect')
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
                        console.log('💡 Solución: Ejecuta ctshoesAdmin.reloadCatalog()');
                    }
                }
                
                console.log('\n✅ Diagnóstico completo\n');
            }
        };
        
        console.log('\n✅ CT Shoes - Inicialización completa');
        console.log(`📦 Productos disponibles: ${products.length}`);
        console.log(`💾 Pedidos guardados: ${getAllOrders().length}`);
    console.log('\n=== FUNCIONES DE ADMINISTRACIÓN ===');
    console.log('Usa estas funciones en la consola:');
    console.log('- ctshoesAdmin.diagnose() - 🔍 DIAGNÓSTICO COMPLETO (ejecuta esto si hay problemas)');
    console.log('- ctshoesAdmin.viewOrders() - Ver todos los pedidos');
    console.log('- ctshoesAdmin.exportOrders() - Exportar pedidos a JSON');
    console.log('- ctshoesAdmin.cleanOrders() - Limpiar pedidos antiguos');
    console.log('- ctshoesAdmin.getOrdersCount() - Contar pedidos');
    console.log('- ctshoesAdmin.reloadCatalog() - Recargar catálogo');
    console.log('- ctshoesAdmin.checkProducts() - Verificar productos');
    
    // Ejecutar diagnóstico automático si hay problemas
    setTimeout(() => {
        const grid = document.getElementById('catalogGrid');
        if (grid && products.length > 0) {
            const cards = grid.querySelectorAll('.product-card');
            if (cards.length === 0) {
                console.warn('\n⚠️ ADVERTENCIA: Los productos no se están mostrando');
                console.log('💡 Ejecuta: ctshoesAdmin.diagnose() para ver qué está pasando');
                console.log('💡 O ejecuta: ctshoesAdmin.reloadCatalog() para forzar la recarga\n');
            }
        }
    }, 2000);
        
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        alert('Hubo un error al cargar la página. Por favor recarga.');
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM ya está listo
    initializeApp();
}
