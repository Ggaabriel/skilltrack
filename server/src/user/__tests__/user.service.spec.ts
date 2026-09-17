import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { jest } from '@jest/globals';

describe('UserService', () => {
  let service: UserService;

  const prisma = {
    user: {
      findUnique: jest
        .fn<() => Promise<{ id: number; email: string } | null>>()
        .mockResolvedValue({ id: 1, email: 'test@example.com' }),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    });
  });

  describe('defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('find by email', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const user = await service.findByEmail(email);
      expect(user).toBeDefined();
    });

    it('should throw an error if user is not found', async () => {
      const email = 'nonexistent@example.com';

      prisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.findByEmail(email)).rejects.toThrow(
        'User not found',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
