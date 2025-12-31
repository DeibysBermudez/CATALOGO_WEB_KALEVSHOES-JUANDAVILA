-- ============================================
-- SUPABASE DATABASE SETUP
-- Ejecutar estos comandos en el SQL Editor de Supabase
-- ============================================

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    price_formatted TEXT NOT NULL,
    description TEXT,
    image TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_phone TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    subject TEXT,
    message TEXT,
    products JSONB,
    total_pairs INTEGER DEFAULT 0,
    status TEXT DEFAULT 'nuevo',
    whatsapp_sent BOOLEAN DEFAULT false,
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    send_type TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_reference ON products(reference);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

CREATE INDEX IF NOT EXISTS idx_orders_user_phone ON orders(user_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Políticas RLS (Row Level Security) - permitir acceso público para operaciones básicas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (lectura pública, escritura solo autenticada)
CREATE POLICY "Productos son públicos" ON products FOR SELECT USING (true);
CREATE POLICY "Solo admin puede modificar productos" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para pedidos (lectura/escritura pública para funcionalidad básica)
CREATE POLICY "Pedidos permiten inserción pública" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Pedidos permiten lectura pública" ON orders FOR SELECT USING (true);
CREATE POLICY "Solo admin puede actualizar pedidos" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para usuarios (lectura/escritura pública para registro básico)
CREATE POLICY "Usuarios permiten inserción pública" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios permiten lectura pública" ON users FOR SELECT USING (true);
CREATE POLICY "Usuarios permiten actualización propia" ON users FOR UPDATE USING (auth.uid()::text = id::text);