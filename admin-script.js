// ============================================
// ADMIN PANEL SCRIPT
// ============================================

const ADMIN_CREDENTIALS = {
    username: 'kalevadmin',
    password: 'kalev2025'
};

// ============================================
// AUTHENTICATION
// ============================================
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLogged') === 'true';
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    const loginScreen = document.getElementById('adminLoginScreen');
    const dashboard = document.getElementById('adminDashboard');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
}

function showDashboard() {
    const loginScreen = document.getElementById('adminLoginScreen');
    const dashboard = document.getElementById('adminDashboard');
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) {
        dashboard.style.display = 'flex';
        loadDashboard();
    }
}

function handleAdminLogin(e) {
    if (e) e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const errorDiv = document.getElementById('adminLoginError');
    const errorText = document.getElementById('adminLoginErrorText');
    
    if (!username || !password) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLogged', 'true');
        showDashboard();
    } else {
        showError('Usuario o contraseña incorrectos');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('adminLoginError');
    const errorText = document.getElementById('adminLoginErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function logoutAdmin() {
    localStorage.removeItem('adminLogged');
    showLogin();
    document.getElementById('adminLoginForm').reset();
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Update nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}Section`);
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'orders': 'Pedidos',
        'products': 'Productos',
        'stats': 'Estadísticas'
    };
    document.getElementById('adminPageTitle').textContent = titles[sectionName] || 'Dashboard';
    
    // Load section content
    if (sectionName === 'dashboard') {
        loadDashboard();
    } else if (sectionName === 'orders') {
        loadOrders();
    } else if (sectionName === 'products') {
        loadProducts();
    } else if (sectionName === 'stats') {
        loadStats();
    }
}

// ============================================
// DASHBOARD
// ============================================
function loadDashboard() {
    const stats = getOrderStats();
    const activeProducts = products.filter(p => p.active !== false).length;
    
    document.getElementById('statTotalOrders').textContent = stats.total;
    document.getElementById('statTotalProducts').textContent = activeProducts;
    document.getElementById('statSentOrders').textContent = stats.enviados;
    
    // Calculate revenue
    let totalRevenue = 0;
    const orders = getAllOrders();
    orders.forEach(order => {
        if (order.products && order.products.length > 0) {
            order.products.forEach(item => {
                totalRevenue += item.price * item.totalPairs;
            });
        }
    });
    document.getElementById('statTotalRevenue').textContent = `$${totalRevenue.toLocaleString('es-CO')}`;
    
    // Update badges
    document.getElementById('ordersBadge').textContent = stats.total;
    document.getElementById('productsBadge').textContent = activeProducts;
    
    // Load recent orders
    loadRecentOrders();
}

function loadRecentOrders() {
    const orders = getAllOrders().slice(0, 5);
    const container = document.getElementById('recentOrdersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No hay pedidos recientes</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="recent-order-item">
            <div class="recent-order-info">
                <h4>${order.name}</h4>
                <p>${order.dateFormatted || new Date(order.timestamp).toLocaleString('es-CO')}</p>
            </div>
            <div class="recent-order-status">
                <span class="order-badge ${order.whatsappSent ? 'badge-enviado' : 'badge-nuevo'}">
                    ${order.whatsappSent ? 'Enviado' : 'Nuevo'}
                </span>
            </div>
        </div>
    `).join('');
}

// ============================================
// ORDERS
// ============================================
function loadOrders() {
    const orders = getAllOrders();
    const container = document.getElementById('adminOrdersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No hay pedidos</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => {
        const status = order.status || 'nuevo';
        const statusLabels = {
            'nuevo': 'Nuevo',
            'en_proceso': 'En Proceso',
            'enviado': 'Enviado',
            'completado': 'Completado'
        };
        const statusClasses = {
            'nuevo': 'badge-nuevo',
            'en_proceso': 'badge-proceso',
            'enviado': 'badge-enviado',
            'completado': 'badge-completado'
        };
        
        return `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-name">${order.name}</div>
                    <div class="order-date">${order.dateFormatted || new Date(order.timestamp).toLocaleString('es-CO')}</div>
                </div>
                <div class="order-status-controls">
                    <select class="order-status-select" onchange="updateOrderStatus(${order.id}, this.value)" data-order-id="${order.id}">
                        <option value="nuevo" ${status === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                        <option value="en_proceso" ${status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="enviado" ${status === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="completado" ${status === 'completado' ? 'selected' : ''}>Completado</option>
                    </select>
                    <span class="order-badge ${statusClasses[status] || 'badge-nuevo'}">
                        ${statusLabels[status] || 'Nuevo'}
                    </span>
                </div>
            </div>
            <div class="order-details">
                <div><strong>Tipo:</strong> ${getSubjectLabel(order.subject)}</div>
                <div><strong>Teléfono:</strong> ${order.phone}</div>
                ${order.email ? `<div><strong>Email:</strong> ${order.email}</div>` : ''}
                ${order.products && order.products.length > 0 ? `
                    <div><strong>Productos:</strong> ${order.products.length} item(s) - ${order.totalPairs || 0} par(es)</div>
                ` : ''}
                <div style="margin-top: 0.5rem;">${order.message.substring(0, 150)}${order.message.length > 150 ? '...' : ''}</div>
            </div>
        </div>
    `;
    }).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getAllOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        orders[orderIndex].statusUpdatedAt = new Date().toISOString();
        localStorage.setItem('kalevshoes_orders', JSON.stringify(orders));
        loadOrders();
        loadDashboard(); // Actualizar dashboard también
        showNotification('Estado del pedido actualizado correctamente', 'success');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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

