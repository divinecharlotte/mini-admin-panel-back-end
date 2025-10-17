import { ApiProperty } from '@nestjs/swagger';

export class UserDto {

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  role: string;

  @ApiProperty({ example: 'active' })
  status: string;
}
