/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemDTO } from './dtos/create-item';
import { UpdateItemDTO } from './dtos/update-item';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDTO } from 'src/common/dtos/pagination';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(paginationDto?: PaginationDTO) {
    const limit = paginationDto?.limit ?? 10;
    const offset = paginationDto?.offset ?? 0;
    const items = await this.prisma.items.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return items;
  }

  async findOne(id: number) {
    const item = await this.prisma.items.findFirstOrThrow({
      where: {
        id,
      },
    });

    if (item?.name) return item;

    throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
  }

  async create(createItemDTO: CreateItemDTO) {
    try {
      const newItem = await this.prisma.items.create({
        data: {
          name: createItemDTO.name,
          description: createItemDTO.description,
          userId: createItemDTO.userId,
        },
      });

      return newItem;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Create operation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, updateItemDTO: UpdateItemDTO) {
    try {
      const itemAlreadyExists = await this.prisma.items.findFirst({
        where: {
          id,
        },
      });

      if (!itemAlreadyExists) {
        throw new HttpException('Item already exists!', HttpStatus.BAD_REQUEST);
      }

      const item = await this.prisma.items.update({
        where: {
          id: itemAlreadyExists.id,
        },
        data: {
          name: updateItemDTO.name
            ? updateItemDTO.name
            : itemAlreadyExists.name,
          description: updateItemDTO.description
            ? updateItemDTO.description
            : itemAlreadyExists.description,
        },
      });

      return item;
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
      const itemFound = await this.prisma.items.findFirst({
        where: {
          id,
        },
      });

      if (!itemFound) {
        throw new HttpException('Item not found!', HttpStatus.NOT_FOUND);
      }

      await this.prisma.items.delete({
        where: {
          id: itemFound.id,
        },
      });

      return {
        message: 'Item deleted',
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
