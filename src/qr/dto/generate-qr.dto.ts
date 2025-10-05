import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, Max, Min } from "class-validator";

export enum QrTokenType {
  CONNECTION = 'CONNECTION',
  PRESCRIPTION_VIEW = 'PRESCRIPTION_VIEW',
  EMERGENCY_ACCESS = 'EMERGENCY_ACCESS'
}
export class CreateQrDto {
    
    @ApiPropertyOptional({
    enum: QrTokenType,
    default: QrTokenType.CONNECTION,
    description: 'نوع الـ QR Code'
  })
    @IsOptional()
    @IsEnum(QrTokenType)
    type?: QrTokenType = QrTokenType.CONNECTION;

    @ApiPropertyOptional({
    description: 'مدة صلاحية الـ QR بالدقائق (افتراضي 5)',
    minimum: 1,
    maximum: 60,
    default: 5
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(60)
    expiryMinutes?: number = 5;

    @ApiPropertyOptional({
    description: 'بيانات إضافية (optional)',
    example: { clinicRoom: '3A', notes: 'Emergency patient' }
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

