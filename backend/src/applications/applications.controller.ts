import { Controller, Post, Get, Param, Body, Patch, Delete } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Post()
    create(
        @Body() createApplicationDto: CreateApplicationDto,
        @Body('user_id') userId: number,
        @Body('serviceServiceId') serviceServiceId: number
    ) {
        return this.applicationsService.create(createApplicationDto, userId, serviceServiceId);
    }

    @Get()
    findAll() {
        return this.applicationsService.findAll();
    }

    // ✅ Добавляем этот маршрут перед :id
    @Get('user/:userId')
    getByUser(@Param('userId') userId: string) {
        return this.applicationsService.findByUserId(Number(userId));
    }

    @Get('service/:serviceId')
    getByService(@Param('serviceId') serviceId: string) {
        return this.applicationsService.findByServiceId(Number(serviceId));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.applicationsService.findOne(Number(id));
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
        return this.applicationsService.update(Number(id), updateApplicationDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.applicationsService.remove(Number(id));
    }
}