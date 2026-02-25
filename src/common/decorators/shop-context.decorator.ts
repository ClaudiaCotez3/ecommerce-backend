import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para especificar que contexto de tienda se necesita
 * Uso: @ShopContext() - obtiene shopId de params
 * Uso: @ShopContext('customParam') - obtiene shopId de customParam
 */
export const SHOP_CONTEXT_KEY = 'shopContext';
export const ShopContext = (paramName: string = 'shopId') => 
  SetMetadata(SHOP_CONTEXT_KEY, paramName);
