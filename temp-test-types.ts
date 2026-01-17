import { PrismaClient } from '@prisma/client';

// Archivo temporal para verificar tipos de Prisma
const prisma = new PrismaClient();

async function testTypes() {
  // Este debe mostrar el tipo exacto del user.id
  const user = await prisma.user.findFirst();
  
  if (user) {
    // Verificar qué tipo tiene user.id
    console.log('User ID type:', typeof user.id);
    console.log('User ID value:', user.id);
    
    // Esto debería mostrar si user.id es string o number
    const userIdType: string = user.id; // Si da error, entonces user.id no es string
  }
}

export { testTypes };
