import { CategoryRepository } from '../domain/CategoryRepository';

/**
 * Caso de uso: Asignar un producto a una categoría
 * Encapsula la lógica de negocio para relacionar productos con categorías
 */
export class AssignProductToCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: AssignProductToCategoryInput): Promise<void> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que la categoría existe
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error('La categoría especificada no existe');
    }

    // Verificar que el producto no esté ya asignado a esta categoría
    const isAlreadyAssigned = await this.categoryRepository.isProductAssigned(
      input.categoryId,
      input.productId
    );

    if (isAlreadyAssigned) {
      throw new Error('El producto ya está asignado a esta categoría');
    }

    // TODO: Aquí deberías validar que el producto existe y pertenece a la misma tienda
    // Esto requeriría acceso al ProductRepository, que podrías inyectar como dependencia
    // Por simplicidad, asumimos que esta validación se hace en el controller o en otro lugar

    // Asignar el producto a la categoría
    await this.categoryRepository.assignProduct(input.categoryId, input.productId);
  }

  private validateInput(input: AssignProductToCategoryInput): void {
    if (!input.categoryId || input.categoryId <= 0) {
      throw new Error('El ID de la categoría es requerido y debe ser válido');
    }

    if (!input.productId || input.productId <= 0) {
      throw new Error('El ID del producto es requerido y debe ser válido');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface AssignProductToCategoryInput {
  categoryId: number;
  productId: number;
}
