import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EventService } from '../event/event.service';

type UserView = {
  id: number;
  email?: string;
  name?: string;
  picturePath?: string | null;
};

type UsersPage = {
  users: UserView[];
  total: number;
  page: number;
  limit: number;
};

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    create: jest.fn<(dto: unknown) => Promise<UserView>>(),
    findAll: jest.fn<() => Promise<UsersPage>>(),
    findOne: jest.fn<(id: number) => Promise<UserView | null>>(),
    update: jest.fn<(id: number, dto: unknown) => Promise<UserView>>(),
    remove: jest.fn<(id: number) => Promise<UserView>>(),
  };
  const eventService = {
    getUserEvents:
      jest.fn<
        (userId: number, startDate: string, endDate: string) => Promise<unknown>
      >(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: EventService, useValue: eventService },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  beforeEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(controller).toBeDefined());

  it('should create a user in a response container', async () => {
    const dto = { email: 'user@example.com', name: 'User', password: 'pass' };
    const user = { id: 1, email: dto.email, name: dto.name };
    userService.create.mockResolvedValue(user);

    await expect(controller.create(dto)).resolves.toEqual({ data: user });
    expect(userService.create).toHaveBeenCalledWith(dto);
  });

  it('should return users with pagination metadata', async () => {
    userService.findAll.mockResolvedValue({
      users: [{ id: 1 }],
      total: 11,
      page: 1,
      limit: 10,
    });

    await expect(controller.findAll()).resolves.toEqual({
      data: [{ id: 1 }],
      meta: { total: 11, page: 1, lastPage: 2 },
    });
  });

  it('should return current user events', async () => {
    const query = { startDate: '2026-09-13', endDate: '2026-09-14' };
    eventService.getUserEvents.mockResolvedValue([{ id: 1 }]);

    await expect(
      controller.findEvents({ userId: 7 } as never, query as never),
    ).resolves.toEqual({
      data: [{ id: 1 }],
    });
    expect(eventService.getUserEvents).toHaveBeenCalledWith(
      7,
      query.startDate,
      query.endDate,
    );
  });

  it('should return the current user without the id', async () => {
    userService.findOne.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      name: 'User',
    });

    await expect(controller.getMe({ userId: 7 } as never)).resolves.toEqual({
      data: { email: 'user@example.com', name: 'User' },
    });
  });

  it('should return a user by route id', async () => {
    userService.findOne.mockResolvedValue({ id: 7, name: 'User' });

    await expect(controller.findOne('7')).resolves.toEqual({
      data: { id: 7, name: 'User' },
    });
    expect(userService.findOne).toHaveBeenCalledWith(7);
  });

  it('should update the current user', async () => {
    const dto = { email: 'new@example.com', name: 'New', password: 'pass' };
    const updated = { id: 7, ...dto };
    userService.update.mockResolvedValue(updated);

    await expect(
      controller.update({ userId: 7 } as never, dto as never),
    ).resolves.toEqual({ data: updated });
    expect(userService.update).toHaveBeenCalledWith(7, dto);
  });

  it('should remove the current user', async () => {
    const removed = { id: 7, email: 'user@example.com' };
    userService.remove.mockResolvedValue(removed);

    await expect(controller.remove({ userId: 7 } as never)).resolves.toEqual(
      removed,
    );
    expect(userService.remove).toHaveBeenCalledWith(7);
  });
});
