import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../services/dto/create-service.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly servicesService: ServicesService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<{
    id: number;
    email: string;
    name: string;
    role: string;
    service_id?: number;
    data_filled?: string;
  }> {
    const { email, password, name, role } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        `Пользователь с email ${email} уже зарегистрирован`,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const savedUser = await this.usersRepository.save(user);
    console.log('ID созданного пользователя:', savedUser.id);

    let service_id: number | undefined;
    let data_filled: string | undefined;

    if (savedUser.role === 'service') {
      const serviceData: CreateServiceDto = {
        user_id: savedUser.id,
        service_name: '',
        about: '',
        city: '',
        works: [],
        working_days: '',
        time_start: '',
        time_end: '',
        daily_limit: 0,
        created_at: new Date(),
      };

      const newService = await this.servicesService.create(serviceData);
      console.log('Созданная услуга:', newService);
      service_id = newService.service_id;
      data_filled = String(newService.data_filled); // ✅ Приведение к string
    }

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      ...(service_id && { service_id }),
      ...(data_filled && { data_filled }),
    };
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return user;
  }

  async updatePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Старый пароль неверный');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.update(id, { password: hashedPassword });

    const { password, ...userWithoutPassword } =
      (await this.usersRepository.findOne({ where: { id } })) as User;
    return userWithoutPassword;
  }

  async verifyPassword(id: number, oldPassword: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Старый пароль неверный');
    }

    return true;
  }
}
