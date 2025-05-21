import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AdminHotels } from 'src/Models/admins_hotels.models';
import { Hotel } from 'src/Models/hotels.models';
import { Room } from 'src/Models/rooms.models';
import { Repository, Not, ILike } from 'typeorm';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Room)
        private roomsRepository: Repository<Room>,
        @InjectRepository(Hotel)
        private hotelsRepository: Repository<Hotel>,
        @InjectRepository(AdminHotels)
        private adminHotelRepository: Repository<AdminHotels>
    ){}

    async findAll(): Promise<Room[]> {
        const result = await this.roomsRepository.find();
        if (result.length === 0) {
            throw new NotFoundException('No rooms found');
        }
        return result;
    }

    async findAllWithImages(): Promise<Room[]> {
        const result = await this.roomsRepository.find({
            where: {
                image: Not('')
            }
        });
        if (result.length === 0) {
            throw new NotFoundException('No rooms with images found');
        }
        return result;
    }

    async findAllByHotel(hotelId: number): Promise<Room[]> {
        const result = await this.roomsRepository.find({
            where: {
                hotel: { id: hotelId }
            }
        });
        if (result.length === 0) {
            throw new NotFoundException('No rooms found for this hotel');
        }
        return result;
    }

    async findOne(id: number): Promise<Room> {
        const result = await this.roomsRepository.findOne({
            where: { id }
        });
        if (!result) {
            throw new NotFoundException('Room not found');
        }
        return result;
    }

    async findByName(name: string): Promise<Room[]> {
        const result = await this.roomsRepository.find({
            where: {
                name: ILike(`%${name}%`)
            }
        });
        if (result.length === 0) {
            throw new NotFoundException('No rooms found with this name');
        }
        return result;
    }

    async findByStatus(status: string): Promise<Room[]> {
        const result = await this.roomsRepository.find({
            where: { status }
        });
        if (result.length === 0) {
            throw new NotFoundException('No rooms found with this status');
        }
        return result;
    }

    async findReservations(id: number): Promise<Room> {
        const result = await this.roomsRepository.findOne({
            where: { id },
            relations: ['reservation']
        });
        if (!result) {
            throw new NotFoundException('Room not found');
        }
        return result;
    }

    async findRoomsByAdmin(adminId: number): Promise<Room[]> {
        const result = await this.roomsRepository.find({
            where: {
                hotel: {
                    admin_hotel: {
                        user: { id: adminId }
                    }
                }
            }
        });
        if (result.length === 0) {
            throw new NotFoundException('No rooms found for this admin');
        }
        return result;
    }

    async create(data: Partial<Room>, file: Express.Multer.File): Promise<Room> {
        if (file) {
            const uploadPath = './uploads/rooms';
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = uniqueSuffix + extname(file.originalname);
            fs.writeFileSync(`${uploadPath}/${filename}`, file.buffer);
            data.image = filename;
        }
        const newRoom = this.roomsRepository.create(data);
        return await this.roomsRepository.save(newRoom);
    }

    async update(id: number, data: Partial<Room>, file?: Express.Multer.File): Promise<Room> {
        const roomExist = await this.roomsRepository.findOne({
            where: { id }
        });
        if (!roomExist) {
            throw new NotFoundException('Room not found');
        }

        if (file) {
            const uploadPath = './uploads/rooms';
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = uniqueSuffix + extname(file.originalname);
            fs.writeFileSync(`${uploadPath}/${filename}`, file.buffer);
            data.image = filename;

            // Delete old image if exists
            if (roomExist.image) {
                const oldImagePath = `${uploadPath}/${roomExist.image}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updateRoom = this.roomsRepository.merge(roomExist, data);
        return await this.roomsRepository.save(updateRoom);
    }

    async remove(id: number): Promise<string> {
        const room = await this.roomsRepository.findOne({
            where: { id }
        });
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Delete image if exists
        if (room.image) {
            const imagePath = `./uploads/rooms/${room.image}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const result = await this.roomsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Room not found');
        }
        return 'Room deleted successfully';
    }
}
