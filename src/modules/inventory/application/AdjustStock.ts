import { Inventory } from '../domain/Inventory';
import { InventoryRepository } from '../domain/InventoryRepository';

/**
 * Caso de uso: Ajustar stock de inventario (incremento o decremento)
 * Permite hacer movimientos de entrada y salida de inventario
 */
export class AdjustStock {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: AdjustStockInput): Promise<Inventory> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que existe inventario para la variante
    const existingInventory = await this.inventoryRepository.getByVariant(input.variantId);

    if (!existingInventory) {
      throw new Error('No existe inventario para esta variante');
    }

    // Validar que la operación es posible
    if (input.adjustment < 0 && !existingInventory.hasSufficientStock(Math.abs(input.adjustment))) {
      throw new Error(`Stock insuficiente. Stock actual: ${existingInventory.quantity}, Cantidad requerida: ${Math.abs(input.adjustment)}`);
    }

    // Realizar el ajuste
    let updatedInventory: Inventory;

    if (input.adjustment > 0) {
      // Incremento de stock (entrada)
      updatedInventory = await this.inventoryRepository.increaseStock(
        input.variantId,
        input.adjustment
      );
    } else {
      // Decremento de stock (salida)
      updatedInventory = await this.inventoryRepository.decreaseStock(
        input.variantId,
        Math.abs(input.adjustment)
      );
    }

    return updatedInventory;
  }

  private validateInput(input: AdjustStockInput): void {
    if (!input.variantId || input.variantId <= 0) {
      throw new Error('El ID de la variante es requerido y debe ser válido');
    }

    if (input.adjustment === undefined || input.adjustment === null) {
      throw new Error('El ajuste de cantidad es requerido');
    }

    if (input.adjustment === 0) {
      throw new Error('El ajuste no puede ser cero');
    }

    if (!Number.isInteger(input.adjustment)) {
      throw new Error('El ajuste debe ser un número entero');
    }

    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error('La razón del ajuste es requerida');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface AdjustStockInput {
  variantId: number;
  adjustment: number; // Positivo para incremento, negativo para decremento
  reason: string; // Motivo del ajuste (venta, devolución, pérdida, etc.)
}
