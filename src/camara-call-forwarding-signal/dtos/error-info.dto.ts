import { ApiProperty } from '@nestjs/swagger';

export class ErrorInfoDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;
}
