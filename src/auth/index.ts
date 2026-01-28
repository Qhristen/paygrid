import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiKey } from '../types';

export class AuthService {
  private apiSecret: string;

  constructor(apiSecret: string) {
    this.apiSecret = apiSecret;
  }

  generateApiKey(name: string): { key: string; apiKey: ApiKey } {
    const rawKey = `pg_${crypto.randomBytes(32).toString('hex')}`;
    const id = crypto.randomUUID();
    const keyHint = rawKey.substring(0, 7); // pg_ + 4 chars
    const hashedKey = bcrypt.hashSync(rawKey, 10);

    return {
      key: rawKey,
      apiKey: {
        id,
        keyHint,
        hashedKey,
        name,
        createdAt: Date.now(),
      }
    };
  }

  verifyApiKey(rawKey: string, hashedKey: string): boolean {
    return bcrypt.compareSync(rawKey, hashedKey);
  }
}
