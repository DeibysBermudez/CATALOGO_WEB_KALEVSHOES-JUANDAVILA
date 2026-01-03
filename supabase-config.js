// ============================================
// SUPABASE CONFIGURATION
// ============================================

// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Supabase
// Los encuentras en: Settings > API
const SUPABASE_URL = 'https://iwevhextahozqtlrfpjm.supabase.co'; // Ejemplo: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXZoZXh0YWhvenF0bHJmcGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMzA1NTEsImV4cCI6MjA4MjcwNjU1MX0.3UefHZDlxnqoPoasrISK6ZNpXZ4ucNjYUZ5bLxYr_1g'; // Key pública

// Verificar que las credenciales estén configuradas
if (SUPABASE_URL === 'https://iwevhextahozqtlrfpjm.supabase.co' || SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXZoZXh0YWhvenF0bHJmcGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMzA1NTEsImV4cCI6MjA4MjcwNjU1MX0.3UefHZDlxnqoPoasrISK6ZNpXZ4ucNjYUZ5bLxYr_1g') {
    console.warn('⚠️ ATENCIÓN: Debes configurar las credenciales de Supabase');
    console.warn('📝 Edita el archivo supabase-config.js con tus credenciales');
}

// Cargar librería de Supabase desde CDN
(function() {
    // Evitar cargar el script múltiples veces
    if (window.supabaseScriptLoaded) {
        return;
    }
    window.supabaseScriptLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = function() {
        // La librería crea window.supabase automáticamente
        initializeSupabase();
    };
    script.onerror = function() {
        console.error('❌ Error cargando la librería Supabase desde CDN');
    };
    document.head.appendChild(script);
})();

// Declarar variables globales solo si no existen
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = null;
}
if (typeof window.isSupabaseReady === 'undefined') {
    window.isSupabaseReady = false;
}

function initializeSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            console.error('❌ La librería Supabase no se cargó correctamente');
            return;
        }

        // Evitar inicializar múltiples veces
        if (window.supabaseClient) {
            console.log('✅ Supabase ya estaba inicializado');
            return;
        }

        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.isSupabaseReady = true;
        console.log('✅ Supabase inicializado correctamente');

        // Trigger evento personalizado para notificar que está listo
        window.dispatchEvent(new Event('supabase-ready'));
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        // Continuar sin Supabase
        window.isSupabaseReady = false;
    }
}

// ============================================
// DIAGNOSTIC FUNCTIONS
// ============================================

