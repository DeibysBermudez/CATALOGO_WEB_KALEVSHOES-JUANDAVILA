# 🔧 Guía para Arreglar y Configurar Kalev Shoes

## 🚨 Problema Identificado

La página web está configurada para usar **Supabase** como base de datos, pero las tablas necesarias no existen en la base de datos. El código tiene fallback a localStorage, pero para una funcionalidad completa con base de datos, necesitamos crear las tablas.

## ✅ Soluciones Aplicadas

1. **Agregado `supabase-config.js`** a `admin.html` y `user.html` para que tengan acceso a la base de datos.
2. **Creado archivo `supabase-setup.sql`** con los comandos para crear las tablas necesarias.

## 🛠️ Pasos para Configurar la Base de Datos

### 1. Verificar Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Abre tu proyecto (URL: `https://iwevhextahozqtlrfpjm.supabase.co`)
3. Ve a **Settings > API** y verifica que las credenciales en `supabase-config.js` sean correctas

### 2. Crear las Tablas

1. En tu proyecto Supabase, ve a **SQL Editor**
2. Copia y pega todo el contenido del archivo `supabase-setup.sql`
3. Haz clic en **Run** para ejecutar los comandos

### 3. Verificar Conexión

1. Abre `index.html` en tu navegador
2. Abre la consola del navegador (F12)
3. Deberías ver mensajes como:
   ```
   ✅ Supabase inicializado correctamente
   ✅ X productos cargados desde Supabase
   ```

## 🔍 Verificación de Funcionalidad

### Página Principal (`index.html`)
- ✅ Debería cargar productos desde Supabase
- ✅ El catálogo debería mostrarse correctamente
- ✅ Los formularios de contacto deberían funcionar

### Panel de Administración (`admin.html`)
- Usuario: `kalevadmin`
- Contraseña: `kalev2025`
- ✅ Debería poder ver pedidos y productos
- ✅ Debería poder agregar/editar productos

### Panel de Usuario (`user.html`)
- ✅ Debería permitir registro e inicio de sesión
- ✅ Debería mostrar pedidos del usuario

## 🐛 Posibles Problemas y Soluciones

### Problema: "Supabase no está listo"
**Solución:** Verifica las credenciales en `supabase-config.js`

### Problema: No se cargan productos
**Solución:** Ejecuta el SQL setup y verifica que las tablas se crearon

### Problema: Error de CORS
**Solución:** Asegúrate de que tu dominio esté permitido en Supabase Settings > API

### Problema: Funciona con localStorage pero no con Supabase
**Solución:** Las tablas no se crearon correctamente. Revisa el SQL Editor.

## 📊 Estructura de la Base de Datos

### Tabla `products`
- Almacena información de productos
- Se sincroniza automáticamente con localStorage

### Tabla `orders`
- Almacena pedidos de clientes
- Incluye información de contacto y productos solicitados

### Tabla `users`
- Almacena información de usuarios registrados
- Vinculado con pedidos por teléfono

## 🚀 Próximos Pasos

1. Configura las tablas en Supabase
2. Prueba todas las funcionalidades
3. Si hay errores, revisa la consola del navegador
4. Para producción, considera configurar autenticación real en lugar de credenciales hardcodeadas

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12) para errores
2. Verifica que las credenciales de Supabase sean correctas
3. Asegúrate de que ejecutaste el SQL setup
4. Comparte los errores específicos para ayudar a solucionarlos