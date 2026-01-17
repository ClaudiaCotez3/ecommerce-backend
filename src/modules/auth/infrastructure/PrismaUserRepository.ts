import { PrismaClient } from '@prisma/client';
import type { UserRepository } from '../domain/UserRepository';
import { User } from '../domain/User';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return null;
      }

      return new User(
        user.id,
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        user.createdAt,
        user.updatedAt
      );
    } catch (error) {
      throw new Error(`Error finding user by email: ${error}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return null;
      }

      return new User(
        user.id,
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        user.createdAt,
        user.updatedAt
      );
    } catch (error) {
      throw new Error(`Error finding user by id: ${error}`);
    }
  }

  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.getId(),
          email: user.getEmail(),
          password: user.getPassword(),
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt()
        }
      });
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  async update(user: User): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: user.getId() },
        data: {
          email: user.getEmail(),
          password: user.getPassword(),
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          updatedAt: user.getUpdatedAt()
        }
      });
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany();
      
      return users.map(user => new User(
        user.id,
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        user.createdAt,
        user.updatedAt
      ));
    } catch (error) {
      throw new Error(`Error finding all users: ${error}`);
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      return user !== null;
    } catch (error) {
      throw new Error(`Error checking if user exists: ${error}`);
    }
  }
}
