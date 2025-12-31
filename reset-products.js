// ============================================
// SCRIPT PARA REGENERAR PRODUCTOS
// ============================================

/**
 * Ejecuta este script en la consola del navegador para:
 * 1. Limpiar productos antiguos
 * 2. Regenerar productos con imágenes reales de Unsplash
 * 3. Mantener los pedidos existentes
 */

async function regenerateProducts() {
    console.log('🔄 Iniciando regeneración de productos...');
    
    // Confirmar con el usuario
    if (!confirm('¿Estás seguro? Esto eliminará todos los productos actuales y generará nuevos con imágenes reales de Unsplash.')) {
        console.log('❌ Operación cancelada');
        return;
    }
    
    try {
        // 1. Limpiar productos existentes
        localStorage.removeItem('kalevshoes_products');
        console.log('✅ Productos antiguos eliminados');
        
        // 2. Recargar shared-functions.js para generar nuevos productos
        // (esto se hace automáticamente al recargar la página)
        
        // 3. Recargar la página
        console.log('🔄 Recargando página para generar nuevos productos...');
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error durante la regeneración:', error);
    }
}

/**
 * Actualizar solo las imágenes de productos existentes
 */
async function updateProductImages() {
    console.log('🖼️ Actualizando imágenes de productos...');
    
    try {
        const products = JSON.parse(localStorage.getItem('kalevshoes_products') || '[]');
        
        if (products.length === 0) {
            console.warn('⚠️ No hay productos para actualizar');
            return;
        }
        
        // Lista de imágenes de zapatos de mujer desde Unsplash
        const shoeImages = [
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=300&fit=crop&q=80',
        ];
        
        // Actualizar imagen de cada producto
        products.forEach((product, index) => {
            // Asignar imagen de forma cíclica
            const imageIndex = index % shoeImages.length;
            product.image = shoeImages[imageIndex];
        });
        
        // Guardar productos actualizados
        localStorage.setItem('kalevshoes_products', JSON.stringify(products));
        
        console.log(`✅ ${products.length} productos actualizados con nuevas imágenes`);
        
        // Si Supabase está disponible, sincronizar
        if (typeof window.supabaseAPI !== 'undefined') {
            console.log('🔄 Sincronizando con Supabase...');
            for (const product of products) {
                await window.supabaseAPI.saveProductToDB(product);
            }
            console.log('✅ Sincronización completada');
        }
        
        // Recargar catálogo
        if (typeof renderCatalog === 'function') {
            console.log('🔄 Recargando catálogo...');
            location.reload();
        }
        
    } catch (error) {
        console.error('❌ Error actualizando imágenes:', error);
    }
}

/**
 * Ver estadísticas de productos
 */
function showProductStats() {
    try {
        const products = JSON.parse(localStorage.getItem('kalevshoes_products') || '[]');
        
        console.log('\n📊 ESTADÍSTICAS DE PRODUCTOS\n');
        console.log(`Total de productos: ${products.length}`);
        
        if (products.length > 0) {
            // Contar por categoría
            const categories = {};
            products.forEach(p => {
                categories[p.category] = (categories[p.category] || 0) + 1;
            });
            
            console.log('\nProductos por categoría:');
            Object.entries(categories).forEach(([cat, count]) => {
                console.log(`  ${cat}: ${count}`);
            });
            
            // Mostrar algunos productos
            console.log('\nPrimeros 5 productos:');
            console.table(products.slice(0, 5).map(p => ({
                Referencia: p.reference,
                Categoría: p.category,
                Precio: p.priceFormatted,
                Activo: p.active ? '✓' : '✗'
            })));
        }
        
    } catch (error) {
        console.error('❌ Error mostrando estadísticas:', error);
    }
}

// Exportar funciones
window.productUtils = {
    regenerateProducts,
    updateProductImages,
    showProductStats
};

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🔧 HERRAMIENTAS DE PRODUCTOS - KALEV SHOES              ║
║                                                            ║
║   Usa estas funciones en la consola:                      ║
║                                                            ║
║   1. productUtils.regenerateProducts()                    ║
║      → Elimina y regenera todos los productos             ║
║                                                            ║
║   2. productUtils.updateProductImages()                   ║
║      → Actualiza solo las imágenes (mantiene datos)       ║
║                                                            ║
║   3. productUtils.showProductStats()                      ║
║      → Muestra estadísticas de productos                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);