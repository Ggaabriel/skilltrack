import { Test, TestingModule } from '@nestjs/testing';
import { AuthCookieService } from './auth-cookie.service';
import { ConfigService } from '@nestjs/config';

describe('AuthCookieService', () => {
  let service: AuthCookieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCookieService,
        { provide: ConfigService, useValue: { getOrThrow: () => '1' } },
      ],
    }).compile();

    service = module.get<AuthCookieService>(AuthCookieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
