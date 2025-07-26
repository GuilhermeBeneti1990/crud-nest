import { ApiProperty } from '@nestjs/swagger';

export class ResponseItemDTO {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    createdAt: Date | null;
    @ApiProperty()
    userId: number | null;
}