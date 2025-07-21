import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDTO } from './create-item';

export class UpdateItemDTO extends PartialType(CreateItemDTO) {}
