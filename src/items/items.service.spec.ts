import { PrismaService } from "src/prisma/prisma.service";
import { ItemsService } from "./items.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateItemDTO } from "./dtos/create-item";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PaginationDTO } from "src/common/dtos/pagination";
import { UpdateItemDTO } from "./dtos/update-item";

describe("Item Service", () => {
    let itemsService: ItemsService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsService,
                {
                    provide: PrismaService,
                    useValue: {
                        items: {
                            create: jest.fn().mockResolvedValue({
                                id: 1,
                                name: 'Novo item',
                                description: 'Nova descrição',
                                userId: 1
                            }),
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                            findFirstOrThrow: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn()
                        }
                    }
                }
            ],
        }).compile();

        itemsService = module.get<ItemsService>(ItemsService);
        prismaService = module.get<PrismaService>(PrismaService);
    })

    it('[CONSTRUCTOR] - should be define user service with constructor', () => {
        expect(itemsService).toBeDefined();
    })

    describe("[CREATE ITEM]", () => {
        it('should create a item', async () => {
            const createItemDto: CreateItemDTO = {
                name: 'Novo item',
                description: 'Nova descrição',
            }

            const payloadToken = 'PAYLOAD_TOKEN';

            const result = await itemsService.create(createItemDto, payloadToken);

            expect(result).toEqual({
                id: 1,
                name: 'Novo item',
                description: 'Nova descrição',
                userId: 1
            })
        })

        it('should throw exception if item is not created', async () => {
            const createItemDto: CreateItemDTO = {
                name: 'Novo item',
                description: 'Nova descrição',
            }

            const payloadToken = 'PAYLOAD_TOKEN';

            jest.spyOn(prismaService.items, 'create').mockRejectedValue(new Error('Database error'));

            await expect(itemsService.create(createItemDto, payloadToken)).rejects.toThrow(
                new HttpException('Create operation failed', HttpStatus.BAD_REQUEST)
            );
            expect(prismaService.items.create).toHaveBeenCalledWith({
                data: {
                    name: createItemDto.name,
                    description: createItemDto.description,
                    userId: payloadToken.sub,
                },
            });
        })
    })

    describe('[FIND ALL]', () => {
        it('should find all items', async () => {
            const paginationDto: PaginationDTO = {
                limit: 10,
                offset: 0
            }

            const itemsMock = [
                {
                    id: 1,
                    name: 'Item 01',
                    description: 'Descrição do item 01',
                    createdAt: new Date(),
                    userId: 1
                },
                {
                    id: 2,
                    name: 'Item 02',
                    description: 'Descrição do item 02',
                    createdAt: new Date(),
                    userId: 1
                },
                {
                    id: 3,
                    name: 'Item 03',
                    description: 'Descrição do item 03',
                    createdAt: new Date(),
                    userId: 1
                }
            ];

            jest.spyOn(prismaService.items, 'findMany').mockResolvedValue(itemsMock);

            const result = await itemsService.findAll(paginationDto);

            expect(result).toEqual(itemsMock);

        })
    })

    describe('[FIND ONE]', () => {
        it('should find one user', async () => {
            const itemMock = {
                id: 1,
                name: 'Item 01',
                description: 'Descrição do item 01',
                createdAt: new Date(),
                userId: 1
            };

            jest.spyOn(prismaService.items, 'findFirstOrThrow').mockResolvedValue(itemMock);

            const result = await itemsService.findOne(1);

            expect(prismaService.items.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                    id: 1,
                }
            });
            expect(result).toEqual(itemMock);
        })

        it('should throw exception if item is not found', async () => {
            jest.spyOn(prismaService.items, 'findFirstOrThrow').mockRejectedValue(new HttpException('Item not found', HttpStatus.NOT_FOUND));

            await expect(itemsService.findOne(1)).rejects.toThrow(
                new HttpException('Item not found', HttpStatus.NOT_FOUND)
            )
            expect(prismaService.items.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                    id: 1,
                }
            })
        })
    })

    describe('[UPDATE]', () => {
        it('should update item', async () => {
            const updateItemDto: UpdateItemDTO = {
                name: 'Novo nome do item',
                description: 'Nova descrição do item'
            };

            const itemMock = {
                id: 1,
                name: 'Item 01',
                description: 'Descrição do item 01',
                createdAt: new Date(),
                userId: 1
            };

            const updateItemMock = {
                id: 1,
                name: 'Novo nome do item',
                description: 'Nova descrição do item',
                createdAt: new Date(),
                userId: 1
            };

            jest.spyOn(prismaService.items, 'findFirst').mockResolvedValue(itemMock);
            jest.spyOn(prismaService.items, 'update').mockResolvedValue(updateItemMock);

            const result = await itemsService.update(1, updateItemDto);

            expect(result).toEqual(updateItemMock);
        })

        it('should throw exception if update is failed', async () => {
            const updateItemDto: UpdateItemDTO = {
                name: 'Novo nome do item',
                description: 'Nova descrição do item'
            };

            jest.spyOn(prismaService.items, 'findFirst').mockResolvedValue(null);

             await expect(itemsService.update(1, updateItemDto)).rejects.toThrow(
                new HttpException(
                    'Update operation failed',
                    HttpStatus.BAD_REQUEST,
                )
            );
        })
    })

    describe('[DELETE]', () => {
        it('should delete item', async () => {
            const itemMock = {
                id: 1,
                name: 'Item 01',
                description: 'Descrição do item 01',
                createdAt: new Date(),
                userId: 1
            };

            jest.spyOn(prismaService.items, 'findFirst').mockResolvedValue(itemMock);

            const result = await itemsService.delete(1);

             expect(prismaService.items.delete).toHaveBeenCalledWith({
                where: {
                    id: itemMock.id
                }
            });

            expect(result).toEqual({
                message: 'Item deleted',
            })
        })

        it('should throw exception if delete is failed', async () => {
            jest.spyOn(prismaService.items, 'findFirst').mockResolvedValue(null);
            await expect(itemsService.delete(1)).rejects.toThrow(
                new HttpException(
                    'Delete operation failed',
                    HttpStatus.BAD_REQUEST,
                )
            );
        })
    })
})