import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';

interface AccessTokenPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + this.getAccessTokenTtlSeconds();
    const header = this.toBase64Url(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    );
    const body = this.toBase64Url(
      JSON.stringify({
        ...payload,
        iat: issuedAt,
        exp: expiresAt
      })
    );
    const signature = this.sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  verifyAccessToken(token: string): AuthenticatedUser {
    const [encodedHeader, encodedPayload, providedSignature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !providedSignature) {
      throw new UnauthorizedException('Token invalido.');
    }

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);

    if (expectedSignature !== providedSignature) {
      throw new UnauthorizedException('Token invalido.');
    }

    const payload = JSON.parse(
      Buffer.from(this.fromBase64Url(encodedPayload), 'base64').toString('utf8')
    ) as Partial<AccessTokenPayload>;

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token invalido.');
    }

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expirado.');
    }

    return {
      id: payload.sub,
      email: payload.email
    };
  }

  private sign(value: string): string {
    const secret =
      this.configService.get<string>('AUTH_TOKEN_SECRET') ??
      'local-dev-auth-secret';

    return this.toBase64Url(createHmac('sha256', secret).update(value).digest());
  }

  private getAccessTokenTtlSeconds(): number {
    const configured =
      this.configService.get<string>('AUTH_TOKEN_TTL_SECONDS') ?? '3600';
    const parsed = Number.parseInt(configured, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 3600;
    }

    return parsed;
  }

  private toBase64Url(value: string | Buffer): string {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private fromBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;

    if (padding === 0) {
      return normalized;
    }

    return `${normalized}${'='.repeat(4 - padding)}`;
  }
}
