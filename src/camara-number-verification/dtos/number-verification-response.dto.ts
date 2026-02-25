import { ApiProperty } from '@nestjs/swagger';

/** Response body for POST /verify */
export class NumberVerificationMatchResponseDto {
  @ApiProperty({
    description: "true if the supplied number matches the access token's phone",
    example: true,
  })
  devicePhoneNumberVerified: boolean;
}

/** Response body for GET /device-phone-number */
export class NumberVerificationShareResponseDto {
  @ApiProperty({
    description: "E.164 phone number associated with the end-user's SIM",
    pattern: '^\\+[1-9][0-9]{4,14}$',
    example: '+123456789',
  })
  devicePhoneNumber: string;
}
