# Instrucciones - CT Shoes

## 📱 Configurar WhatsApp

### Cambiar el número de WhatsApp

1. Abre el archivo `script.js`
2. Busca la línea que dice: `const WHATSAPP_NUMBER = '573001234567';`
3. Reemplaza `573001234567` con tu número real de WhatsApp
4. **Formato del número:**
   - Código de país + número (sin espacios, sin +, sin guiones)
   - Ejemplo Colombia: `573001234567`
   - Ejemplo México: `521234567890`
   - Ejemplo España: `34612345678`

## 💾 Base de Datos Local (Pedidos)

Los pedidos se guardan automáticamente en el navegador usando **localStorage**.

### Ver pedidos guardados

Abre la consola del navegador (F12) y escribe:

```javascript
ctshoesAdmin.viewOrders()
```

Esto mostrará todos los pedidos guardados en formato tabla.

### Exportar pedidos

Para exportar todos los pedidos a un archivo JSON:

```javascript
ctshoesAdmin.exportOrders()
```

Esto descargará un archivo JSON con todos los pedidos.

### Contar pedidos

```javascript
ctshoesAdmin.getOrdersCount()
```

### Limpiar pedidos antiguos (más de 30 días)

```javascript
ctshoesAdmin.cleanOrders()
```

## 🔧 Funcionamiento del Formulario

1. El usuario llena el formulario de contacto
2. Al hacer clic en "Enviar por WhatsApp":
   - El pedido se guarda automáticamente en localStorage
   - Se formatea el mensaje con toda la información
   - Se abre WhatsApp Web/App con el mensaje pre-formateado
   - El usuario solo necesita hacer clic en "Enviar" en WhatsApp

## 📊 Estructura de los Pedidos Guardados

Cada pedido contiene:
- `id`: ID único del pedido
- `timestamp`: Fecha y hora del pedido
- `name`: Nombre del cliente
- `phone`: Teléfono del cliente
- `email`: Email del cliente (opcional)
- `subject`: Tipo de consulta
- `product`: Producto seleccionado (si aplica)
- `message`: Mensaje del cliente
- `status`: Estado del pedido (nuevo)

## 🚀 Próximos Pasos (Opcional)

Si quieres una base de datos real en lugar de localStorage, puedes:

1. **Usar Google Sheets API** - Guardar pedidos en una hoja de cálculo
2. **Usar Firebase** - Base de datos en tiempo real
3. **Crear un backend simple** - Con Node.js o PHP
4. **Usar un servicio como Formspree** - Para recibir emails automáticos

## 📝 Notas

- Los pedidos se guardan localmente en el navegador
- Máximo 100 pedidos guardados (se eliminan los más antiguos automáticamente)
- Los pedidos antiguos (más de 30 días) se pueden limpiar manualmente
- El formulario funciona completamente sin necesidad de servidor

