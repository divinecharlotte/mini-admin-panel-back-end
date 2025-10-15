import { Injectable } from '@nestjs/common';
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

    // Hash email
    const hash = this.cryptoService.hashEmail(user.email);
    user.emailHash = hash.toString('base64');

    // Sign hash
    const signature = this.cryptoService.signHash(hash);
    user.signature = signature.toString('base64');

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
}