// Función para verificar conexión a Supabase
async function testSupabaseConnection() {
    console.log('🔍 Probando conexión a Supabase...');

    if (!window.isSupabaseReady) {
        console.error('❌ Supabase no está inicializado');
        return false;
    }

    try {
        // Probar conexión básica
        const { data, error } = await window.supabaseClient.from('products').select('count').limit(1);

        if (error) {
            console.error('❌ Error conectando a Supabase:', error.message);
            console.log('💡 Posibles causas:');
            console.log('   - La tabla "products" no existe');
            console.log('   - Las credenciales son incorrectas');
            console.log('   - No hay permisos de lectura');
            return false;
        }

        console.log('✅ Conexión a Supabase exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}

// Función para crear tabla products si no existe
async function createProductsTable() {
    console.log('🔧 Intentando crear tabla products...');

    try {
        // Crear tabla usando SQL
        const { error } = await window.supabaseClient.rpc('create_products_table', {});

        if (error) {
            console.error('❌ Error creando tabla:', error.message);
            console.log('💡 Necesitas crear la tabla manualmente en Supabase Dashboard');
            console.log('📋 SQL para crear la tabla:');
            console.log(`
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    reference TEXT,
    category TEXT,
    price INTEGER,
    priceFormatted TEXT,
    description TEXT,
    colors TEXT[],
    sizes TEXT[],
    image TEXT,
    material TEXT,
    season TEXT,
    collection TEXT,
    active BOOLEAN DEFAULT true,
    createdAt TEXT
);
            `);
            return false;
        }

        console.log('✅ Tabla products creada exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error creando tabla:', error);
        return false;
    }
}

// Exponer funciones de diagnóstico
// (Ahora se incluyen en la exportación final)

async function fetchProducts() {
    if (!window.isSupabaseReady) {
        console.warn('Supabase no está listo, usando datos locales');
        return null;
    }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .order('reference', { ascending: true });
        
        if (error) throw error;
        
        // Convertir formato de BD a formato de la app
        return data.map(p => ({
            id: p.id,
            reference: p.reference,
            category: p.category,
            price: p.price,
            priceFormatted: p.price_formatted,
            description: p.description,
            image: p.image,
            colors: [],
            sizes: ['35', '36', '37', '38', '39', '40', '41'],
            active: p.active,
            createdAt: p.created_at
        }));
    } catch (error) {
        console.error('Error cargando productos:', error);
        return null;
    }
}

async function saveProductToDB(product) {
    if (!window.isSupabaseReady) return false;
    
    try {
        const dbProduct = {
            id: product.id || product.reference,
            reference: product.reference,
            category: product.category,
            price: product.price,
            price_formatted: product.priceFormatted,
            description: product.description,
            image: product.image,
            active: product.active !== false
        };
        
        const { error } = await window.supabaseClient
            .from('products')
            .upsert(dbProduct, { onConflict: 'reference' });
        
        if (error) throw error;
        
        console.log('✅ Producto guardado en BD:', product.reference);
        return true;
    } catch (error) {
        console.error('Error guardando producto:', error);
        return false;
    }
}

async function deleteProductFromDB(productId) {
    if (!window.isSupabaseReady) return false;
    
    try {
        const { error } = await window.supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        console.log('✅ Producto eliminado de BD:', productId);
        return true;
    } catch (error) {
        console.error('Error eliminando producto:', error);
        return false;
    }
}

// ============================================
// API FUNCTIONS - ORDERS
// ============================================

async function saveOrderToDB(order) {
    if (!window.isSupabaseReady) return null;
    
    try {
        const dbOrder = {
            user_phone: order.phone,
            user_name: order.name,
            user_email: order.email,
            subject: order.subject,
            message: order.message,
            products: order.products ? JSON.stringify(order.products) : null,
            total_pairs: order.totalPairs || 0,
            status: order.status || 'nuevo',
            whatsapp_sent: order.whatsappSent || false,
            email_sent: order.emailSent || false,
            send_type: order.sendType || 'whatsapp'
        };
        
        const { data, error } = await window.supabaseClient
            .from('orders')
            .insert(dbOrder)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Pedido guardado en BD:', data.id);
        return data;
    } catch (error) {
        console.error('Error guardando pedido:', error);
        return null;
    }
}

async function fetchOrders(userPhone = null) {
    if (!isSupabaseReady) return null;
    
    try {
        let query = window.supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (userPhone) {
            query = query.eq('user_phone', userPhone);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Convertir formato de BD a formato de la app
        return data.map(o => ({
            id: o.id,
            name: o.user_name,
            phone: o.user_phone,
            email: o.user_email,
            subject: o.subject,
            message: o.message,
            products: o.products ? JSON.parse(o.products) : [],
            totalPairs: o.total_pairs,
            status: o.status,
            whatsappSent: o.whatsapp_sent,
            whatsappSentAt: o.whatsapp_sent_at,
            emailSent: o.email_sent,
            emailSentAt: o.email_sent_at,
            sendType: o.send_type,
            timestamp: o.created_at,
            dateFormatted: new Date(o.created_at).toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        return null;
    }
}

async function updateOrderStatus(orderId, status) {
    if (!isSupabaseReady) return false;
    
    try {
        const { error } = await window.supabaseClient
            .from('orders')
            .update({ status: status })
            .eq('id', orderId);
        
        if (error) throw error;
        
        console.log('✅ Estado del pedido actualizado:', orderId);
        return true;
    } catch (error) {
        console.error('Error actualizando pedido:', error);
        return false;
    }
}

// ============================================
// API FUNCTIONS - USERS
// ============================================

async function saveUserToDB(user) {
    if (!isSupabaseReady) return null;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .upsert({
                name: user.name,
                phone: user.phone,
                email: user.email || null
            }, { onConflict: 'phone' })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Usuario guardado en BD:', user.phone);
        return data;
    } catch (error) {
        console.error('Error guardando usuario:', error);
        return null;
    }
}

async function fetchUserByPhone(phone) {
    if (!isSupabaseReady) return null;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no encontrado
        
        return data ? {
            id: data.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            registeredAt: data.registered_at,
            lastLogin: data.last_login
        } : null;
    } catch (error) {
        console.error('Error buscando usuario:', error);
        return null;
    }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

function subscribeToProducts(callback) {
    if (!isSupabaseReady) return null;
    
    const subscription = window.supabaseClient
        .channel('products-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'products' },
            callback
        )
        .subscribe();
    
    console.log('🔔 Suscrito a cambios en productos');
    return subscription;
}

function subscribeToOrders(callback) {
    if (!isSupabaseReady) return null;
    
    const subscription = window.supabaseClient
        .channel('orders-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            callback
        )
        .subscribe();
    
    console.log('🔔 Suscrito a cambios en pedidos');
    return subscription;
}

// Función para guardar todos los productos
async function saveProducts(productsArray) {
    if (!isSupabaseReady) return false;
    
    try {
        // Primero, obtener productos existentes para comparar
        const { data: existingProducts, error: fetchError } = await window.supabaseClient
            .from('products')
            .select('id');
        
        if (fetchError) throw fetchError;
        
        const existingIds = new Set(existingProducts.map(p => p.id));
        const newIds = new Set(productsArray.map(p => p.id || p.reference));
        
        // Productos a eliminar (existen en BD pero no en array)
        const toDelete = [...existingIds].filter(id => !newIds.has(id));
        
        // Productos a insertar/actualizar
        const toUpsert = productsArray.map(product => ({
            id: product.id || product.reference,
            reference: product.reference,
            category: product.category,
            price: product.price,
            price_formatted: product.priceFormatted,
            description: product.description,
            image: product.image,
            active: product.active !== false
        }));
        
        // Eliminar productos que ya no existen
        if (toDelete.length > 0) {
            const { error: deleteError } = await window.supabaseClient
                .from('products')
                .delete()
                .in('id', toDelete);
            
            if (deleteError) throw deleteError;
            console.log(`🗑️ Eliminados ${toDelete.length} productos obsoletos`);
        }
        
        // Insertar/actualizar productos
        if (toUpsert.length > 0) {
            const { error: upsertError } = await window.supabaseClient
                .from('products')
                .upsert(toUpsert, { onConflict: 'id' });
            
            if (upsertError) throw upsertError;
            console.log(`💾 Guardados/actualizados ${toUpsert.length} productos`);
        }
        
        return true;
    } catch (error) {
        console.error('Error guardando productos:', error);
        return false;
    }
}

// Exportar funciones globalmente
window.supabaseAPI = {
    testConnection: testSupabaseConnection,
    createTable: createProductsTable,
    fetchProducts,
    saveProducts,
    saveProductToDB,
    deleteProductFromDB,
    saveOrderToDB,
    fetchOrders,
    updateOrderStatus,
    saveUserToDB,
    fetchUserByPhone,
    subscribeToProducts,
    subscribeToOrders
};

