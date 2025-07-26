import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerInterceptor } from 'src/common/interceptors/logger';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user';
import { UpdateUserDTO } from './dtos/update-user';
import { BodyLogger } from 'src/common/interceptors/body-logger';
import { AuthTokenGuard } from 'src/auth/guard/auth-token';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResponseCreateOrUpdateUserDTO, ResponseUserDTO } from './dtos/response-user';

@Controller('users')
@UseInterceptors(LoggerInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get User'})
  @UseGuards(AuthTokenGuard)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseUserDTO> {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create User'})
  @UseInterceptors(BodyLogger)
  @UseGuards(AuthTokenGuard)
  create(@Body() createUserDto: CreateUserDTO): Promise<ResponseCreateOrUpdateUserDTO> {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update User'})
  @ApiBearerAuth()
  @UseInterceptors(BodyLogger)
  @UseGuards(AuthTokenGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<ResponseCreateOrUpdateUserDTO>{
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete User'})
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
