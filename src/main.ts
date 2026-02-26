import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir comunicación con Next.js frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Next.js dev server
      'http://localhost:3001',  // Next.js alt port
      'https://your-frontend-domain.com'  // Producción
    ],
    credentials: true,  // Permitir cookies y headers de auth
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Configurar prefijo global para las APIs
  app.setGlobalPrefix('api');
  
  // Puerto diferente para evitar conflictos con Next.js frontend
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📖 API Documentation available at: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
});
