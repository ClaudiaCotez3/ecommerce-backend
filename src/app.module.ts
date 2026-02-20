import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shop.module';
import { ShopUsersModule } from './modules/shop-users/shop-users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    AuthModule, 
    ShopsModule, 
    ShopUsersModule, 
    ProductsModule, 
    CategoriesModule,
    ProductVariantsModule,
    InventoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
