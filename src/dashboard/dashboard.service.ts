import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentReservation } from '../payment-booking/entities/payment-reservation.entity';
import { Payment } from '../payment/entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PaymentReservation)
    private paymentReservationRepository: Repository<PaymentReservation>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getMonthlyRevenue(hotelId?: number): Promise<any[]> {
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const currentYear = new Date().getFullYear();
    const result: {
      label: string;
      reservations: number;
      subscriptions: number;
      total: number;
    }[] = [];

    try {
      const query = this.paymentReservationRepository
        .createQueryBuilder('pr')
        .leftJoinAndSelect('pr.reservation', 'reservation')
        .leftJoin('pr.room', 'room')
        .where('pr.status = :status', { status: 'confirmed' });

      if (hotelId) {
        query.andWhere('room.hotel_id = :hotelId', { hotelId });
      }

      const allReservations = await query.getMany();

      console.log(' DEBUG: Total reservations found:', allReservations.length, hotelId ? `for hotel ${hotelId}` : '');

      const reservationsByMonth = new Map<string, number>();
      for (const payment of allReservations) {
        console.log(
          'Reservation - created_at:',
          payment.created_at,
          'amount:',
          payment.amount,
        );
        const date = payment.created_at
          ? new Date(payment.created_at)
          : new Date();
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        const current = reservationsByMonth.get(key) || 0;
        reservationsByMonth.set(key, current + Number(payment.amount));
      }

      console.log(
        'Reservations map:',
        Array.from(reservationsByMonth.entries()),
      );

      const subscriptionsByMonth = new Map<string, number>();
      if (!hotelId) {
        const allSubscriptions = await this.paymentRepository.find({
          where: [{ name: 'PREMIUN' as any }, { name: 'VIP' as any }],
        });

        console.log(
          '=== DEBUG: Total subscriptions found:',
          allSubscriptions.length,
        );
        for (const sub of allSubscriptions) {
          console.log(
            'Subscription - created_at:',
            sub.created_at,
            'name:',
            sub.name,
            'price:',
            sub.price,
          );
        }

        for (const payment of allSubscriptions) {
          const date = payment.created_at
            ? new Date(payment.created_at)
            : new Date();
          const month = date.getMonth();
          const year = date.getFullYear();
          const key = `${year}-${String(month + 1).padStart(2, '0')}`;
          const current = subscriptionsByMonth.get(key) || 0;
          subscriptionsByMonth.set(key, current + Number(payment.price));
        }

        console.log(
          'Subscriptions map:',
          Array.from(subscriptionsByMonth.entries()),
        );
      }

      for (let i = 0; i < 12; i++) {
        const monthStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
        const reservations = reservationsByMonth.get(monthStr) || 0;
        const subscriptions = subscriptionsByMonth.get(monthStr) || 0;

        result.push({
          label: months[i],
          reservations: Math.round(reservations),
          subscriptions: Math.round(subscriptions),
          total: Math.round(reservations + subscriptions),
        });
      }
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      for (let i = 0; i < 12; i++) {
        result.push({
          label: months[i],
          reservations: 0,
          subscriptions: 0,
          total: 0,
        });
      }
    }

    return result;
  }
}
