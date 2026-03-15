import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../src/modules/auth/infrastructure/security/token.service';

describe('TokenService', () => {
  const tokenService = new TokenService(
    new ConfigService({
      AUTH_TOKEN_SECRET: 'secret-for-tests',
      AUTH_TOKEN_TTL_SECONDS: '3600'
    })
  );

  it('generates a token with three sections', () => {
    const token = tokenService.generateAccessToken({
      sub: 'user-1',
      email: 'user@example.com'
    });

    expect(token.split('.')).toHaveLength(3);
  });

  it('generates refresh tokens with entropy', () => {
    const first = tokenService.generateRefreshToken();
    const second = tokenService.generateRefreshToken();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(40);
  });

  it('decodes a valid access token', () => {
    const token = tokenService.generateAccessToken({
      sub: 'user-1',
      email: 'user@example.com'
    });

    expect(tokenService.verifyAccessToken(token)).toEqual({
      id: 'user-1',
      email: 'user@example.com'
    });
  });

  it('rejects a tampered access token', () => {
    const token = tokenService.generateAccessToken({
      sub: 'user-1',
      email: 'user@example.com'
    });
    const tampered = `${token}x`;

    expect(() => tokenService.verifyAccessToken(tampered)).toThrow(
      UnauthorizedException
    );
  });

  it('rejects expired access tokens', () => {
    const expiringTokenService = new TokenService(
      new ConfigService({
        AUTH_TOKEN_SECRET: 'secret-for-tests',
        AUTH_TOKEN_TTL_SECONDS: '1'
      })
    );
    const dateNowSpy = jest.spyOn(Date, 'now');

    dateNowSpy.mockReturnValueOnce(1_000);

    const token = expiringTokenService.generateAccessToken({
      sub: 'user-1',
      email: 'user@example.com'
    });

    dateNowSpy.mockReturnValueOnce(5_000);

    expect(() => expiringTokenService.verifyAccessToken(token)).toThrow(
      UnauthorizedException
    );

    dateNowSpy.mockRestore();
  });
});
