import { Category } from '../domain/Category';
import { CategoryRepository } from '../domain/CategoryRepository';

/**
 * Caso de uso: Crear una nueva categoría
 * Encapsula la lógica de negocio para la creación de categorías
 */
export class CreateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que no exista una categoría con el mismo nombre en la tienda
    const existsCategory = await this.categoryRepository.existsByName(
      input.shopId,
      input.name
    );

    if (existsCategory) {
      throw new Error(`Ya existe una categoría con el nombre '${input.name}' en esta tienda`);
    }

    // Crear la entidad de dominio
    const categoryData = Category.create(
      input.shopId,
      input.name,
      input.description || null,
    );

    // Guardar en el repositorio
    const createdCategory = await this.categoryRepository.create(categoryData);

    return createdCategory;
  }

  private validateInput(input: CreateCategoryInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('El nombre de la categoría es requerido');
    }

    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    // Validar longitud del nombre
    if (input.name.length > 100) {
      throw new Error('El nombre de la categoría no puede exceder 100 caracteres');
    }

    // Validar caracteres especiales (opcional, según reglas del negocio)
    const validNameRegex = /^[a-zA-Z0-9\s\-_áéíóúñüÁÉÍÓÚÑÜ]+$/;
    if (!validNameRegex.test(input.name)) {
      throw new Error('El nombre de la categoría contiene caracteres no válidos');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface CreateCategoryInput {
  shopId: number;
  name: string;
  description?: string;
}
