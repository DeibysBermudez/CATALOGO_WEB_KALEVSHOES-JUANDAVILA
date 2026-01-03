// ============================================
// ADMIN PANEL SCRIPT - FIXED VERSION
// ============================================

const ADMIN_CREDENTIALS = {
    username: 'kalebadmin',
    password: 'kaleb2025'
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
        loadDashboardData();
    }
}

function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

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
// LOAD DASHBOARD DATA
// ============================================
function loadDashboardData() {
    console.log('📊 Cargando datos del dashboard...');
    
    // Actualizar estadísticas
    updateDashboardStats();
    
    // Cargar pedidos
    loadOrders();
    
    // Cargar productos
    loadProducts();
}

function updateDashboardStats() {
    const orders = getAllOrders();
    const stats = getOrderStats();
    
    // Total pedidos
    const statTotalOrders = document.getElementById('statTotalOrders');
    if (statTotalOrders) {
        statTotalOrders.textContent = stats.total;
    }
    
    // Total productos activos
    const statTotalProducts = document.getElementById('statTotalProducts');
    if (statTotalProducts && typeof products !== 'undefined') {
        const activeProducts = products.filter(p => p.active !== false);
        statTotalProducts.textContent = activeProducts.length;
    }
    
    // Calcular ingresos
    let totalRevenue = 0;
    orders.forEach(order => {
        if (order.products && order.products.length > 0) {
            order.products.forEach(item => {
                totalRevenue += item.price * item.totalPairs;
            });
        }
    });
    
    const statTotalRevenue = document.getElementById('statTotalRevenue');
    if (statTotalRevenue) {
        statTotalRevenue.textContent = `$${totalRevenue.toLocaleString('es-CO')}`;
    }
    
    // Calcular clientes únicos
    const uniqueCustomers = new Set();
    orders.forEach(order => {
        if (order.customerInfo && order.customerInfo.email) {
            uniqueCustomers.add(order.customerInfo.email);
        }
    });
    const statTotalCustomers = document.getElementById('statTotalCustomers');
    if (statTotalCustomers) {
        statTotalCustomers.textContent = uniqueCustomers.size;
    }
    
    // Calificación promedio (simulado, ya que no hay ratings reales)
    const statAvgRating = document.getElementById('statAvgRating');
    if (statAvgRating) {
        statAvgRating.textContent = '4.8'; // Placeholder
    }
    
    // Actualizar badges
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) {
        ordersBadge.textContent = stats.total;
    }
    
    const productsBadge = document.getElementById('productsBadge');
    if (productsBadge && typeof products !== 'undefined') {
        productsBadge.textContent = products.length;
    }
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
        loadDashboardData();
    } else if (sectionName === 'orders') {
        loadOrders();
    } else if (sectionName === 'products') {
        loadProducts();
    } else if (sectionName === 'stats') {
        loadStats();
    }
}

// ============================================
// ORDERS
// ============================================
function loadOrders() {
    const orders = getAllOrders();
    const container = document.getElementById('adminOrdersList');
    
    if (!container) {
        console.error('❌ No se encontró adminOrdersList');
        return;
    }
    
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
                    <select class="order-status-select" onchange="updateOrderStatus(${order.id}, this.value)">
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

// ============================================
// PRODUCTS
// ============================================
function loadProducts() {
    if (typeof products === 'undefined') {
        console.error('❌ Variable products no definida');
        return;
    }
    
    const activeProducts = products.filter(p => p.active !== false);
    const inactiveProducts = products.filter(p => p.active === false);
    
    const totalElement = document.getElementById('productsTotal');
    const activeElement = document.getElementById('productsActive');
    const inactiveElement = document.getElementById('productsInactive');
    
    if (totalElement) totalElement.textContent = products.length;
    if (activeElement) activeElement.textContent = activeProducts.length;
    if (inactiveElement) inactiveElement.textContent = inactiveProducts.length;
    
    renderProductsList();
}

function renderProductsList() {
    const container = document.getElementById('adminProductsList');
    
    if (!container) {
        console.error('❌ No se encontró adminProductsList');
        return;
    }
    
    if (typeof products === 'undefined' || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No hay productos registrados</p>
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
    const modal = document.getElementById('productModalAdmin');
    if (!modal) return;
    
    const isEdit = product !== null;
    const title = document.getElementById('productModalTitle');
    const submitText = document.getElementById('productFormSubmitText');
    
    if (title) {
        title.innerHTML = isEdit ? '<i class="fas fa-edit"></i> Editar Producto' : '<i class="fas fa-plus"></i> Agregar Producto';
    }
    
    if (submitText) {
        submitText.textContent = isEdit ? 'Guardar Cambios' : 'Agregar Producto';
    }
    
    if (isEdit) {
        document.getElementById('productReference').value = product.reference;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productActive').checked = product.active !== false;
        document.getElementById('productReference').disabled = true;
    } else {
        document.getElementById('productForm').reset();
        document.getElementById('productActive').checked = true;
        document.getElementById('productReference').disabled = false;
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('productModalAdmin');
    if (modal) {
        modal.style.display = 'none';
    }
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
    showNotification('Producto guardado correctamente', 'success');
}

function toggleProductStatus(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    product.active = product.active === false ? true : false;
    saveProducts();
    loadProducts();
    showNotification(`Producto ${product.active ? 'activado' : 'desactivado'}`, 'success');
}

function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        loadProducts();
        showNotification('Producto eliminado', 'success');
    }
}

// ============================================
// STATS
// ============================================
function loadStats() {
    const stats = getOrderStats();
    const container = document.getElementById('adminStatsContainer');
    
    if (!container) return;
    
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
// EXPORT ORDERS
// ============================================
function exportOrders() {
    try {
        const orders = getAllOrders();
        
        if (!orders || orders.length === 0) {
            alert('No hay pedidos para exportar');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            totalOrders: orders.length,
            orders: orders.map(order => ({
                id: order.id,
                timestamp: order.timestamp,
                dateFormatted: order.dateFormatted,
                status: order.status || 'nuevo',
                name: order.name,
                phone: order.phone,
                email: order.email || '',
                subject: order.subject,
                message: order.message,
                products: order.products || [],
                totalPairs: order.totalPairs || 0
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pedidos_kalev_shoes_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification(`${orders.length} pedidos exportados`, 'success');
    } catch (error) {
        console.error('Error al exportar pedidos:', error);
        alert('Error al exportar pedidos');
    }
}

// ============================================
// INITIALIZATION
// ============================================
function initializeAdmin() {
    console.log('🚀 Inicializando panel de administrador...');
    
    // Verificar funciones compartidas
    if (typeof getAllOrders === 'undefined' || typeof getOrderStats === 'undefined') {
        console.error('❌ Funciones compartidas no disponibles');
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
    
    console.log('✅ Panel de administrador inicializado');
}

document.addEventListener('DOMContentLoaded', initializeAdmin);

// Exponer funciones globales
window.updateOrderStatus = updateOrderStatus;
window.openEditProductModal = openEditProductModal;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.exportOrders = exportOrders;
window.openAddProductModal = openAddProductModal;
window.closeProductModal = closeProductModal;