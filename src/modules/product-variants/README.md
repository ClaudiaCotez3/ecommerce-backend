# Módulos Product Variants e Inventory - Arquitectura Hexagonal

Estos módulos implementan la funcionalidad de variantes de productos y control de inventario siguiendo **arquitectura hexagonal** con **vertical slicing**.

## 🏗️ Estructura de Módulos

```
src/modules/product-variants/
├── domain/
│   ├── ProductVariant.ts           # Entidad de dominio
│   └── ProductVariantRepository.ts # Interface del repositorio
├── application/
│   ├── CreateVariant.ts            # Caso de uso: crear variante
│   └── GetVariantsByProduct.ts     # Caso de uso: listar variantes
├── infrastructure/
│   ├── PrismaProductVariantRepository.ts # Implementación Prisma
│   └── VariantController.ts        # Controlador REST
└── product-variants.module.ts     # Configuración NestJS

src/modules/inventory/
├── domain/
│   ├── Inventory.ts                # Entidad de dominio
│   └── InventoryRepository.ts      # Interface del repositorio
├── application/
│   ├── UpdateStock.ts              # Caso de uso: actualizar stock
│   ├── AdjustStock.ts              # Caso de uso: ajustar stock
│   └── GetInventoryByVariant.ts    # Caso de uso: obtener inventario
├── infrastructure/
│   ├── PrismaInventoryRepository.ts # Implementación Prisma
│   └── InventoryController.ts      # Controlador REST
└── inventory.module.ts             # Configuración NestJS
```

## 🎯 Conceptos del Negocio

### **Product Variants (Variantes)**
- **¿Qué es?** Diferentes versiones de un mismo producto
- **Ejemplos:** 
  - Camiseta: Talla S/M/L, Color Rojo/Azul/Verde
  - Zapatos: Talla 39/40/41, Color Negro/Marrón
  - Smartphone: 64GB/128GB/256GB

### **Inventory (Inventario)**
- **¿Qué es?** Control de stock por cada variante
- **Funciones:**
  - Saber cuántas unidades hay disponibles
  - Alertas de stock bajo
  - Movimientos de entrada/salida

## 🌐 API Endpoints

### **Product Variants**

#### Crear Variante
**POST** `/api/shops/:shopId/products/:productId/variants`
```json
{
  "sku": "CAMISA-ROJA-M",
  "specialPrice": 25.99,
  "attributes": {
    "color": "Rojo",
    "talla": "M",
    "material": "Algodón"
  }
}
```

#### Listar Variantes de un Producto
**GET** `/api/shops/:shopId/products/:productId/variants?status=active`

### **Inventory**

#### Ver Stock de una Variante
**GET** `/api/variants/:variantId/inventory`

#### Actualizar Stock
**PATCH** `/api/variants/:variantId/stock`
```json
{
  "quantity": 50,
  "minStockAlert": 5
}
```

#### Ajustar Stock
**PATCH** `/api/variants/:variantId/stock/adjust`
```json
{
  "adjustment": -3,
  "reason": "Venta en tienda física"
}
```

## 💼 Casos de Uso Prácticos

### **Ejemplo 1: Tienda de Ropa**

1. **Crear Producto Base:**
   ```json
   POST /api/shops/1/products
   {
     "name": "Camiseta Básica",
     "basePrice": 20.00
   }
   ```

2. **Crear Variantes:**
   ```json
   POST /api/shops/1/products/123/variants
   {
     "sku": "CAM-ROJA-S",
     "attributes": {"color": "Rojo", "talla": "S"}
   }
   
   POST /api/shops/1/products/123/variants
   {
     "sku": "CAM-ROJA-M", 
     "specialPrice": 22.00,
     "attributes": {"color": "Rojo", "talla": "M"}
   }
   ```

3. **Gestionar Inventario:**
   ```json
   PATCH /api/variants/456/stock
   {
     "quantity": 25,
     "minStockAlert": 3
   }
   ```

### **Ejemplo 2: Venta Online**

Cuando un cliente compra 2 unidades:
```json
PATCH /api/variants/456/stock/adjust
{
  "adjustment": -2,
  "reason": "Venta online - Pedido #1234"
}
```

## 🔧 Reglas de Negocio

### **ProductVariant**
- ✅ SKU único en todo el sistema
- ✅ Debe pertenecer a un producto válido
- ✅ Precio especial > 0 (opcional)
- ✅ Atributos flexibles (JSON)

### **Inventory**
- ✅ Una variante = un inventario (1:1)
- ✅ Stock nunca negativo
- ✅ Alertas de stock bajo
- ✅ Historial de movimientos

## 🚀 Estados del Stock

| Estado | Descripción | Condición |
|--------|-------------|-----------|
| `out_of_stock` | Sin stock | quantity = 0 |
| `low_stock` | Stock bajo | quantity ≤ minStockAlert |
| `in_stock` | Stock normal | quantity > minStockAlert |

## 🔍 Respuestas de la API

### **Crear Variante - Respuesta**
```json
{
  "success": true,
  "message": "Variante creada exitosamente",
  "data": {
    "id": 456,
    "productId": 123,
    "sku": "CAM-ROJA-M",
    "specialPrice": 22.00,
    "attributes": {
      "color": "Rojo",
      "talla": "M"
    },
    "status": "active",
    "isActive": true
  }
}
```

### **Ver Inventario - Respuesta**
```json
{
  "success": true,
  "message": "Inventario obtenido exitosamente", 
  "data": {
    "id": 789,
    "variantId": 456,
    "quantity": 15,
    "minStockAlert": 5,
    "hasStock": true,
    "isLowStock": false,
    "stockStatus": "in_stock",
    "updatedAt": "2026-02-18T10:30:00.000Z"
  }
}
```

## 🎓 Arquitectura Profesional

### **✅ Principios Aplicados**
- **Separación de responsabilidades**
- **Dominio puro** (sin dependencias técnicas)
- **Casos de uso independientes**
- **Inyección de dependencias**
- **Mapeo dominio ↔ infraestructura**

### **✅ Beneficios**
- 🔄 **Extensible:** Fácil agregar nuevos atributos
- 🧪 **Testeable:** Cada capa se prueba por separado
- 🔧 **Mantenible:** Cambios aislados por capas
- 📈 **Escalable:** Preparado para crecimiento

## 🛠️ Próximas Extensiones

- [ ] **Reservas de Stock:** Para carritos de compra
- [ ] **Historial de Movimientos:** Auditoría completa
- [ ] **Stock por Ubicación:** Múltiples almacenes
- [ ] **Predicción de Demanda:** ML para reabastecimiento
- [ ] **Integración con Proveedores:** Auto-reabastecimiento

**¡Listo para manejar inventarios complejos!** 🚀
