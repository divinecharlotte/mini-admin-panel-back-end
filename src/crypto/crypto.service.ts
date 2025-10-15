import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService implements OnModuleInit {
  private privateKeyPath = path.resolve(process.cwd(), 'keys', 'private.pem');
  private publicKeyPath = path.resolve(process.cwd(), 'keys', 'public.pem');
  private privateKeyPem: string;
  private publicKeyPem: string;

  onModuleInit() {
    this.ensureKeys();
  }

  private ensureKeys() {
    const dir = path.dirname(this.privateKeyPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.privateKeyPath) || !fs.existsSync(this.publicKeyPath)) {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 3072,
        publicExponent: 0x10001,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      fs.writeFileSync(this.privateKeyPath, privateKey);
      fs.writeFileSync(this.publicKeyPath, publicKey);
    }

    this.privateKeyPem = fs.readFileSync(this.privateKeyPath, 'utf8');
    this.publicKeyPem = fs.readFileSync(this.publicKeyPath, 'utf8');
  }

  hashEmail(email: string): Buffer {
    const hash = crypto.createHash('sha384').update(email, 'utf8').digest();
    return hash;
  }

  signHash(hash: Buffer): Buffer {
    // Use SHA384 algorithm for signing (sign takes data and signs it)
    const signature = crypto.sign(null, hash, { key: this.privateKeyPem, padding: crypto.constants.RSA_PKCS1_PSS_PADDING });
    return signature;
  }

  getPublicKeyPem(): string {
    return this.publicKeyPem;
  }
}
