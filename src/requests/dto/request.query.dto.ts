import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumberString, IsOptional } from "class-validator";

export class RequestQueryDto {
 @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}