import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerInterceptor } from 'src/common/interceptors/logger';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user';
import { UpdateUserDTO } from './dtos/update-user';
import { BodyLogger } from 'src/common/interceptors/body-logger';

@Controller('users')
@UseInterceptors(LoggerInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @UseInterceptors(BodyLogger)
  create(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @UseInterceptors(BodyLogger)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDTO,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
