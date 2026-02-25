import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { ShopUsersModule } from '../modules/shop-users/shop-users.module';

/**
 * Módulo común que contiene guards, interceptors, pipes, etc.
 * Se marca como Global para estar disponible en toda la aplicación
 */
@Global()
@Module({
  imports: [ShopUsersModule],
  providers: [RolesGuard],
  exports: [RolesGuard, ShopUsersModule],
})
export class CommonModule {}
