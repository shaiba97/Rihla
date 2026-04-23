import { Role } from '@prisma/client';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity implements User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  static fromPrisma(user: User): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static fromPrismaArray(users: User[]): UserEntity[] {
    return users.map((user) => UserEntity.fromPrisma(user));
  }

  toJSON(): Omit<User, 'password'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type UserWithoutPassword = Omit<User, 'password'>;
