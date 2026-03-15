import { PasswordService } from '../src/modules/auth/infrastructure/security/password.service';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  it('hashes and verifies valid passwords', () => {
    const password = 'ClaveSegura123';
    const hash = passwordService.hash(password);

    expect(hash).toContain(':');
    expect(passwordService.verify(password, hash)).toBe(true);
  });

  it('rejects invalid passwords', () => {
    const hash = passwordService.hash('ClaveSegura123');

    expect(passwordService.verify('otra-clave', hash)).toBe(false);
  });
});
