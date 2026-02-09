import { ApiProperty } from '@nestjs/swagger';

export class UnconditionalCallForwardingSignalDto {
  @ApiProperty()
  active: boolean;
}
