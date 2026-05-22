import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import { PaymentReservation } from './entities/payment-reservation.entity';
import { Reservation } from '../booking/entities/reservation.entity';
import { Room } from '../rooms/entities/room.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentReservationDto } from '../dto/payment-booking.dto';

@Injectable()
export class PaymentBookingService {
  constructor(
    @InjectRepository(PaymentReservation)
    private paymentBookingRepository: Repository<PaymentReservation>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private datasource: DataSource,
  ) {}

  async findAll(): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      relations: ['reservation', 'client', 'room'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async findOne(id: number): Promise<PaymentReservation> {
    const payment = await this.paymentBookingRepository.findOne({
      where: { id },
      relations: ['reservation', 'client', 'room'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findAllByClient(id: number): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      where: { client: { id: id } },
      relations: ['reservation', 'client', 'room'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async findAllByRoom(id: number): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      where: { room: { id: id } },
      relations: ['reservation'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async findByStatus(
    status: string,
    hotelId: number,
  ): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      where: { status: status, room: { hotel: { id: hotelId } } },
      relations: ['reservation', 'client', 'room'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async findByMethod(
    method: string,
    hotelId: number,
  ): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      where: { payment_method: method, room: { hotel: { id: hotelId } } },
      relations: ['reservation', 'client', 'room'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async findByNameClient(
    name: string,
    hotelId: number,
  ): Promise<PaymentReservation> {
    const payment = await this.paymentBookingRepository.findOne({
      where: { client: { name: name }, room: { hotel: { id: hotelId } } },
      relations: ['reservation', 'client', 'room'],
    });
    if (!payment) throw new NotFoundException('No client found');
    return payment;
  }

  async findAllByReservation(id: number): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      where: { reservation: { id: id } },
      relations: ['reservation'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async findAllByHotel(id: number): Promise<PaymentReservation[]> {
    const payment = await this.paymentBookingRepository.find({
      where: { room: { hotel: { id: id } } },
      relations: ['reservation', 'client', 'room'],
    });
    if (payment.length === 0) throw new NotFoundException('No payment found');
    return payment;
  }

  async create(data: CreatePaymentReservationDto): Promise<PaymentReservation> {
    const result = await this.datasource.transaction(async (manager) => {
      const reservation = await this.reservationRepository.findOne({
        where: { id: data.reservationId },
        relations: ['room', 'client'],
      });

      if (!reservation) throw new NotFoundException('Reservation not found');

      const client = data.clientId 
        ? await this.clientRepository.findOne({ where: { id: data.clientId } })
        : reservation.client;

      const room = data.roomId
        ? await this.roomRepository.findOne({ where: { id: data.roomId } })
        : reservation.room;
      if (!client) throw new NotFoundException('Client not found');
      if (!room) throw new NotFoundException('Room not found');

      const payment = manager.create(PaymentReservation, {
        amount: data.amount,
        payment_method: data.payment_method,
        status: data.status || 'pending',
        client: client,
        reservation: reservation,
        room: room,
      });

      const paymentSave = await manager.save(PaymentReservation, payment);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      paymentSave.status = 'confirmed';
      await manager.save(PaymentReservation, paymentSave);

      reservation.status = 'confirmed';
      await manager.save(Reservation, reservation);

      room.status = 'booked';
      await manager.save(Room, room);

      return paymentSave;
    });
    return result;
  }

  async paymentRefunded(id: number): Promise<PaymentReservation> {
    const payment = await this.datasource.transaction(async (manager) => {
      const payment = await this.paymentBookingRepository.findOne({
        where: { id },
        relations: ['reservation'],
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status !== 'confirmed')
        throw new NotFoundException('Payment not confirmed');

      const reservation = await this.reservationRepository.findOne({
        where: { id: payment.reservation.id },
        relations: ['room'],
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.status !== 'confirmed')
        throw new NotFoundException('Reservation not confirmed');

      const room = await this.roomRepository.findOne({
        where: { id: reservation.room.id },
        relations: ['hotel'],
      });
      if (!room) throw new NotFoundException('Room not found');
      if (room.status !== 'busy') throw new NotFoundException('Room not busy');

      payment.status = 'refunded';
      await manager.save(PaymentReservation, payment);

      reservation.status = 'refunded';
      await manager.save(Reservation, reservation);

      room.status = 'free';
      await manager.save(Room, room);

      return payment;
    });
    return payment;
  }

  async paymentCanceled(id: number): Promise<PaymentReservation> {
    const payment = this.datasource.transaction(async (manager) => {
      const payment = await manager.findOne(PaymentReservation, {
        where: { id: id },
        relations: ['reservation', 'client', 'room'],
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status !== 'confirmed')
        throw new NotFoundException('Payment not confirmed');

      payment.status = 'canceled';
      const updatePayment = await manager.save(PaymentReservation, payment);

      if (payment.reservation) {
        payment.reservation.status = 'canceled';
        await manager.save(Reservation, payment.reservation);
      }

      if (payment.room) {
        payment.room.status = 'free';
        await manager.save(Room, payment.room);
      }
      return updatePayment;
    });
    return payment;
  }
}
