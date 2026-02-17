/**
 * Entidad de dominio Role
 * Representa un rol que puede ser asignado a usuarios en tiendas
 */
export class Role {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
  ) {
    this.validateRole();
  }

  private validateRole(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del rol es requerido');
    }

    if (this.name.length > 50) {
      throw new Error('El nombre del rol no puede exceder 50 caracteres');
    }
  }

  /**
   * Verifica si es un rol de administrador
   */
  isAdmin(): boolean {
    return this.name.toLowerCase().includes('admin');
  }

  /**
   * Verifica si es un rol de manager/gerente
   */
  isManager(): boolean {
    const managerTerms = ['manager', 'gerente', 'jefe', 'supervisor'];
    return managerTerms.some(term => 
      this.name.toLowerCase().includes(term)
    );
  }

  /**
   * Verifica si es un rol de empleado básico
   */
  isEmployee(): boolean {
    const employeeTerms = ['employee', 'empleado', 'staff', 'worker'];
    return employeeTerms.some(term => 
      this.name.toLowerCase().includes(term)
    );
  }
}

/**
 * Interface del repositorio de Role
 * Define los contratos para gestionar roles
 */
export interface RoleRepository {
  /**
   * Busca un rol por su ID
   */
  findById(id: number): Promise<Role | null>;

  /**
   * Busca un rol por su nombre
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * Lista todos los roles disponibles
   */
  findAll(): Promise<Role[]>;

  /**
   * Verifica si un rol existe
   */
  exists(id: number): Promise<boolean>;
}
