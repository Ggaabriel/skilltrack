import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserService Integration Tests', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let service: UserService;
  const testRunId = Date.now();
  const createdUserIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, UserService],
    }).compile();

    prisma = module.get(PrismaService);
    service = module.get(UserService);
    await prisma.$connect();
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await prisma.$disconnect();
    await module.close();
  });

  it('should create a user with a hashed password', async () => {
    const dto = createUserDto('create');

    const user = await service.create(dto);
    createdUserIds.push(user.id);

    expect(user).toMatchObject({
      email: dto.email,
      name: dto.name,
      picturePath: dto.picturePath,
    });
    expect(user).not.toHaveProperty('password');

    const stored = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(stored?.password).not.toBe(dto.password);
    expect(stored?.password).toMatch(/^\$2[aby]?\$/);
  });

  it('should find users with pagination metadata', async () => {
    const first = await service.create(createUserDto('first'));
    const second = await service.create(createUserDto('second'));
    createdUserIds.push(first.id, second.id);

    const result = await service.findAll(1, 1);

    expect(result).toMatchObject({ page: 1, limit: 1 });
    expect(result.users).toHaveLength(1);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it('should find a user by id and email', async () => {
    const created = await service.create(createUserDto('find'));
    createdUserIds.push(created.id);

    await expect(service.findOne(created.id)).resolves.toMatchObject({
      id: created.id,
      email: created.email,
    });
    await expect(service.findByEmail(created.email)).resolves.toMatchObject({
      id: created.id,
      email: created.email,
    });
  });

  it('should update a user', async () => {
    const created = await service.create(createUserDto('update'));
    createdUserIds.push(created.id);
    const update: UpdateUserDto = {
      email: `updated.${testRunId}@example.com`,
      name: 'Updated User',
      password: 'newpass',
      picturePath: 'updated-picture.png',
    };

    await expect(service.update(created.id, update)).resolves.toMatchObject({
      id: created.id,
      email: update.email,
      name: update.name,
      picturePath: update.picturePath,
    });
  });

  it('should remove a user', async () => {
    const created = await service.create(createUserDto('remove'));
    await expect(service.remove(created.id)).resolves.toMatchObject({
      id: created.id,
      email: created.email,
    });

    await expect(
      prisma.user.findUnique({ where: { id: created.id } }),
    ).resolves.toBeNull();
  });

  it('should throw when an email does not exist', async () => {
    await expect(
      service.findByEmail(`missing.${testRunId}@example.com`),
    ).rejects.toThrow('User not found');
  });

  function createUserDto(label: string): CreateUserDto {
    return {
      email: `${label}.${testRunId}@example.com`,
      name: `${label} user`,
      password: 'password123',
      picturePath: `${label}.png`,
    };
  }
});
