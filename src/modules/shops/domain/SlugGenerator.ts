/**
 * Servicio de dominio para generar slugs
 * Abstracción para diferentes estrategias de generación de slugs
 */
export interface SlugGenerator {
  /**
   * Genera un slug único basado en el nombre de la tienda
   */
  generateFromName(name: string): Promise<string>;
}
