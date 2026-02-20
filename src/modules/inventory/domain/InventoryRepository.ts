import { Inventory } from './Inventory';

/**
 * Interface del repositorio de Inventory
 * Define los contratos que debe cumplir cualquier implementación
 * NO depende de tecnologías específicas (Prisma, MongoDB, etc.)
 */
export interface InventoryRepository {
  /**
   * Crea un nuevo inventario para una variante
   */
  create(inventoryData: {
    variantId: number;
    quantity: number;
    minStockAlert: number;
  }): Promise<Inventory>;

  /**
   * Busca inventario por ID de variante
   */
  getByVariant(variantId: number): Promise<Inventory | null>;

  /**
   * Actualiza la cantidad de stock de una variante
   */
  updateStock(variantId: number, quantity: number): Promise<Inventory>;

  /**
   * Actualiza el mínimo de stock de alerta
   */
  updateMinStockAlert(variantId: number, minStockAlert: number): Promise<Inventory>;

  /**
   * Incrementa el stock (para entrada de inventario)
   */
  increaseStock(variantId: number, quantity: number): Promise<Inventory>;

  /**
   * Decrementa el stock (para ventas/salidas)
   */
  decreaseStock(variantId: number, quantity: number): Promise<Inventory>;

  /**
   * Lista inventarios con stock bajo
   */
  listLowStock(): Promise<Inventory[]>;

  /**
   * Lista inventarios sin stock
   */
  listOutOfStock(): Promise<Inventory[]>;

  /**
   * Verifica si existe inventario para una variante
   */
  existsForVariant(variantId: number): Promise<boolean>;
}
