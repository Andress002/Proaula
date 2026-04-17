import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Entities
import { User } from '../users/entities/user.entity';
import { super_admin } from '../super-admin/entities/super-admin.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Room } from '../rooms/entities/room.entity';
import { Client } from '../clients/entities/client.entity';
import { AdminHotels } from '../admin-hotels/entities/admin-hotels.entity';
import { Reservation } from '../booking/entities/reservation.entity';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentReservation } from '../payment-booking/entities/payment-reservation.entity';

// Seed data
import { usersSeed } from './data/users.seed';
import { superAdminSeed } from './data/super-admin.seed';
import { hotelsSeed } from './data/hotels.seed';
import { roomsSeed } from './data/rooms.seed';
import { clientsSeed } from './data/clients.seed';
import { adminHotelsSeed } from './data/admin-hotels.seed';
import { reservationsSeed } from './data/reservations.seed';
import { paymentsSeed } from './data/payments.seed';
import { paymentReservationsSeed } from './data/payment-reservations.seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(super_admin)
    private readonly superAdminRepository: Repository<super_admin>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(AdminHotels)
    private readonly adminHotelsRepository: Repository<AdminHotels>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentReservation)
    private readonly paymentReservationRepository: Repository<PaymentReservation>,
    private readonly dataSource: DataSource,
  ) {}

  async executeSeed() {
    this.logger.log(' Iniciando proceso de seed');

    
    await this.deleteTables();

    // Insertar datos en orden de dependencias
    const superAdmins = await this.seedSuperAdmins();
    const users = await this.seedUsers();
    const hotels = await this.seedHotels();
    const rooms = await this.seedRooms(hotels);
    const clients = await this.seedClients();
    const adminHotels = await this.seedAdminHotels(users, hotels);
    const reservations = await this.seedReservations(rooms, clients);
    const payments = await this.seedPayments(users);
    const paymentReservations = await this.seedPaymentReservations(
      reservations,
      clients,
      rooms,
    );

    this.logger.log(' Seed completado exitosamente');

    return {
      message: 'Seed ejecutado exitosamente',
      data: {
        superAdmins: superAdmins.length,
        users: users.length,
        hotels: hotels.length,
        rooms: rooms.length,
        clients: clients.length,
        adminHotels: adminHotels.length,
        reservations: reservations.length,
        payments: payments.length,
        paymentReservations: paymentReservations.length,
      },
    };
  }

  private async deleteTables() {
    this.logger.log('Eliminando datos existentes');

    // Orden inverso de dependencias para evitar errores de FK
    await this.paymentReservationRepository.createQueryBuilder().delete().execute();
    await this.paymentRepository.createQueryBuilder().delete().execute();
    await this.reservationRepository.createQueryBuilder().delete().execute();
    await this.adminHotelsRepository.createQueryBuilder().delete().execute();
    await this.roomRepository.createQueryBuilder().delete().execute();
    await this.clientRepository.createQueryBuilder().delete().execute();
    await this.hotelRepository.createQueryBuilder().delete().execute();
    await this.userRepository.createQueryBuilder().delete().execute();
    await this.superAdminRepository.createQueryBuilder().delete().execute();

    this.logger.log('Datos eliminados correctamente');
  }

  private async seedSuperAdmins(): Promise<super_admin[]> {
    this.logger.log(' Insertando super administradores');
    const createdSuperAdmins: super_admin[] = [];

    for (const data of superAdminSeed) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const superAdmin = this.superAdminRepository.create({
        ...data,
        password: hashedPassword,
      });
      createdSuperAdmins.push(await this.superAdminRepository.save(superAdmin));
    }

    this.logger.log(` ${createdSuperAdmins.length} super admins creados`);
    return createdSuperAdmins;
  }

  private async seedUsers(): Promise<User[]> {
    this.logger.log(' Insertando usuarios');
    const createdUsers: User[] = [];

    for (const data of usersSeed) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = this.userRepository.create({
        ...data,
        password: hashedPassword,
      });
      createdUsers.push(await this.userRepository.save(user));
    }

    this.logger.log(` ${createdUsers.length} usuarios creados`);
    return createdUsers;
  }

  private async seedHotels(): Promise<Hotel[]> {
    this.logger.log('Insertando hoteles');
    const createdHotels: Hotel[] = [];

    for (const data of hotelsSeed) {
      const hotel = this.hotelRepository.create(data);
      createdHotels.push(await this.hotelRepository.save(hotel));
    }

    this.logger.log(` ${createdHotels.length} hoteles creados`);
    return createdHotels;
  }

  private async seedRooms(hotels: Hotel[]): Promise<Room[]> {
    this.logger.log('Insertando habitaciones');
    const createdRooms: Room[] = [];

    for (const data of roomsSeed) {
      const { hotelIndex, image, ...roomData } = data;
      const roomEntity = new Room();
      Object.assign(roomEntity, {
        ...roomData,
        ...(image ? { image } : {}),
        hotel: hotels[hotelIndex],
      });
      createdRooms.push(await this.roomRepository.save(roomEntity));
    }

    this.logger.log(`  ${createdRooms.length} habitaciones creadas`);
    return createdRooms;
  }

  private async seedClients(): Promise<Client[]> {
    this.logger.log(' Insertando clientes');
    const createdClients: Client[] = [];

    for (const data of clientsSeed) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const client = this.clientRepository.create({
        ...data,
        password: hashedPassword,
        birth_date: new Date(data.birth_date),
      });
      createdClients.push(await this.clientRepository.save(client));
    }

    this.logger.log(` ${createdClients.length} clientes creados`);
    return createdClients;
  }

  private async seedAdminHotels(
    users: User[],
    hotels: Hotel[],
  ): Promise<AdminHotels[]> {
    this.logger.log(' Insertando admin-hotels');
    const createdAdminHotels: AdminHotels[] = [];

    for (const data of adminHotelsSeed) {
      const adminHotel = this.adminHotelsRepository.create({
        user: users[data.userIndex],
        hotel: hotels[data.hotelIndex],
      });
      createdAdminHotels.push(
        await this.adminHotelsRepository.save(adminHotel),
      );
    }

    this.logger.log(
      ` ${createdAdminHotels.length} admin-hotels creados`,
    );
    return createdAdminHotels;
  }

  private async seedReservations(
    rooms: Room[],
    clients: Client[],
  ): Promise<Reservation[]> {
    this.logger.log('Insertando reservaciones');
    const createdReservations: Reservation[] = [];

    for (const data of reservationsSeed) {
      const { roomIndex, clientIndex, ...reservationData } = data;
      const reservation = this.reservationRepository.create({
        ...reservationData,
        check_in: new Date(reservationData.check_in),
        check_out: new Date(reservationData.check_out),
        room: rooms[roomIndex],
        client: clients[clientIndex],
      });
      createdReservations.push(
        await this.reservationRepository.save(reservation),
      );
    }

    this.logger.log(
      ` ${createdReservations.length} reservaciones creadas`,
    );
    return createdReservations;
  }

  private async seedPayments(users: User[]): Promise<Payment[]> {
    this.logger.log(' Insertando pagos de servicios');
    const createdPayments: Payment[] = [];
    const now = new Date();

    for (const data of paymentsSeed) {
      const { userIndex, ...paymentData } = data;
      const payment = this.paymentRepository.create({
        ...paymentData,
        user: users[userIndex],
        created_at: now,
        updated_at: now,
      });
      createdPayments.push(await this.paymentRepository.save(payment));
    }

    this.logger.log(` ${createdPayments.length} pagos de servicios creados`);
    return createdPayments;
  }

  private async seedPaymentReservations(
    reservations: Reservation[],
    clients: Client[],
    rooms: Room[],
  ): Promise<PaymentReservation[]> {
    this.logger.log(' Insertando pagos de reservaciones');
    const createdPaymentReservations: PaymentReservation[] = [];
    const now = new Date();

    for (const data of paymentReservationsSeed) {
      const { reservationIndex, clientIndex, roomIndex, ...paymentData } = data;
      const paymentReservation = this.paymentReservationRepository.create({
        ...paymentData,
        payment_date: now,
        reservation: reservations[reservationIndex],
        client: clients[clientIndex],
        room: rooms[roomIndex],
        created_at: now,
        updated_at: now,
      });
      createdPaymentReservations.push(
        await this.paymentReservationRepository.save(paymentReservation),
      );
    }

    this.logger.log(
      ` ${createdPaymentReservations.length} pagos de reservaciones creados`,
    );
    return createdPaymentReservations;
  }
}
