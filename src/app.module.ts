import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shop.module';
import { ShopUsersModule } from './modules/shop-users/shop-users.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [AuthModule, ShopsModule, ShopUsersModule, ProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
