import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dtos/create-user';
import { UpdateUserDTO } from './dtos/update-user';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async findOne(id: number) {
    const user = await this.prisma.users.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        Items: true,
      },
    });

    if (user) return user;

    throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
  }

  async create(createUserDto: CreateUserDTO) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );
      const user = await this.prisma.users.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Create operation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDTO) {
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          id,
        },
      });

      if (!user) {
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
      }

      const dataUser: { name?: string; passwordHash?: string } = {
        name: updateUserDto.name ? updateUserDto.name : user.name,
      };

      if (updateUserDto?.password) {
        const passwordHash = await this.hashingService.hash(
          updateUserDto?.password,
        );
        dataUser['passwordHash'] = passwordHash;
      }

      const updateUser = await this.prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          name: dataUser.name,
          passwordHash: dataUser?.passwordHash
            ? dataUser?.passwordHash
            : user.passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return updateUser;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Update operation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: number) {
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          id,
        },
      });

      if (!user) {
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
      }

      await this.prisma.users.delete({
        where: {
          id: user.id,
        },
      });

      return {
        message: 'User deleted',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Delete operation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
