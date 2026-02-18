# Módulo de Shops - Arquitectura Hexagonal

Este módulo implementa la funcionalidad de gestión de tiendas siguiendo los principios de **arquitectura hexagonal** con **vertical slicing**.

## 🏗️ Estructura del Módulo

```
src/modules/shops/
├── domain/
│   ├── Shop.ts                    # Entidad de dominio
│   ├── ShopRepository.ts          # Interface del repositorio
│   └── SlugGenerator.ts           # Servicio de dominio
├── application/
│   ├── CreateShop.ts              # Caso de uso: crear tienda
│   └── GetShopsByOwner.ts         # Caso de uso: obtener tiendas del propietario
├── infrastructure/
│   ├── PrismaShopRepository.ts    # Implementación del repositorio
│   ├── SimpleSlugGenerator.ts     # Implementación del generador de slugs
│   ├── AuthGuard.ts               # Guard de autenticación
│   └── ShopController.ts          # Controlador REST
└── shop.module.ts                 # Configuración del módulo NestJS
```

## 🎯 Principios Aplicados

### ✅ Arquitectura Hexagonal
- **Dominio**: Puro, sin dependencias externas
- **Aplicación**: Casos de uso independientes
- **Infraestructura**: Implementaciones concretas

### ✅ Separation of Concerns
- Cada capa tiene una responsabilidad específica
- El dominio no conoce NestJS ni Prisma
- Los casos de uso son independientes entre sí

### ✅ Dependency Inversion
- El dominio define interfaces
- La infraestructura implementa las interfaces
- Inyección de dependencias con tokens

### ✅ Single Responsibility
- Una clase = una responsabilidad
- Casos de uso enfocados en una acción específica

## 🔐 Seguridad

- **Autenticación requerida**: Todos los endpoints requieren token JWT
- **Autorización**: Un usuario solo puede gestionar sus propias tiendas
- **Validación**: Entrada validada en múltiples capas

## 🌐 API Endpoints

### POST /api/shops
Crea una nueva tienda para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "Mi Tienda Increíble",
  "description": "Descripción de mi tienda",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tienda creada exitosamente",
  "data": {
    "id": 1,
    "name": "Mi Tienda Increíble",
    "slug": "mi-tienda-increible",
    "description": "Descripción de mi tienda",
    "currency": "USD",
    "status": "active",
    "ownerId": "user-id-123",
    "createdAt": "2026-01-19T20:35:53.000Z"
  }
}
```

### GET /api/shops/my-shops
Obtiene todas las tiendas del usuario autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Tiendas obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "name": "Mi Tienda Increíble",
      "slug": "mi-tienda-increible",
      "description": "Descripción de mi tienda",
      "currency": "USD",
      "status": "active",
      "createdAt": "2026-01-19T20:35:53.000Z"
    }
  ],
  "total": 1
}
```

## 💡 Reglas de Negocio

### Entidad Shop
- ✅ Nombre requerido (máx. 150 caracteres)
- ✅ Moneda requerida (máx. 10 caracteres)
- ✅ Propietario requerido
- ✅ Estado por defecto: "active"
- ✅ Slug único generado automáticamente

### Validaciones
- ✅ Monedas soportadas: USD, EUR, MXN, COP, PEN, CLP, ARS
- ✅ Solo el propietario puede gestionar sus tiendas
- ✅ Solo se muestran tiendas activas

## 🔧 Casos de Uso

### CreateShop
**Responsabilidad:** Crear una nueva tienda
**Input:** `{ name, description?, currency, ownerId }`
**Output:** `Shop`
**Validaciones:**
- Datos requeridos presentes
- Formato de moneda válido
- Generación de slug único

### GetShopsByOwner
**Responsabilidad:** Obtener tiendas del propietario
**Input:** `{ ownerId }`
**Output:** `Shop[]`
**Filtros:**
- Solo tiendas activas
- Solo del propietario especificado

## 🛠️ Extensibilidad

Este módulo está diseñado para servir como **plantilla** para otros módulos del sistema:

### Para crear un módulo similar:
1. Copiar la estructura de carpetas
2. Reemplazar "Shop" por la nueva entidad
3. Adaptar las reglas de negocio
4. Implementar los casos de uso específicos
5. Configurar el módulo NestJS

### Módulos futuros sugeridos:
- **Products**: Gestión de productos
- **Categories**: Gestión de categorías
- **Orders**: Gestión de pedidos
- **Inventory**: Gestión de inventario
- **Payments**: Gestión de pagos

## 🚀 Testing

Para probar los endpoints, usar herramientas como **Postman** o **curl**:

1. **Obtener token de autenticación:**
   ```bash
   POST /api/auth/login
   # Copiar el token del response
   ```

2. **Crear una tienda:**
   ```bash
   POST /api/shops
   Authorization: Bearer <token>
   ```

3. **Listar mis tiendas:**
   ```bash
   GET /api/shops/my-shops
   Authorization: Bearer <token>
   ```

## 📈 Próximas Mejoras

- [ ] Validación con class-validator
- [ ] Paginación en listados
- [ ] Filtros avanzados
- [ ] Soft delete
- [ ] Auditoría de cambios
- [ ] Cache con Redis
- [ ] Tests unitarios e integración

---

## 🎓 Arquitectura Profesional

Este módulo demuestra:
- ✅ **Código limpio y mantenible**
- ✅ **Separación clara de responsabilidades**
- ✅ **Preparado para escalar**
- ✅ **Testeable fácilmente**
- ✅ **Documentación completa**
- ✅ **Patrones de diseño aplicados**

**¡Listo para producción!** 🚀
