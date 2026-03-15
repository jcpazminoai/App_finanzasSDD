import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class PasswordService {
  hash(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${derivedKey}`;
  }

  verify(password: string, storedHash: string): boolean {
    const [salt, expectedHash] = storedHash.split(':');

    if (!salt || !expectedHash) {
      return false;
    }

    const providedHash = scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expectedHash, 'hex');

    if (providedHash.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedHash, expectedBuffer);
  }
}
