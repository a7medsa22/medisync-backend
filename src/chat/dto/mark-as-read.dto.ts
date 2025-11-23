import { IsString, IsNotEmpty } from 'class-validator';

export class MarkAsReadDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;
}
