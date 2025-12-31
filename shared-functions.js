// ============================================
// SHARED FUNCTIONS - Used by all pages
// ============================================

// ============================================
// PRODUCT MANAGEMENT WITH SUPABASE
// ============================================
let products = [];
let useLocalStorage = true; // Fallback a localStorage si Supabase falla

const categories = ['Plataformas', 'Planas', 'De Goma', 'Melisa', 'Tacón', 'Sandalias', 'Botas', 'Deportivos'];
const colors = ['Negro', 'Blanco', 'Rosa', 'Azul', 'Rojo', 'Beige', 'Plateado'];
const sizes = ['35', '36', '37', '38', '39', '40', '41'];
const materials = ['Cuero', 'Sintético', 'Tela', 'Ante', 'Charol'];
const seasons = ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'];
const collections = ['Clásica', 'Moderna', 'Deportiva', 'Elegante', 'Casual'];

// Cargar productos desde Supabase o localStorage
async function loadProducts() {
    try {
        // Intentar cargar desde Supabase primero
        if (typeof window.supabaseAPI !== 'undefined' && window.supabaseAPI.fetchProducts) {
            try {
                const dbProducts = await window.supabaseAPI.fetchProducts();

                if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
                    products = dbProducts;
                    useLocalStorage = false;
                    console.log(`✅ ${products.length} productos cargados desde Supabase`);

                    // Guardar en localStorage como backup
                    localStorage.setItem('kalevshoes_products', JSON.stringify(products));
                    return;
                } else {
                    console.log('⚠️ Supabase conectado pero sin productos, usando localStorage');
                }
            } catch (supabaseError) {
                console.warn('⚠️ Error conectando a Supabase:', supabaseError.message);
                console.log('💡 Usando datos locales como respaldo');
            }
        } else {
            console.log('⚠️ Supabase API no disponible, usando localStorage');
        }

        // Fallback: Cargar desde localStorage
        const savedProducts = localStorage.getItem('kalevshoes_products');
        if (savedProducts) {
            try {
                const parsedProducts = JSON.parse(savedProducts);
                if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
                    products = parsedProducts;
                    console.log(`✅ ${products.length} productos cargados desde localStorage`);
                    return;
                }
            } catch (parseError) {
                console.error('❌ Error parseando productos de localStorage:', parseError);
                localStorage.removeItem('kalevshoes_products'); // Limpiar datos corruptos
            }
        }

        // Si no hay productos válidos, generar iniciales
        console.log('📦 Generando productos iniciales...');
        generateInitialProducts();

    } catch (error) {
        console.error('❌ Error general cargando productos:', error);
        console.log('📦 Generando productos iniciales como último recurso...');
        generateInitialProducts();
    }
}

// Generar productos iniciales
function generateInitialProducts() {
    try {
        // Lista de imágenes de zapatos de mujer desde Unsplash (URLs originales)
        const shoeImages = [
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=300&fit=crop', // Zapatos elegantes
            'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=400&h=300&fit=crop', // Tacones
            'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop', // Botas
            'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=300&fit=crop', // Deportivos
            'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400&h=300&fit=crop', // Sandalias
            'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=400&h=300&fit=crop', // Plataformas
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop', // Zapatos casuales
            'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=300&fit=crop', // Tacón alto
        ];
        
        for (let i = 260; i <= 320; i++) {
            const numColors = Math.floor(Math.random() * 4) + 1;
            const numSizes = Math.floor(Math.random() * 5) + 3;
            const productColors = colors.slice(0, numColors);
            const productSizes = sizes.slice(0, numSizes);
            const category = categories[Math.floor(Math.random() * categories.length)];
            const price = (Math.floor(Math.random() * 100) + 100) * 1000;
            const material = materials[Math.floor(Math.random() * materials.length)];
            const season = seasons[Math.floor(Math.random() * seasons.length)];
            const collection = collections[Math.floor(Math.random() * collections.length)];
            
            // Seleccionar imagen aleatoria de la lista
            const randomImage = shoeImages[Math.floor(Math.random() * shoeImages.length)];
            
            products.push({
                id: `J${i}`,
                reference: `J${i}`,
                category: category,
                price: price,
                priceFormatted: `${price.toLocaleString('es-CO')}`,
                description: `Zapato elegante modelo J${i}, perfecto para ocasiones especiales. Diseñado con materiales premium y atención al detalle para brindar máximo confort y estilo.`,
                colors: productColors,
                sizes: productSizes,
                image: randomImage,
                material: material,
                season: season,
                collection: collection,
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

// Guardar productos en Supabase y localStorage
async function saveProducts() {
    try {
        // Guardar en localStorage siempre (backup)
        localStorage.setItem('kalevshoes_products', JSON.stringify(products));
        
        // Si Supabase está disponible, sincronizar
        if (!useLocalStorage && typeof window.supabaseAPI !== 'undefined') {
            for (const product of products) {
                await window.supabaseAPI.saveProductToDB(product);
            }
            console.log('✅ Productos sincronizados con Supabase');
        }
        
        // Actualizar referencia global
        if (typeof window !== 'undefined') {
            window.products = products;
        }
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

