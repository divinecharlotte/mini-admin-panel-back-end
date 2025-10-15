import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import * as protobuf from 'protobufjs';
import * as path from 'path';
import * as fs from 'fs';
import type { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private protobufRoot: protobuf.Root | null = null;
  private UsersListMessage: protobuf.Type | null = null;

  constructor(private readonly usersService: UsersService) {
    this.loadProto();
  }

  /** Dynamically resolve the proto file in dev or prod */
  private getProtoPath(): string {
    const devPath = path.join(process.cwd(), 'src', 'proto', 'user.proto');
    const prodPath = path.join(__dirname, '..', 'proto', 'user.proto');
    if (fs.existsSync(devPath)) return devPath;
    if (fs.existsSync(prodPath)) return prodPath;
    throw new Error(`user.proto not found in: ${devPath} or ${prodPath}`);
  }

  /** Load the .proto file once */
  private async loadProto() {
    try {
      const protoPath = this.getProtoPath();
      const root = await protobuf.load(protoPath);
      this.protobufRoot = root;
      this.UsersListMessage = root.lookupType('adminpanel.UsersList') as protobuf.Type;
      console.log('✅ Proto loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load proto', err);
    }
  }

  @Post()
  create(@Body() userDto: UserDto) {
    return this.usersService.create(userDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserDto] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /** Exports all users serialized in protobuf format */
  @Get('export/protobuf')
  async exportProtobuf(@Res() res: Response) {
    if (!this.UsersListMessage) {
      throw new InternalServerErrorException('Proto not loaded yet');
    }

    const users = await this.usersService.findAll();

    // Map DB users to proto-compatible objects
    const protoUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt?.toISOString?.() ?? new Date().toISOString(),
      emailHash: u.emailHash ? Buffer.from(u.emailHash, 'base64') : Buffer.alloc(0),
      signature: u.signature ? Buffer.from(u.signature, 'base64') : Buffer.alloc(0),
    }));

    const payload = { users: protoUsers };

    // Verify proto payload
    const errMsg = this.UsersListMessage.verify(payload);
    if (errMsg) {
      throw new InternalServerErrorException('Invalid payload for proto: ' + errMsg);
    }

    const message = this.UsersListMessage.create(payload);
    const buffer = this.UsersListMessage.encode(message).finish();

    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Content-Disposition', 'attachment; filename=users.pb');
    res.send(Buffer.from(buffer));
  }
}
