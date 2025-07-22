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
  UseInterceptors,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDTO } from './dtos/create-item';
import { UpdateItemDTO } from './dtos/update-item';
import { PaginationDTO } from 'src/common/dtos/pagination';
import { LoggerInterceptor } from 'src/common/interceptors/logger';
import { BodyLogger } from 'src/common/interceptors/body-logger';

@Controller('items')
@UseInterceptors(LoggerInterceptor)
export class ItemsController {
  constructor(private readonly itemService: ItemsService) {}

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
  create(@Body() body: CreateItemDTO) {
    return this.itemService.create(body);
  }

  @Patch(':id')
  @UseInterceptors(BodyLogger)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateItemDTO) {
    return this.itemService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.delete(id);
  }
}
