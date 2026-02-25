# 🔐 SISTEMA DE ROLES Y PERMISOS - FASE 6

## 📋 RESUMEN DE LA IMPLEMENTACIÓN

### ✅ **YA IMPLEMENTADO EN TU SISTEMA:**
- **Entidades de Dominio**: `Role` y `ShopMembership` completas
- **Repositorios**: `ShopUserRepository` con todas las operaciones CRUD
- **AuthGuard básico**: Validación JWT en rutas críticas
- **Base de datos**: Roles creados (owner, admin, manager, employee, viewer)

### 🆕 **AGREGADO EN FASE 6:**

## 🛠️ COMPONENTES IMPLEMENTADOS

### 1. **DECORADORES DE AUTORIZACIÓN**

#### `@Roles('admin', 'manager')`
```typescript
// Ubicación: src/common/decorators/roles.decorator.ts
@Roles('owner', 'admin', 'manager') // Solo estos roles pueden acceder
```

#### `@ShopContext()`
```typescript
// Ubicación: src/common/decorators/shop-context.decorator.ts
@ShopContext() // Obtiene shopId del parámetro de ruta
@ShopContext('customParam') // Obtiene shopId de parámetro personalizado
```

#### `@CurrentUser()`
```typescript
// Ubicación: src/common/decorators/current-user.decorator.ts
async method(@CurrentUser() user: CurrentUserData) {
  // user.id, user.email, user.name disponibles
}
```

### 2. **GUARDS DE SEGURIDAD**

#### `RolesGuard` - Guard Avanzado
```typescript
// Ubicación: src/common/guards/roles.guard.ts
// Funcionalidad:
// ✅ Verifica autenticación JWT
// ✅ Valida membresía en tienda específica  
// ✅ Comprueba roles requeridos
// ✅ Manejo de errores granular
```

### 3. **CASOS DE USO ESPECIALIZADOS**

#### `AssignRoleToUser`
```typescript
// Ubicación: src/modules/shop-users/application/AssignRoleToUser.ts
// Permite asignar/cambiar roles de usuarios en tiendas
await assignRoleToUser.execute({
  userId: 'user123',
  shopId: 1,
  roleId: 2, // admin
  assignedByUserId: 'currentUser'
});
```

#### `CheckUserPermissions`
```typescript
// Ubicación: src/modules/shop-users/application/CheckUserPermissions.ts
// Verificación avanzada de permisos
const result = await checkPermissions.execute({
  userId: 'user123',
  shopId: 1,
  requiredRoles: ['admin', 'manager']
});
```

### 4. **CONTROLADORES DE GESTIÓN**

#### `ShopUserController`
```typescript
// Ubicación: src/modules/shop-users/infrastructure/ShopUserController.ts
// Endpoints:
POST /shop-users/assign-role        // Asignar roles (admin/owner)
GET  /shop-users/check-permissions  // Verificar permisos
GET  /shop-users/is-admin           // Verificar admin
```

## 🎯 EJEMPLO DE USO APLICADO

### **Controlador de Productos con Roles**
```typescript
@Controller()
@UseGuards(AuthGuard) // Autenticación básica
export class ProductController {

  // CREAR PRODUCTO - Solo admin/owner/manager
  @Post('shops/:shopId/products')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ShopContext()
  async createProduct(
    @Param('shopId', ParseIntPipe) shopId: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateProductDto
  ) {
    // El RolesGuard ya verificó que user tiene rol admin/owner/manager en shopId
    // Proceder con la lógica
  }

  // VER PRODUCTOS - Todos los miembros
  @Get('shops/:shopId/products')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'employee', 'viewer')
  @ShopContext()
  async getProducts() {
    // Cualquier miembro puede ver productos
  }
}
```

## 🔄 FLUJO DE AUTORIZACIÓN

