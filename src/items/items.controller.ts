import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDTO } from './dtos/create-item';
import { UpdateItemDTO } from './dtos/update-item';
import { PaginationDTO } from 'src/common/dtos/pagination';
import { LoggerInterceptor } from 'src/common/interceptors/logger';
import { BodyLogger } from 'src/common/interceptors/body-logger';
import { AuthTokenGuard } from 'src/auth/guard/auth-token';
import { Request } from 'express';

@Controller('items')
@UseInterceptors(LoggerInterceptor)
export class ItemsController {
  constructor(private readonly itemService: ItemsService) {}

  @UseGuards(AuthTokenGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDTO) {
    return this.itemService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.findOne(id);
  }

  @Post()
  @UseInterceptors(BodyLogger)
  @UseGuards(AuthTokenGuard)
  create(@Body() body: CreateItemDTO, @Req() req: Request) {
    const payloadToken = req['user'];
    return this.itemService.create(body, payloadToken);
  }

  @Patch(':id')
  @UseInterceptors(BodyLogger)
  @UseGuards(AuthTokenGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateItemDTO) {
    return this.itemService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.delete(id);
  }
}
