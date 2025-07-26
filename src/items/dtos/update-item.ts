import { PartialType } from '@nestjs/swagger';
import { CreateItemDTO } from './create-item';

export class UpdateItemDTO extends PartialType(CreateItemDTO) {}