### **Paso a Paso del RolesGuard:**
1. **Extrae roles requeridos** del decorador `@Roles`
2. **Obtiene usuario** del request (ya autenticado por AuthGuard)
3. **Identifica contexto de tienda** desde parámetros/query/body
4. **Busca membresía** del usuario en la tienda específica
5. **Verifica rol** del usuario contra roles requeridos
6. **Permite/Deniega** acceso con mensajes específicos

### **Mensajes de Error Específicos:**
- `"Usuario no autenticado"` - No hay JWT válido
- `"Contexto de tienda requerido"` - No se encontró shopId
- `"No tienes acceso a esta tienda"` - Usuario no es miembro
- `"Necesitas uno de estos roles: admin, manager"` - Rol insuficiente

## 🚀 ESTRUCTURA DE ROLES

### **Jerarquía de Permisos:**
1. **👑 owner** - Dueño de tienda (todos los permisos)
2. **🛡️ admin** - Administrador (casi todos los permisos)
3. **📊 manager** - Gerente (gestión operativa)
4. **👷 employee** - Empleado (operaciones básicas)
5. **👀 viewer** - Solo lectura (consultas únicamente)

### **Combinaciones Comunes:**
```typescript
@Roles('owner', 'admin')           // Solo alta gerencia
@Roles('owner', 'admin', 'manager') // Gestión completa
@Roles('owner', 'admin', 'manager', 'employee') // Operaciones
@Roles('owner', 'admin', 'manager', 'employee', 'viewer') // Lectura
```

## 🔧 CONFIGURACIÓN REQUERIDA

### **Módulos Actualizados:**
- ✅ `ShopUsersModule` - Exporta guards y casos de uso
- ✅ `ProductsModule` - Importa ShopUsersModule
- ✅ Otros módulos necesitan importar ShopUsersModule para usar RolesGuard

### **Base de Datos:**
```sql
-- Roles ya creados:
INSERT INTO roles VALUES 
(1, 'owner', 'Propietario de la tienda'),
(2, 'admin', 'Administrador de la tienda'),
(3, 'manager', 'Gerente de la tienda'),
(4, 'employee', 'Empleado de la tienda'),
(5, 'viewer', 'Solo lectura/consultas');
```

## 📖 GUÍA DE MIGRACIÓN

### **Para aplicar roles a otros módulos:**

1. **Importar ShopUsersModule**:
```typescript
@Module({
  imports: [ShopUsersModule],
  // ...
})
```

2. **Actualizar imports del controlador**:
```typescript
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ShopContext } from '../../../common/decorators/shop-context.decorator';
import { CurrentUser, type CurrentUserData } from '../../../common/decorators/current-user.decorator';
```

3. **Aplicar decoradores a endpoints**:
```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ShopContext()
async sensitiveOperation(@CurrentUser() user: CurrentUserData) {
  // Lógica protegida
}
```

## ⚡ VENTAJAS DEL SISTEMA

### **🏗️ Arquitectura Limpia:**
- Domain entities sin dependencias externas
- Guards reutilizables
- Separación de responsabilidades

### **🔒 Seguridad Robusta:**
- Verificación en múltiples capas
- Context-aware (consciente del contexto de tienda)
- Mensajes de error informativos

### **🚀 Escalabilidad:**
- Fácil agregar nuevos roles
- Decoradores reutilizables
- Guards configurables

### **🧪 Testeable:**
- Casos de uso independientes
- Guards unitarios
- Mocks sencillos

## 🎉 **SISTEMA COMPLETO Y FUNCIONAL**

Tu sistema ahora tiene:
- ✅ **Autenticación JWT** (AuthGuard existente)
- ✅ **Autorización por roles** (RolesGuard nuevo)
- ✅ **Context-awareness** (por tienda)
- ✅ **Gestión granular** (5 niveles de permisos)
- ✅ **API endpoints** para gestión de roles
- ✅ **Ejemplo aplicado** en módulo Products

**¡FASE 6 - SISTEMA DE ROLES IMPLEMENTADA EXITOSAMENTE!** 🎯
