import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  // ==========================
  // BULK DELETE
  // ==========================
  async removeMany(ids: number[]) {
    // Gigamit ang 'posUserId' (ID gikan sa SQL Server)
    return await this.userModel.deleteMany({
      posUserId: { $in: ids }
    }).exec();
  }

  // ==========================
  // BULK CREATE (with Hashing logic)
  // ==========================
  async createMany(createDtos: CreateUserDto[]): Promise<any> {
    const count = createDtos.length;

    // 1. Pag-reserve og IDs
    const lastUser = await this.userModel.findOne().sort({ userId: -1 });
    let currentId = lastUser ? lastUser.userId + 1 : 1;

    // 2. I-prepare ang bulto nga data (ID Assignment + Password Hashing)
    const salt = await bcrypt.genSalt();

    const hashedUsers = await Promise.all(
      createDtos.map(async (dto) => {
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const newUser = {
          ...dto,
          userId: currentId++,
          password: hashedPassword,
        };
        return newUser;
      }),
    );

    try {
      // 3. Bulk Insert
      return await this.userModel.insertMany(hashedUsers);
    } catch (error) {
      throw new InternalServerErrorException('Bulk user creation failed: ' + error.message);
    }
  }

  // ==========================
  // EXISTING METHODS
  // ==========================
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, username } = createUserDto;

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) throw new ConflictException('Username already exists');

    const lastUser = await this.userModel.findOne().sort({ userId: -1 });
    const nextUserId = lastUser ? lastUser.userId + 1 : 1;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const newUser = new this.userModel({
        ...createUserDto,
        userId: nextUserId,
        password: hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username }).select('+password').exec();
  }

  async findOne(userId: number): Promise<User> {
    const user = await this.userModel.findOne({ userId }).exec();
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = await this.userModel
      .findOneAndUpdate({ userId }, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) throw new NotFoundException(`User with ID ${userId} not found`);
    return updatedUser;
  }

  async remove(userId: number) {
    const result = await this.userModel.deleteOne({ userId }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`User with ID ${userId} not found`);
    return { message: 'User deleted successfully' };
  }
}