// Agregar estilos para notificaciones
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
        border-left-color: var(--success);
    }
    
    .notification-error {
        border-left-color: var(--error);
    }
    
    .notification i {
        font-size: 1.2rem;
        color: var(--primary);
    }
    
    .notification-success i {
        color: var(--success);
    }
    
    .notification-error i {
        color: var(--error);
    }
`;
document.head.appendChild(notificationStyle);

// ============================================
// PRODUCTS
// ============================================
function loadProducts() {
    const activeProducts = products.filter(p => p.active !== false);
    const inactiveProducts = products.filter(p => p.active === false);
    
    document.getElementById('productsTotal').textContent = products.length;
    document.getElementById('productsActive').textContent = activeProducts.length;
    document.getElementById('productsInactive').textContent = inactiveProducts.length;
    
    renderProductsList();
}

function renderProductsList() {
    const container = document.getElementById('adminProductsList');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No hay productos registrados</p>
                <button class="btn btn-primary" onclick="openAddProductModal()" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Agregar Primer Producto
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
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
                <button class="btn btn-warning btn-sm" onclick="toggleProductStatus('${product.id}')">
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
        alert('Producto no encontrado');
        return;
    }
    showProductModal(product);
}

function showProductModal(product = null) {
    const isEdit = product !== null;
    const modal = document.getElementById('productModalAdmin');
    const title = document.getElementById('productModalTitle');
    const submitText = document.getElementById('productFormSubmitText');
    
    if (isEdit) {
        title.innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
        submitText.textContent = 'Guardar Cambios';
        document.getElementById('productReference').value = product.reference;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productActive').checked = product.active !== false;
        document.getElementById('productReference').disabled = true;
    } else {
        title.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
        submitText.textContent = 'Agregar Producto';
        document.getElementById('productForm').reset();
        document.getElementById('productActive').checked = true;
        document.getElementById('productReference').disabled = false;
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModalAdmin').style.display = 'none';
}

function saveProduct(productId = null) {
    const reference = document.getElementById('productReference').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    const image = document.getElementById('productImage').value.trim();
    const active = document.getElementById('productActive').checked;
    
    if (!reference || !category || !price || !description || !image) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    if (productId) {
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
        }
    } else {
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
    }
    
    saveProducts();
    closeProductModal();
    loadProducts();
    alert('Producto guardado correctamente');
}

function toggleProductStatus(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    product.active = product.active === false ? true : false;
    saveProducts();
    loadProducts();
}

function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        loadProducts();
    }
}

// ============================================
// STATS
// ============================================
function loadStats() {
    const stats = getOrderStats();
    const container = document.getElementById('adminStatsContainer');
    
    let totalRevenue = 0;
    const orders = getAllOrders();
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
                            <div class="chart-fill" style="width: ${stats.total > 0 ? (count / stats.total) * 100 : 0}%"></div>
                            <span class="chart-count">${count}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================
// INITIALIZATION
// ============================================
function initializeAdmin() {
    // Verificar que las funciones compartidas estén disponibles
    if (typeof getAllOrders === 'undefined' || typeof getOrderStats === 'undefined') {
        console.error('Error: Las funciones compartidas no están disponibles');
        setTimeout(initializeAdmin, 100);
        return;
    }
    
    checkAdminAuth();
    
    if (typeof initTheme !== 'undefined') {
        initTheme();
    }
    
    initNavigation();
    
    // Form handlers
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
    }
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const productId = document.getElementById('productReference').disabled 
                ? document.getElementById('productReference').value 
                : null;
            saveProduct(productId);
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeAdmin);

