import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserEntity, UserWithoutPassword } from '../entity/user.entity';
import { User, Role } from '@prisma/client';
import { PrismaService } from '@app/prisma';
import * as bcrypt from 'bcrypt';

const tokenBlacklist = new Set<string>();

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    const { password: _, ...result } = user;
    return result;
  }

  login(user: UserWithoutPassword) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: payload,
    };
  }

  logout(token: string): void {
    tokenBlacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ success: boolean; message: string; data: UserWithoutPassword }> {
    if (!createUserDto || !createUserDto.email) {
      throw new BadRequestException(
        'Invalid user data - email field is missing',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
      },
    });

    const userEntity = UserEntity.fromPrisma(user);

    return {
      success: true,
      message: 'User created successfully',
      data: userEntity.toJSON(),
    };
  }

  async getUsers(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return UserEntity.fromPrismaArray(users);
  }

  async getUsersByProperty(
    property: string,
    value: string,
  ): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { [property]: value },
    });
    return UserEntity.fromPrismaArray(users);
  }

  async getUser(property: string, value: string): Promise<UserEntity> {
    const user: User | null = await this.prisma.user.findFirst({
      where: { [property]: value },
    });
    return UserEntity.fromPrisma(user as User);
  }

  // async search(query: string): Promise<UserEntity[]> {
  //   const users = await this.prisma.user.findMany({
  //     where: {
  //       OR: [
  //         { name: { contains: query, mode: 'insensitive' } },
  //         { email: { contains: query, mode: 'insensitive' } },
  //       ],
  //     },
  //   });
  //   return UserEntity.fromPrismaArray(users as User[]);
  // }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; message: string; data: UserWithoutPassword }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser: User | null = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
    } = {};

    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.email !== undefined)
      updateData.email = updateUserDto.email;
    if (updateUserDto.password !== undefined) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.role !== undefined) updateData.role = updateUserDto.role;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const userEntity = UserEntity.fromPrisma(updatedUser);

    return {
      success: true,
      message: 'User updated successfully',
      data: userEntity.toJSON(),
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return user;
  }
}
