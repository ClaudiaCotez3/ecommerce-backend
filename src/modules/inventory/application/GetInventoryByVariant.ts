import { Inventory } from '../domain/Inventory';
import { InventoryRepository } from '../domain/InventoryRepository';

/**
 * Caso de uso: Obtener inventario por variante
 * Devuelve la información de stock de una variante específica
 */
export class GetInventoryByVariant {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: GetInventoryByVariantInput): Promise<Inventory | null> {
    // Validar entrada
    this.validateInput(input);

    // Obtener inventario del repositorio
    const inventory = await this.inventoryRepository.getByVariant(input.variantId);

    return inventory;
  }

  private validateInput(input: GetInventoryByVariantInput): void {
    if (!input.variantId || input.variantId <= 0) {
      throw new Error('El ID de la variante es requerido y debe ser válido');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface GetInventoryByVariantInput {
  variantId: number;
}
