/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateItemDTO {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;
}
