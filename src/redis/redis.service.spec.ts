import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RedisService } from './redis.service';
import { Message } from '../schemas/message.schema';

// Mock the Redis class
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  mget: jest.fn(),
  mset: jest.fn(),
  keys: jest.fn(),
};

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockRedis),
  };
});

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: typeof mockRedis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: getModelToken(Message.name),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    mockRedisClient = mockRedis;
    (service as any).client = mockRedisClient;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return value for key', async () => {
      const key = 'test:key';
      const value = 'test value';
      mockRedisClient.get.mockResolvedValue(value);

      const result = await service.get(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it('should return null for non-existent key', async () => {
      const key = 'test:key';
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without expiration', async () => {
      const key = 'test:key';
      const value = { test: 'value' };
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
      );
    });

    it('should set value with expiration', async () => {
      const key = 'test:key';
      const value = { test: 'value' };
      const ex = 3600;
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set(key, value, ex);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        ex,
      );
    });
  });

  describe('mset', () => {
    it('should set multiple key-value pairs', async () => {
      const data = {
        key1: 'value1',
        key2: 'value2',
      };
      mockRedisClient.mset.mockResolvedValue('OK');

      await service.mset(data);

      expect(mockRedisClient.mset).toHaveBeenCalledWith(
        'key1',
        'value1',
        'key2',
        'value2',
      );
    });
  });

  describe('mget', () => {
    it('should return empty array when no keys provided', async () => {
      const result = await service.mget([]);
      expect(result).toEqual([]);
      expect(mockRedisClient.mget).not.toHaveBeenCalled();
    });

    it('should return array of values for given keys', async () => {
      const keys = ['key1', 'key2'];
      const values = ['value1', 'value2'];
      mockRedisClient.mget.mockResolvedValue(values);

      const result = await service.mget(keys);

      expect(mockRedisClient.mget).toHaveBeenCalledWith(keys);
      expect(result).toEqual(values);
    });

    it('should filter out null values', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const values = ['value1', null, 'value3'];
      mockRedisClient.mget.mockResolvedValue(values);

      const result = await service.mget(keys);

      expect(mockRedisClient.mget).toHaveBeenCalledWith(keys);
      expect(result).toEqual(['value1', 'value3']);
    });
  });

  describe('keys', () => {
    it('should return array of keys matching pattern', async () => {
      const pattern = 'streamer:meta:*';
      const keys = ['streamer:meta:user1', 'streamer:meta:user2'];
      mockRedisClient.keys.mockResolvedValue(keys);

      const result = await service.keys(pattern);

      expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
      expect(result).toEqual(keys);
    });

    it('should return empty array when no keys match pattern', async () => {
      const pattern = 'streamer:meta:*';
      mockRedisClient.keys.mockResolvedValue([]);

      const result = await service.keys(pattern);

      expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
      expect(result).toEqual([]);
    });
  });

  describe('buildKey', () => {
    it('should return key without object', () => {
      const key = 'test:key';
      const result = service.buildKey(key);
      expect(result).toBe(key);
    });

    it('should return key with empty object', () => {
      const key = 'test:key';
      const result = service.buildKey(key, {});
      expect(result).toBe(key);
    });

    it('should build key with sorted object properties', () => {
      const key = 'test:key';
      const obj = {
        b: 'value2',
        a: 'value1',
        c: 'value3',
      };
      const result = service.buildKey(key, obj);
      expect(result).toBe('test:key:a:value1:b:value2:c:value3');
    });
  });
});
