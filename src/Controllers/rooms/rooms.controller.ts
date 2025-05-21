import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { Room } from 'src/Models/rooms.models';
import { RoomsService } from 'src/Services/rooms/rooms.service';

@Controller('rooms')
export class RoomsController {
    constructor(
        private roomsService: RoomsService
    ){}

    @Get('all')
    async findAll(){
        return await this.roomsService.findAll()
    }

    @Get('all/images')
    async findAllWithImages(){
        return await this.roomsService.findAllWithImages()
    }

    @Get('all/hotel/:id')
    async findAllByHotel(@Param('id') id: string){
        return await this.roomsService.findAllByHotel(parseInt(id))
    }

    @Get(':id')
    async findOne(@Param('id') id: string){
        return await this.roomsService.findOne(parseInt(id))
    }

    @Get('name/:name')
    async findByName(@Param('name') name: string){
        return await this.roomsService.findByName(name)
    }

    @Get('status/:status')
    async findByStatus(@Param('status') status: string){
        return await this.roomsService.findByStatus(status)
    }

    @Get(':id/reservations')
    async findReservations(@Param('id') id: string){
        return await this.roomsService.findReservations(parseInt(id))
    }

    @Get('rooms-by-admin/:adminId')
    async findRoomsByAdmin(@Param('adminId') adminId: string){
        return await this.roomsService.findRoomsByAdmin(parseInt(adminId))
    }

    @Post('create')
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @Body() data: Room,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                ],
            })
        )
        file: Express.Multer.File
    ){
        return await this.roomsService.create(data, file)
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Param('id') id: string,
        @Body() data: Partial<Room>,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                ],
                fileIsRequired: false,
            })
        )
        file?: Express.Multer.File
    ){
        return await this.roomsService.update(parseInt(id), data, file)
    }

    @Delete(':id')
    async remove(@Param('id') id: string){
        return await this.roomsService.remove(parseInt(id))
    }
}

