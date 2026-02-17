import { Shop } from '../domain/Shop';
import { ShopRepository } from '../domain/ShopRepository';
import { SlugGenerator } from '../domain/SlugGenerator';

/**
 * Caso de uso: Crear una nueva shop
 * Encapsula la lógica de negocio para la creación de tiendas
 */
export class CreateShop {
  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly slugGenerator: SlugGenerator,
  ) {}

  async execute(input: CreateShopInput): Promise<Shop> {
    // Validar datos de entrada
    this.validateInput(input);

    // Generar slug único
    const slug = await this.slugGenerator.generateFromName(input.name);

    // Crear la entidad de dominio
    const shopData = Shop.create(
      input.name,
      slug,
      input.description || null,
      input.currency,
      input.ownerId,
    );

    // Guardar en el repositorio
    const createdShop = await this.shopRepository.create(shopData);

    return createdShop;
  }

  private validateInput(input: CreateShopInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('El nombre de la tienda es requerido');
    }

    if (!input.currency || input.currency.trim().length === 0) {
      throw new Error('La moneda es requerida');
    }

    if (!input.ownerId || input.ownerId.trim().length === 0) {
      throw new Error('El propietario es requerido');
    }

    // Validar formato de moneda (ejemplo básico)
    const validCurrencies = ['USD', 'EUR', 'MXN', 'COP', 'PEN', 'CLP', 'ARS'];
    if (!validCurrencies.includes(input.currency.toUpperCase())) {
      throw new Error(`Moneda no válida. Monedas soportadas: ${validCurrencies.join(', ')}`);
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface CreateShopInput {
  name: string;
  description?: string;
  currency: string;
  ownerId: string;
}
