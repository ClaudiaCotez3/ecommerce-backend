import { Injectable, Inject } from '@nestjs/common';
import type { SlugGenerator } from '../domain/SlugGenerator';
import type { ShopRepository } from '../domain/ShopRepository';

/**
 * Implementación simple del generador de slugs
 * Convierte nombres a formato slug y garantiza unicidad
 */
@Injectable()
export class SimpleSlugGenerator implements SlugGenerator {
  constructor(
    @Inject('ShopRepository')
    private readonly shopRepository: ShopRepository,
  ) {}

  async generateFromName(name: string): Promise<string> {
    // Generar slug básico
    let baseSlug = this.createBaseSlug(name);
    
    // Verificar unicidad y agregar sufijo si es necesario
    let slug = baseSlug;
    let counter = 1;

    while (await this.shopRepository.existsBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private createBaseSlug(name: string): string {
    return name
      .toLowerCase()                    // convertir a minúsculas
      .trim()                          // quitar espacios al inicio/final
      .replace(/[^\w\s-]/g, '')        // quitar caracteres especiales
      .replace(/[\s_-]+/g, '-')        // reemplazar espacios por guiones
      .replace(/^-+|-+$/g, '');        // quitar guiones al inicio/final
  }
}
