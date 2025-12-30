// ============================================
// SHARED FUNCTIONS - Used by all pages
// ============================================

// ============================================
// PRODUCT MANAGEMENT
// ============================================
let products = [];

const categories = ['Plataformas', 'Planas', 'De Goma', 'Melisa', 'Tacón', 'Sandalias', 'Botas', 'Deportivos'];
const colors = ['Negro', 'Blanco', 'Rosa', 'Azul', 'Rojo', 'Beige', 'Plateado'];
const sizes = ['35', '36', '37', '38', '39', '40', '41'];

// Cargar productos desde localStorage o generar iniciales
function loadProducts() {
    try {
        const savedProducts = localStorage.getItem('kalevshoes_products');
        if (savedProducts) {
            products = JSON.parse(savedProducts);
            console.log(`✅ ${products.length} productos cargados desde almacenamiento`);
            return;
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
    
    // Si no hay productos guardados, generar iniciales
    console.log('📦 Generando productos iniciales...');
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
                image: `https://via.placeholder.com/400x300?text=Kalev+Shoes+J${i}`,
                active: true,
                createdAt: new Date().toISOString()
            });
        }
        saveProducts();
        console.log(`✅ ${products.length} productos generados correctamente`);
    } catch (error) {
        console.error('❌ Error generando productos:', error);
    }
}

// Guardar productos en localStorage
function saveProducts() {
    try {
        localStorage.setItem('kalevshoes_products', JSON.stringify(products));
        // Actualizar referencia global
        if (typeof window !== 'undefined') {
            window.products = products;
        }
        console.log('✅ Productos guardados');
    } catch (error) {
        console.error('❌ Error guardando productos:', error);
    }
}

// ============================================
// ORDERS MANAGEMENT
// ============================================
function getAllOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('kalevshoes_orders') || '[]');
        return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        return [];
    }
}

function saveOrderToDatabase(orderData) {
    try {
        const existingOrders = JSON.parse(localStorage.getItem('kalevshoes_orders') || '[]');
        
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
            status: orderData.status || 'nuevo',
            whatsappSent: false,
            whatsappSentAt: null,
            statusUpdatedAt: null,
            ...orderData
        };
        
        existingOrders.push(newOrder);
        existingOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (existingOrders.length > 200) {
            existingOrders.splice(200);
        }
        
        localStorage.setItem('kalevshoes_orders', JSON.stringify(existingOrders));
        console.log('✅ Pedido guardado en base de datos:', newOrder);
        return newOrder;
    } catch (error) {
        console.error('❌ Error guardando pedido:', error);
        return null;
    }
}

function getOrderStats() {
    const orders = getAllOrders();
    const stats = {
        total: orders.length,
        nuevos: orders.filter(o => o.status === 'nuevo').length,
        enviados: orders.filter(o => o.whatsappSent === true).length,
        porTipo: {},
        porDia: {}
    };
    
    orders.forEach(order => {
        const tipo = order.subject || 'otro';
        stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
    });
    
    orders.forEach(order => {
        const fecha = new Date(order.timestamp).toLocaleDateString('es-CO');
        stats.porDia[fecha] = (stats.porDia[fecha] || 0) + 1;
    });
    
    return stats;
}

// ============================================
// USER MANAGEMENT
// ============================================
function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem('kalevshoes_users') || '[]');
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return [];
    }
}

function registerUser(userData) {
    try {
        const users = getRegisteredUsers();
        
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

function getUserByPhone(phone) {
    const users = getRegisteredUsers();
    return users.find(u => {
        const userPhone = u.phone.replace(/\s+/g, '').replace(/\+/g, '');
        const searchPhone = phone.replace(/\s+/g, '').replace(/\+/g, '');
        return userPhone === searchPhone || userPhone.endsWith(searchPhone) || searchPhone.endsWith(userPhone);
    });
}

function getCustomerOrders(phone) {
    const orders = getAllOrders();
    return orders.filter(order => {
        const orderPhone = order.phone.replace(/\s+/g, '').replace(/\+/g, '');
        const customerPhone = phone.replace(/\s+/g, '').replace(/\+/g, '');
        return orderPhone === customerPhone || orderPhone.endsWith(customerPhone) || customerPhone.endsWith(orderPhone);
    });
}

function getCurrentCustomer() {
    try {
        const customer = localStorage.getItem('kalevshoes_current_customer');
        return customer ? JSON.parse(customer) : null;
    } catch (error) {
        console.error('Error obteniendo cliente actual:', error);
        return null;
    }
}

function setCurrentCustomer(phone, name, email = '') {
    try {
        localStorage.setItem('kalevshoes_current_customer', JSON.stringify({
            phone: phone,
            name: name,
            email: email,
            loginDate: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error guardando cliente actual:', error);
    }
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

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
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
    });
}

// Cargar productos al cargar el script
loadProducts();

// Exponer products globalmente para acceso desde otros scripts
if (typeof window !== 'undefined') {
    window.products = products;
    
    // Actualizar la referencia cuando se carguen productos
    const originalLoadProducts = loadProducts;
    loadProducts = function() {
        originalLoadProducts();
        window.products = products;
    };
}

