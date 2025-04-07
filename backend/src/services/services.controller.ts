import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // 🔹 Создание сервиса
  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  // 🔹 Получить все сервисы
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // 🔹 Получить сервис по ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  // 🔹 Обновить сервис по ID
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  // 🔹 Удалить сервис
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }

  // 🔹 Получить сервис по user_id
  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.servicesService.findByUserId(userId);
  }

  // 🔹 Пометить сервис как заполненный (data_filled = 1)
  @Patch(':id/mark-filled')
  markAsFilled(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.markServiceAsFilled(id);
  }
}
