// ============================================
// USER PANEL SCRIPT
// ============================================

// ============================================
// AUTHENTICATION
// ============================================
let currentUser = null;

function checkUserAuth() {
    const savedUser = localStorage.getItem('kalevshoes_current_customer');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    const loginScreen = document.getElementById('userLoginScreen');
    const dashboard = document.getElementById('userDashboard');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
}

function showDashboard() {
    const loginScreen = document.getElementById('userLoginScreen');
    const dashboard = document.getElementById('userDashboard');
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) {
        dashboard.style.display = 'flex';
        loadDashboard();
    }
}

function initTabs() {
    document.querySelectorAll('.user-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.user-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    document.getElementById('loginFormContainer').classList.toggle('active', tabName === 'login');
    document.getElementById('registerFormContainer').classList.toggle('active', tabName === 'register');
}

function handleUserLogin(e) {
    if (e) e.preventDefault();
    
    const phone = document.getElementById('userPhone').value.trim();
    const errorDiv = document.getElementById('userLoginError');
    const errorText = document.getElementById('userLoginErrorText');
    
    if (!phone) {
        showLoginError('Por favor ingresa tu número de teléfono');
        return;
    }
    
    // Check if user is registered
    const registeredUser = getUserByPhone(phone);
    
    if (registeredUser) {
        // Update last login
        const users = getRegisteredUsers();
        const userIndex = users.findIndex(u => u.id === registeredUser.id);
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('kalevshoes_users', JSON.stringify(users));
        }
        
        currentUser = {
            phone: registeredUser.phone,
            name: registeredUser.name,
            email: registeredUser.email,
            registeredAt: registeredUser.registeredAt
        };
        localStorage.setItem('kalevshoes_current_customer', JSON.stringify(currentUser));
        showDashboard();
    } else {
        // Check if user has orders
        const orders = getCustomerOrders(phone);
        
        if (orders.length === 0) {
            showLoginError('No se encontraron pedidos con ese número. ¿Deseas registrarte?');
            setTimeout(() => {
                document.querySelector('.user-tab[data-tab="register"]').click();
            }, 1000);
            return;
        }
        
        // User with orders but not registered
        const lastOrder = orders[0];
        currentUser = {
            phone: phone,
            name: lastOrder.name || 'Cliente',
            email: lastOrder.email || '',
            registeredAt: null
        };
        localStorage.setItem('kalevshoes_current_customer', JSON.stringify(currentUser));
        showDashboard();
    }
}

function handleUserRegister(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    
    if (!name || !phone) {
        showRegisterError('Por favor completa todos los campos requeridos');
        return;
    }
    
    const result = registerUser({ name, phone, email });
    
    if (result.success) {
        currentUser = {
            phone: result.user.phone,
            name: result.user.name,
            email: result.user.email,
            registeredAt: result.user.registeredAt
        };
        localStorage.setItem('kalevshoes_current_customer', JSON.stringify(currentUser));
        showDashboard();
    } else {
        showRegisterError(result.message || 'Error al registrar usuario');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('userLoginError');
    const errorText = document.getElementById('userLoginErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showRegisterError(message) {
    const errorDiv = document.getElementById('userRegisterError');
    const errorText = document.getElementById('userRegisterErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function logoutUser() {
    localStorage.removeItem('kalevshoes_current_customer');
    currentUser = null;
    showLogin();
    document.getElementById('userLoginForm').reset();
    document.getElementById('userRegisterForm').reset();
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    document.querySelectorAll('.user-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    document.querySelectorAll('.user-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });
    
    document.querySelectorAll('.user-section').forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}Section`);
    });
    
    const titles = {
        'orders': 'Mis Pedidos',
        'profile': 'Mi Perfil'
    };
    document.getElementById('userPageTitle').textContent = titles[sectionName] || 'Mi Cuenta';
    
    if (sectionName === 'orders') {
        loadOrders();
    } else if (sectionName === 'profile') {
        loadProfile();
    }
}

// ============================================
// DASHBOARD
// ============================================
function loadDashboard() {
    if (!currentUser) return;
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userPhoneDisplay').textContent = currentUser.phone;
    
    // Load orders
    loadOrders();
}

// ============================================
// ORDERS
// ============================================
function loadOrders() {
    if (!currentUser) return;
    
    const orders = getCustomerOrders(currentUser.phone);
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalPairs = orders.reduce((sum, order) => sum + (order.totalPairs || 0), 0);
    let totalSpent = 0;
    orders.forEach(order => {
        if (order.products && order.products.length > 0) {
            order.products.forEach(item => {
                totalSpent += item.price * item.totalPairs;
            });
        }
    });
    
    // Update stats
    document.getElementById('statTotalOrders').textContent = totalOrders;
    document.getElementById('statTotalPairs').textContent = totalPairs;
    document.getElementById('statTotalSpent').textContent = `$${totalSpent.toLocaleString('es-CO')}`;
    
    // Update badge
    document.getElementById('ordersBadge').textContent = totalOrders;
    
    // Render orders
    renderOrders(orders);
}

function renderOrders(orders) {
    const container = document.getElementById('userOrdersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No tienes pedidos aún</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-shopping-bag"></i> Ver Catálogo
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => {
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
                productsHtml += `
                    <li>
                        <strong>${item.reference}</strong> - ${item.category}<br>
                        <small>${sizesList} (${item.totalPairs} par${item.totalPairs > 1 ? 'es' : ''}) - ${item.priceFormatted} c/u</small><br>
                        <small>Subtotal: $${itemTotal.toLocaleString('es-CO')}</small>
                    </li>
                `;
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
    }).join('');
}

// ============================================
// PROFILE
// ============================================
function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileEmail').textContent = currentUser.email || 'No proporcionado';
    
    if (currentUser.registeredAt) {
        const date = new Date(currentUser.registeredAt);
        document.getElementById('profileDate').textContent = date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        document.getElementById('profileDate').textContent = 'No registrado (usuario con pedidos)';
    }
}

// ============================================
// INITIALIZATION
// ============================================
function initializeUser() {
    // Verificar que las funciones compartidas estén disponibles
    if (typeof getAllOrders === 'undefined' || typeof getUserByPhone === 'undefined') {
        console.error('Error: Las funciones compartidas no están disponibles');
        setTimeout(initializeUser, 100);
        return;
    }
    
    checkUserAuth();
    
    if (typeof initTheme !== 'undefined') {
        initTheme();
    }
    
    initTabs();
    initNavigation();
    
    // Form handlers
    const loginForm = document.getElementById('userLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleUserLogin);
    }
    
    const registerForm = document.getElementById('userRegisterForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleUserRegister);
    }
    
    const logoutBtn = document.getElementById('userLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
}

document.addEventListener('DOMContentLoaded', initializeUser);

