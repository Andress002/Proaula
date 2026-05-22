import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Reservation } from '../booking/entities/reservation.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminHotelsService } from '../admin-hotels/admin-hotels.service';
import { CreateClientDto } from 'src/dto/create-clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private adminHotelsService: AdminHotelsService,
  ) {}

  async findAll(): Promise<Client[]> {
    const clients = await this.clientRepository.find();
    if (clients.length === 0) throw new NotFoundException('No clients found');
    return clients;
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['reservation', 'payment'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async findOneByName(name: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { name },
      relations: ['reservation', 'payment'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async findOneByEmail(email: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { email },
      relations: ['reservation', 'payment'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(data: CreateClientDto): Promise<Client> {
    const exist = await this.clientRepository.findOne({
      where: [{ email: data.email }, { number_document: data.number_document }],
    });

    if (exist) throw new ConflictException('Client already exists');

    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);

    const client = this.clientRepository.create(data);
    return await this.clientRepository.save(client);
  }

  async update(id: number, data: Partial<Client>): Promise<Client> {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }

    const client = await this.clientRepository.preload({
      id,
      ...data,
    });
    if (!client) throw new NotFoundException('Client not found');

    if (client.email || client.number_document) {
      const exist = await this.clientRepository.findOne({
        where: [
          { email: client.email ?? client.email },
          { number_document: client.number_document ?? client.number_document },
        ],
      });
      if (exist && exist.id !== id)
        throw new ConflictException('Client already exists');
    }

    return await this.clientRepository.save(client);
  }

  async remove(id: number): Promise<string> {
    const result = await this.clientRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Client not found');
    return 'Client deleted successfully';
  }

  async findReservations(id: number): Promise<Reservation[]> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['reservation'],
    });
    if (!client) throw new NotFoundException('Client not found');
    if (client.reservation.length === 0)
      throw new NotFoundException('No reservations found');
    return client.reservation;
  }

  async findClientsByAdmin(adminId: number): Promise<any[]> {
    const hotels = await this.adminHotelsService.findHotelsByAdmin(adminId);
    const hotelIds = hotels.map((h) => h.id);
    if (hotelIds.length === 0)
      throw new NotFoundException('No hotels assigned to this admin');

    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .distinct(true)
      .innerJoin('client.reservation', 'reservation')
      .innerJoin('reservation.room', 'room')
      .innerJoin('room.hotel', 'hotel')
      .where('hotel.id IN (:...hotelIds)', { hotelIds })
      .andWhere('reservation.status = :status', { status: 'confirmed' })
      .select([
        'client.id',
        'client.name',
        'client.last_name',
        'client.email',
        'client.phone',
        'client.country',
        'client.type_document',
        'client.number_document',
        'client.birth_date',
        'reservation.check_in',
        'hotel.id',
        'hotel.name',
      ])
      .orderBy('reservation.check_in', 'DESC')
      .getRawMany();

    const clientsMap = new Map<number, any>();

    for (const row of clients) {
      const clientId = row.client_id;
      
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: clientId,
          name: row.client_name,
          last_name: row.client_last_name,
          email: row.client_email,
          phone: row.client_phone,
          country: row.client_country,
          type_document: row.client_type_document,
          number_document: row.client_number_document,
          birth_date: row.client_birth_date,
          hotel_afiliado: null,
        });
      }

      const clientData = clientsMap.get(clientId);
      if (!clientData.hotel_afiliado && row.hotel_id && row.hotel_name) {
        clientData.hotel_afiliado = {
          id: row.hotel_id,
          name: row.hotel_name,
        };
      }
    }

    return Array.from(clientsMap.values());
  }
}
