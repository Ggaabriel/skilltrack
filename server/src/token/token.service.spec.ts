import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: { sign: () => 'token' } },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () => ({
              accessSecret: 'secret',
              refreshSecret: 'secret',
              accessExpiresIn: 1000,
              refreshExpiresIn: 1000,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
