import { Inventory } from '../domain/Inventory';
import { InventoryRepository } from '../domain/InventoryRepository';

/**
 * Caso de uso: Actualizar stock de una variante
 * Establece una cantidad específica de stock
 */
export class UpdateStock {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: UpdateStockInput): Promise<Inventory> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar si existe inventario para la variante
    const existingInventory = await this.inventoryRepository.getByVariant(input.variantId);

    if (!existingInventory) {
      // Si no existe inventario, crear uno nuevo
      const inventoryData = Inventory.create(
        input.variantId,
        input.quantity,
        input.minStockAlert || 0,
      );

      const newInventory = await this.inventoryRepository.create(inventoryData);
      return newInventory;
    }

    // Si existe, actualizar la cantidad
    const updatedInventory = await this.inventoryRepository.updateStock(
      input.variantId, 
      input.quantity
    );

    return updatedInventory;
  }

  private validateInput(input: UpdateStockInput): void {
    if (!input.variantId || input.variantId <= 0) {
      throw new Error('El ID de la variante es requerido y debe ser válido');
    }

    if (input.quantity === undefined || input.quantity === null) {
      throw new Error('La cantidad es requerida');
    }

    if (input.quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    if (!Number.isInteger(input.quantity)) {
      throw new Error('La cantidad debe ser un número entero');
    }

    // Validar minStockAlert si se proporciona
    if (input.minStockAlert !== undefined && input.minStockAlert < 0) {
      throw new Error('La alerta de stock mínimo no puede ser negativa');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface UpdateStockInput {
  variantId: number;
  quantity: number;
  minStockAlert?: number;
}
