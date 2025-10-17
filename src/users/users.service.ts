import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';

import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private cryptoService: CryptoService
  ) {}

  async create(UserDto: UserDto) {
    const user = new User();
    user.email = UserDto.email;
    user.role = UserDto.role;
    user.status = UserDto.status;

    // Hash email and sign original email (RSA-PSS SHA-384)
    const hash = this.cryptoService.hashEmail(user.email);
    user.emailHash = hash.toString('base64');
    const signature = this.cryptoService.signEmail(user.email);
    user.signature = signature.toString('base64');
    
    const existingUser = await this.repo.findOneBy({ email: user.email });
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, partial: Partial<User>) {
    await this.repo.update(id, partial);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }

  async getCountsLast7Days() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 6);

    // Fetch createdAt within range
    const users = await this.repo
      .createQueryBuilder('u')
      .select(['u.createdAt'])
      .where('u.createdAt >= :start', { start: start.toISOString() })
      .andWhere('u.createdAt < :end', { end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString() })
      .getMany();

    const counts = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      counts.set(key, 0);
    }

    for (const u of users) {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
  }
}


// import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { UserDto } from './dto/user.dto';

// import { CryptoService } from '../crypto/crypto.service';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User) private repo: Repository<User>,
//     private cryptoService: CryptoService
//   ) {}

//   async create(UserDto: UserDto) {
//     const user = new User();
//     user.email = UserDto.email;
//     user.role = UserDto.role;
//     user.status = UserDto.status;

//     // Hash email and sign original email (RSA-PSS SHA-384)
//     const hash = this.cryptoService.hashEmail(user.email);
//     user.emailHash = hash.toString('base64');
//     const signature = this.cryptoService.signEmail(user.email);
//     user.signature = signature.toString('base64');
    
//     const existingUser = await this.repo.findOneBy({ email: user.email });
//     if (existingUser) {
//       throw new HttpException('Email already exists', HttpStatus.CONFLICT);
//     }
//     return this.repo.save(user);
//   }

//   findAll() {
//     return this.repo.find({ order: { id: 'ASC' } });
//   }

//   findOne(id: number) {
//     return this.repo.findOneBy({ id });
//   }

//   async update(id: number, partial: Partial<User>) {
//     await this.repo.update(id, partial);
//     return this.findOne(id);
//   }

//   async remove(id: number) {
//     return this.repo.delete(id);
//   }

//   async getCountsLast7Days() {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const start = new Date(today);
//     start.setDate(today.getDate() - 6);

//     // Fetch createdAt within range
//     const users = await this.repo
//       .createQueryBuilder('u')
//       .select(['u.createdAt'])
//       .where('u.createdAt >= :start', { start: start.toISOString() })
//       .andWhere('u.createdAt < :end', { end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString() })
//       .getMany();

//     const counts = new Map<string, number>();
//     for (let i = 0; i < 7; i++) {
//       const d = new Date(start);
//       d.setDate(start.getDate() + i);
//       const key = d.toISOString().slice(0, 10);
//       counts.set(key, 0);
//     }

//     for (const u of users) {
//       const key = new Date(u.createdAt).toISOString().slice(0, 10);
//       if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
//     }

//     return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
//   }
// }
