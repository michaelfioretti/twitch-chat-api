/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsOptional,
  IsNumber,
  IsPositive,
  Max,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MAX_TIMEFRAME } from '../../common/constants';

export class GetBitsDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  channels?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(MAX_TIMEFRAME)
  timeframe?: number;
}
