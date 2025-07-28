import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "./users.service"
import { HashingServiceProtocol } from "src/auth/hash/hashing.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserDTO } from "./dtos/create-user";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UpdateUserDTO } from "./dtos/update-user";

describe('User Service', () => {
    let userService: UsersService;
    let prismaService: PrismaService;
    let hashingService: HashingServiceProtocol

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        users: {
                            create: jest.fn().mockResolvedValue({
                                id: 1,
                                name: "Guilherme Beneti",
                                email: "guilherme@email.com"
                            }),
                            findFirst: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn()
                        }
                    }
                },
                {
                    provide: HashingServiceProtocol,
                    useValue: {
                        hash: jest.fn()
                    }
                }
            ],
        }).compile();

        userService = module.get<UsersService>(UsersService);
        prismaService = module.get<PrismaService>(PrismaService);
        hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    })

    it('[CONSTRUCTOR] - should be define user service with constructor', () => {
        expect(userService).toBeDefined();
    })

    describe("[CREATE USER]", () => {
        it("should create a new user", async () => {
            const createUserDto: CreateUserDTO = {
                email: "guilherme@email.com",
                name: "Guilherme Beneti",
                password: "123123"
            }

            jest.spyOn(hashingService, 'hash').mockResolvedValue("HASH_MOCK_TEST");

            const result = await userService.create(createUserDto);

            expect(hashingService.hash).toHaveBeenCalled();
            expect(prismaService.users.create).toHaveBeenCalledWith({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                    passwordHash: "HASH_MOCK_TEST",
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });
            expect(result).toEqual({
                id: 1,
                name: "Guilherme Beneti",
                email: "guilherme@email.com"
            })
        })

        it("it shoult throw exception if user is not created", async () => {
            const createUserDto: CreateUserDTO = {
                email: "guilherme@email.com",
                name: "Guilherme Beneti",
                password: "123123"
            }

            jest.spyOn(hashingService, 'hash').mockResolvedValue("HASH_MOCK_TEST");
            jest.spyOn(prismaService.users, 'create').mockRejectedValue(new Error('Database error'));

            await expect(userService.create(createUserDto)).rejects.toThrow(
                new HttpException('Create operation failed', HttpStatus.BAD_REQUEST)
            );

            expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
            expect(prismaService.users.create).toHaveBeenCalledWith({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                    passwordHash: "HASH_MOCK_TEST",
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });
        })
    })

    describe("[FIND ONE USER]", () => {
        it("should return a user when found", async () => {
            const userMock = {
                id: 1,
                name: "Guilherme Beneti",
                email: "guilherme@email.com",
                passwordHash: "hash_mock",
                active: true,
                Items: [],
                createdAt: new Date()
            }

            jest.spyOn(prismaService.users, "findFirst").mockResolvedValue(userMock);

            const result = await userService.findOne(1);

            expect(prismaService.users.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    Items: true,
                },
            });
            expect(result).toEqual(userMock);
        })

        it("should throw exception when user is not found", async () => {
            jest.spyOn(prismaService.users, "findFirst").mockResolvedValue(null);

            await expect(userService.findOne(1)).rejects.toThrow(
                new HttpException('User not found!', HttpStatus.NOT_FOUND)
            )
            expect(prismaService.users.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    Items: true,
                },
            })
        })
    })

    describe("[UPDATE USER]", () => {
        it("should update user", async () => {
            const updateUserDto: UpdateUserDTO = {
                name: 'New Name',
                password: 'NewPassword'
            }
            const userMock = {
                id: 1,
                name: 'Guilherme',
                email: 'guilherme@email.com',
                passwordHash: 'hash_test',
                active: true,
                createdAt: new Date()
            }
            const updateUser = {
                id: 1,
                name: 'New Name',
                email: 'guilherme@email.com',
                passwordHash: 'hash_test_new',
                active: true,
                createdAt: new Date()
            }

            jest.spyOn(prismaService.users, 'findFirst').mockResolvedValue(userMock);
            jest.spyOn(hashingService, 'hash').mockResolvedValue('hash_test_new');
            jest.spyOn(prismaService.users, 'update').mockResolvedValue(updateUser);

            const result = await userService.update(1, updateUserDto);

            expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password)
            expect(prismaService.users.update).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                data: {
                    name: updateUserDto.name,
                    passwordHash: 'hash_test_new'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });
            expect(result).toEqual(updateUser);
        })

        it("should throw exception when user is not found", async () => {
            const updateUserDto: UpdateUserDTO = {
                name: 'New Name'
            }

            jest.spyOn(prismaService.users, 'findFirst').mockResolvedValue(null);

            await expect(userService.update(1, updateUserDto)).rejects.toThrow(
                new HttpException(
                    'Update operation failed',
                    HttpStatus.BAD_REQUEST,
                )
            );
        })
    })

    describe("[DELETE USER]", () => {
        it("should delete user", async () => {
            const userMock = {
                id: 1,
                name: 'Guilherme',
                email: 'guilherme@email.com',
                passwordHash: 'hash_test',
                active: true,
                createdAt: new Date()
            }

            jest.spyOn(prismaService.users, 'findFirst').mockResolvedValue(userMock);
            jest.spyOn(prismaService.users, 'delete').mockResolvedValue(userMock);

            const result = await userService.delete(1);

            expect(prismaService.users.delete).toHaveBeenCalledWith({
                where: {
                    id: userMock.id
                }
            });
            expect(result).toEqual({
                message: 'User deleted',
            });
        })

        it("should throw error when user is not found", async () => {
            jest.spyOn(prismaService.users, 'findFirst').mockResolvedValue(null);
            await expect(userService.delete(1)).rejects.toThrow(
                new HttpException(
                    'Delete operation failed',
                    HttpStatus.BAD_REQUEST,
                )
            );
        })
    })
})