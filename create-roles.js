import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRoles() {
  try {
    console.log('🔍 Verificando roles existentes...');
    
    // Verificar si ya existen roles
    const existingRoles = await prisma.role.findMany();
    console.log('Roles existentes:', existingRoles);

    if (existingRoles.length === 0) {
      console.log('📝 Creando roles...');
      
      // Crear roles básicos
      const roles = await prisma.role.createMany({
        data: [
          {
            name: 'owner',
            description: 'Propietario de la tienda'
          },
          {
            name: 'admin', 
            description: 'Administrador de la tienda'
          },
          {
            name: 'manager',
            description: 'Gerente de la tienda'
          },
          {
            name: 'employee',
            description: 'Empleado de la tienda'
          },
          {
            name: 'viewer',
            description: 'Solo lectura/consultas'
          }
        ]
      });

      console.log('✅ Roles creados exitosamente:', roles);
    } else {
      console.log('✅ Los roles ya existen');
    }

    // Mostrar todos los roles
    const allRoles = await prisma.role.findMany();
    console.log('📋 Roles disponibles:');
    allRoles.forEach(role => {
      console.log(`  ID: ${role.id} | Nombre: ${role.name} | Descripción: ${role.description}`);
    });

  } catch (error) {
    console.error('❌ Error creando roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRoles();
