import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shop.module';
import { ShopUsersModule } from './modules/shop-users/shop-users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [AuthModule, ShopsModule, ShopUsersModule, ProductsModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
