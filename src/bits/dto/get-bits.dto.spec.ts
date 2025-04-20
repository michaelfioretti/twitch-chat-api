import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetBitsDto } from './get-bits.dto';
import { MAX_TIMEFRAME } from '../../common/constants';

describe('GetBitsDto', () => {
  it('should pass with valid channels and timeframe', async () => {
    const input = {
      channels: 'channel1,channel2',
      timeframe: 1000,
    };

    const dto = plainToInstance(GetBitsDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.channels).toEqual(['channel1', 'channel2']);
    expect(dto.timeframe).toBe(1000);
  });

  it('should fail if timeframe is negative', async () => {
    const input = {
      channels: 'channel1',
      timeframe: -100,
    };

    const dto = plainToInstance(GetBitsDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('timeframe');
  });

  it('should fail if timeframe exceeds MAX_TIMEFRAME', async () => {
    const input = {
      channels: 'channel1',
      timeframe: MAX_TIMEFRAME + 1,
    };

    const dto = plainToInstance(GetBitsDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('timeframe');
  });

  it('should transform a single channel string to an array', async () => {
    const input = {
      channels: 'onlyone',
    };

    const dto = plainToInstance(GetBitsDto, input);
    await validate(dto);

    expect(dto.channels).toEqual(['onlyone']);
  });

  it('should fail if channels is an empty string', async () => {
    const input = {
      channels: '',
    };

    const dto = plainToInstance(GetBitsDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('channels');
  });

  it('should pass with only timeframe', async () => {
    const input = {
      timeframe: 500,
    };

    const dto = plainToInstance(GetBitsDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass with only channels', async () => {
    const input = {
      channels: 'test1,test2',
    };

    const dto = plainToInstance(GetBitsDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.channels).toEqual(['test1', 'test2']);
  });
});
