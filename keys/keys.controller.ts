import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('keys')
export class KeysController {
  @Get('public')
  getPublicKey(@Res() res: Response) {
    const keyPath = path.resolve(process.cwd(), 'keys', 'public.pem');

    if (!fs.existsSync(keyPath)) {
      return res.status(404).send('Public key not found.');
    }

    const publicKey = fs.readFileSync(keyPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(publicKey);
  }
}
