import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

import { User } from '../users/entities/user.entity';
import { super_admin } from '../super-admin/entities/super-admin.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Room } from '../rooms/entities/room.entity';
import { Client } from '../clients/entities/client.entity';
import { AdminHotels } from '../admin-hotels/entities/admin-hotels.entity';
import { Reservation } from '../booking/entities/reservation.entity';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentReservation } from '../payment-booking/entities/payment-reservation.entity';

import { usersSeed } from './data/users.seed';
import { superAdminSeed } from './data/super-admin.seed';
import { hotelsSeed } from './data/hotels.seed';
import { roomsSeed } from './data/rooms.seed';
import { clientsSeed } from './data/clients.seed';
import { adminHotelsSeed } from './data/admin-hotels.seed';
import { paymentsSeed } from './data/payments.seed';

const SEASONALITY = [1.2, 0.9, 1.0, 1.1, 1.0, 1.3, 1.3, 1.0, 0.9, 1.0, 1.0, 1.5];
const BULK_RESERVATIONS = 10000;

interface ReservationResult {
  reservation: Reservation;
  room: Room;
  client: Client;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
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
  ) {}

  async onApplicationBootstrap() {
    const autoSeed = process.env.AUTO_SEED === 'true';
    if (!autoSeed) return;

    const hasData = (await this.superAdminRepository.count()) > 0;
    if (hasData && process.env.FORCE_SEED !== 'true') {
      this.logger.log('Seed saltado — la base de datos ya tiene datos. Usa FORCE_SEED=true para re-ejecutar.');
      return;
    }

    await this.executeSeed();
  }

  async executeSeed() {
    this.logger.log('Iniciando proceso de seed');

    await this.deleteTables();

    faker.seed(12345);

    const superAdmins = await this.seedSuperAdmins();
    const users = await this.seedUsers();
    const hotels = await this.seedHotels();
    const rooms = await this.seedRooms(hotels);
    const clients = await this.seedClients();
    await this.seedAdminHotels(users, hotels);
    await this.seedPayments(users);
    const reservationResults = await this.seedBulkReservations(rooms, clients);
    const paymentReservations = await this.seedBulkPaymentReservations(reservationResults);

    this.logger.log('Seed completado exitosamente');

    return {
      message: 'Seed ejecutado exitosamente',
      data: {
        superAdmins: superAdmins.length,
        users: users.length,
        hotels: hotels.length,
        rooms: rooms.length,
        clients: clients.length,
        adminHotels: adminHotelsSeed.length,
        reservations: reservationResults.length,
        payments: paymentsSeed.length,
        paymentReservations: paymentReservations.length,
      },
    };
  }

  private async deleteTables() {
    this.logger.log('Eliminando datos existentes');

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
    this.logger.log('Insertando super administradores');
    const created: super_admin[] = [];
    for (const data of superAdminSeed) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const entity = this.superAdminRepository.create({ ...data, password: hashedPassword });
      created.push(await this.superAdminRepository.save(entity));
    }
    this.logger.log(` ${created.length} super admins creados`);
    return created;
  }

  private async seedUsers(): Promise<User[]> {
    this.logger.log('Insertando usuarios');
    const created: User[] = [];
    for (const data of usersSeed) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = this.userRepository.create({ ...data, password: hashedPassword });
      created.push(await this.userRepository.save(user));
    }
    this.logger.log(` ${created.length} usuarios creados`);
    return created;
  }

  private async seedHotels(): Promise<Hotel[]> {
    this.logger.log('Insertando hoteles');
    const created: Hotel[] = [];
    for (const data of hotelsSeed) {
      const hotel = this.hotelRepository.create(data);
      created.push(await this.hotelRepository.save(hotel));
    }
    this.logger.log(` ${created.length} hoteles creados`);
    return created;
  }

  private async seedRooms(hotels: Hotel[]): Promise<Room[]> {
    this.logger.log('Insertando habitaciones');
    const created: Room[] = [];
    for (const data of roomsSeed) {
      const { hotelIndex, image, ...roomData } = data;
      const room = this.roomRepository.create({
        ...roomData,
        ...(image ? { image } : {}),
        hotel: hotels[hotelIndex],
      });
      created.push(await this.roomRepository.save(room));
    }
    this.logger.log(` ${created.length} habitaciones creadas`);
    return created;
  }

  private async seedClients(): Promise<Client[]> {
    this.logger.log('Insertando clientes');
    const created: Client[] = [];
    for (const data of clientsSeed) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const client = this.clientRepository.create({
        ...data,
        password: hashedPassword,
        birth_date: new Date(data.birth_date),
      });
      created.push(await this.clientRepository.save(client));
    }
    this.logger.log(` ${created.length} clientes creados`);
    return created;
  }

  private async seedAdminHotels(users: User[], hotels: Hotel[]): Promise<AdminHotels[]> {
    this.logger.log('Insertando admin-hotels');
    const created: AdminHotels[] = [];
    for (const data of adminHotelsSeed) {
      const adminHotel = this.adminHotelsRepository.create({
        user: users[data.userIndex],
        hotel: hotels[data.hotelIndex],
      });
      created.push(await this.adminHotelsRepository.save(adminHotel));
    }
    this.logger.log(` ${created.length} admin-hotels creados`);
    return created;
  }

  private async seedPayments(users: User[]): Promise<Payment[]> {
    this.logger.log('Insertando pagos de servicios');
    const created: Payment[] = [];
    const now = new Date();
    for (const data of paymentsSeed) {
      const { userIndex, ...paymentData } = data;
      const payment = this.paymentRepository.create({
        ...paymentData,
        user: users[userIndex],
        created_at: now,
        updated_at: now,
      });
      created.push(await this.paymentRepository.save(payment));
    }
    this.logger.log(` ${created.length} pagos de servicios creados`);
    return created;
  }

  private async seedBulkReservations(
    rooms: Room[],
    clients: Client[],
  ): Promise<ReservationResult[]> {
    this.logger.log(`Generando ${BULK_RESERVATIONS} reservas masivas...`);

    const results: ReservationResult[] = [];
    const batch: Array<{
      room: Room;
      client: Client;
      checkIn: Date;
      checkOut: Date;
      createdAt: Date;
      updatedAt: Date;
      status: string;
    }> = [];

    for (let i = 0; i < BULK_RESERVATIONS; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];

      const isHistorical = Math.random() < 0.7;
      let checkIn: Date;

      if (isHistorical) {
        const monthWeights = Array.from({ length: 12 }, (_, j) => {
          const d = new Date();
          d.setMonth(d.getMonth() - j);
          return SEASONALITY[d.getMonth()];
        });
        const totalWeight = monthWeights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalWeight;
        let selectedIdx = 0;
        for (let j = 0; j < 12; j++) {
          r -= monthWeights[j];
          if (r <= 0) { selectedIdx = j; break; }
        }
        const targetMonth = new Date();
        targetMonth.setMonth(targetMonth.getMonth() - selectedIdx);
        const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        checkIn = faker.date.between({ from: monthStart, to: monthEnd });
      } else {
        checkIn = faker.date.future({ years: 0.5 });
      }

      const nights = faker.number.int({ min: 1, max: 14 });
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + nights);

      const createdAt = isHistorical
        ? faker.date.between({ from: new Date(checkIn.getTime() - 30 * 24 * 60 * 60 * 1000), to: checkIn })
        : faker.date.past({ years: 1 });
      const updatedAt = faker.date.between({ from: createdAt, to: checkOut });

      const status = isHistorical
        ? 'confirmed'
        : faker.helpers.arrayElement(['confirmed', 'canceled', 'refunded']);

      batch.push({ room, client, checkIn, checkOut, createdAt, updatedAt, status });

      if (batch.length >= 500 || i === BULK_RESERVATIONS - 1) {
        for (const b of batch) {
          const conflict = await this.reservationRepository
            .createQueryBuilder('r')
            .where('r.room_id = :roomId', { roomId: b.room.id })
            .andWhere(':checkIn < r.check_out AND :checkOut > r.check_in', {
              checkIn: b.checkIn,
              checkOut: b.checkOut,
            })
            .getCount();

          if (conflict === 0) {
            const reservation = this.reservationRepository.create({
              room: b.room,
              client: b.client,
              check_in: b.checkIn,
              check_out: b.checkOut,
              status: b.status as any,
              created_at: b.createdAt,
              updated_at: b.updatedAt,
            });
            const saved = await this.reservationRepository.save(reservation);
            results.push({ reservation: saved, room: b.room, client: b.client });

            if (b.status === 'confirmed') {
              await this.roomRepository.update(b.room.id, { status: 'booked' as any });
            }
          }
        }
        batch.length = 0;
        this.logger.log(`  ${results.length} reservas creadas...`);
      }
    }

    this.logger.log(` ${results.length} reservas creadas en total`);
    return results;
  }

  private async seedBulkPaymentReservations(
    reservationResults: ReservationResult[],
  ): Promise<PaymentReservation[]> {
    this.logger.log('Insertando pagos de reservas masivos...');
    const created: PaymentReservation[] = [];
    const now = new Date();

    for (const { reservation, room, client } of reservationResults) {
      const isHistorical = reservation.check_in < now;
      const paymentStatus = isHistorical
        ? 'confirmed'
        : faker.helpers.arrayElement(['pending', 'confirmed', 'canceled', 'refunded']);

      const nights = Math.ceil(
        (reservation.check_out.getTime() - reservation.check_in.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const amount = Math.round(
        room.price * nights * faker.number.float({ min: 0.85, max: 1.15 }),
      );

      const paymentReservation = this.paymentReservationRepository.create({
        payment_date: isHistorical ? reservation.check_in : reservation.updated_at,
        status: paymentStatus as any,
        amount,
        payment_method: faker.helpers.arrayElement(['visa', 'mastercard', 'paypal', 'other']),
        reservation,
        client,
        room,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
      });

      created.push(await this.paymentReservationRepository.save(paymentReservation));

      if (paymentStatus === 'confirmed') {
        await this.roomRepository.update(room.id, { status: 'busy' as any });
      }
    }

    this.logger.log(` ${created.length} pagos de reservas creados`);
    return created;
  }
}
