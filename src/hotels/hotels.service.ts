import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Hotel } from './entities/hotel.entity';
import { DataSource, Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    private dataSource: DataSource,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<Hotel[]> {
    const result = await this.hotelsRepository.find();
    if (result.length === 0) {
      throw new NotFoundException('No hotels found');
    }
    return result;
  }

  async findOne(id: number): Promise<Hotel> {
    const result = await this.hotelsRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Hotel not found');
    return result;
  }

  async create(hotel: Hotel): Promise<Hotel> {
    const newHotel = this.hotelsRepository.save(hotel);
    return newHotel;
  }

  async update(id: number, dataHotel: Partial<Hotel>): Promise<Hotel> {
    const hotelExist = await this.hotelsRepository.findOne({ where: { id } });
    if (!hotelExist) throw new NotFoundException('Hotel not found');
    const updateHotel = this.hotelsRepository.merge(hotelExist, dataHotel);
    return await this.hotelsRepository.save(updateHotel);
  }

  async remove(id: number): Promise<string> {
    const result = await this.hotelsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Hotel not found');
    return 'Hotel deleted successfully';
  }

  async getRevenuePrediction(hotelId: number): Promise<any> {
    const hotel = await this.hotelsRepository.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');

    const roomResult = await this.dataSource.query(
      `SELECT COUNT(*)::int as total, AVG(price::DOUBLE PRECISION) as avg_price FROM room WHERE hotel_id = $1`,
      [hotelId],
    );
    const totalRooms = roomResult[0]?.total || 0;
    const avgRoomPrice = parseFloat(roomResult[0]?.avg_price) || 0;

    // 1. Try payment_reservation first (real payments)
    let revenueRows = await this.dataSource.query(
      `SELECT
        TO_CHAR(pr.payment_date, 'YYYY-MM') as month,
        COALESCE(SUM(pr.amount::DOUBLE PRECISION), 0) as revenue,
        COUNT(DISTINCT pr.reservation_id) as reservations
      FROM payment_reservation pr
      JOIN room r ON pr.room_id = r.id
      WHERE r.hotel_id = $1
        AND pr.status = 'confirmed'
        AND pr.payment_date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(pr.payment_date, 'YYYY-MM')
      ORDER BY month`,
      [hotelId],
    );

    // 2. If no payment data, fall back to reservation * room price
    const hasPaymentData = revenueRows.length > 0 && revenueRows.some((r: any) => parseFloat(r.revenue) > 0);
    if (!hasPaymentData) {
      revenueRows = await this.dataSource.query(
        `SELECT
          TO_CHAR(res.check_in, 'YYYY-MM') as month,
          COALESCE(SUM(r.price::DOUBLE PRECISION *
            GREATEST(1, (res.check_out - res.check_in))), 0) as revenue,
          COUNT(*) as reservations
        FROM reservation res
        JOIN room r ON res.room_id = r.id
        WHERE r.hotel_id = $1
          AND res.status = 'confirmed'
          AND res.check_in >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(res.check_in, 'YYYY-MM')
        ORDER BY month`,
        [hotelId],
      );
    }

    // 3. If still no data, prediction is not possible
    const hasReservationData = revenueRows.length > 0 && revenueRows.some((r: any) => parseFloat(r.revenue) > 0);
    if (!hasReservationData) {
      throw new BadRequestException(
        'El hotel no tiene ingresos registrados en los últimos 12 meses. No es posible generar una predicción.',
      );
    }

    const roomCount = await this.dataSource.query(
      `SELECT COUNT(*)::int as total FROM room WHERE hotel_id = $1`,
      [hotelId],
    );
    const roomCountValue = roomCount[0]?.total || 1;

    const monthlyRevenue: number[] = [];
    const occupancyRates: number[] = [];
    let reservationsCount: number[] = [];

    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const row = (revenueRows || []).find((r: any) => r.month === key);
      monthlyRevenue.push(row ? parseFloat(row.revenue) : 0);
      reservationsCount.push(row ? parseInt(row.reservations) : 0);

      const bookingCount = await this.dataSource.query(
        `SELECT COUNT(*)::int as total FROM reservation res
         JOIN room r ON res.room_id = r.id
         WHERE r.hotel_id = $1
           AND res.status = 'confirmed'
           AND TO_CHAR(res.check_in, 'YYYY-MM') = $2`,
        [hotelId, key],
      );
      const occupied = bookingCount[0]?.total || 0;
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      occupancyRates.push(Math.min(1, occupied / (roomCountValue * daysInMonth)));
    }

    // Track how many months have real data before interpolation
    const realDataMonths = monthlyRevenue.filter(v => v > 0).length;

    // Interpolate months with zero values using average of known data
    if (realDataMonths > 0 && realDataMonths < 12) {
      const avgRevenue = monthlyRevenue.filter(v => v > 0).reduce((a, b) => a + b, 0) / realDataMonths;
      for (let i = 0; i < 12; i++) {
        if (monthlyRevenue[i] === 0) monthlyRevenue[i] = avgRevenue;
      }
      const nonZeroReservations = reservationsCount.filter(v => v > 0);
      if (nonZeroReservations.length > 0) {
        const avgReservations = Math.round(nonZeroReservations.reduce((a, b) => a + b, 0) / nonZeroReservations.length);
        for (let i = 0; i < 12; i++) {
          if (reservationsCount[i] === 0) reservationsCount[i] = avgReservations;
        }
      } else {
        reservationsCount = reservationsCount.map(v => Math.round(avgRevenue / avgRoomPrice / 3) || 1);
      }
      const nonZeroOccupancy = occupancyRates.filter(v => v > 0);
      if (nonZeroOccupancy.length > 0) {
        const avgOccupancy = nonZeroOccupancy.reduce((a, b) => a + b, 0) / nonZeroOccupancy.length;
        for (let i = 0; i < 12; i++) {
          if (occupancyRates[i] === 0) occupancyRates[i] = avgOccupancy;
        }
      }
    }

    const predictionUrl =
      this.configService.get<string>('PREDICTION_URL') || 'http://prediction:8080';

    const response = await lastValueFrom(
      this.httpService.post(`${predictionUrl}/predict`, {
        hotel_id: hotelId,
        monthly_revenue: monthlyRevenue,
        occupancy_rates: occupancyRates,
        reservations_count: reservationsCount,
        total_rooms: totalRooms,
        avg_room_price: avgRoomPrice,
        real_data_months: realDataMonths,
      }),
    );

    return response.data;
  }

  async getMonthlyRevenue(hotelId: number): Promise<{ total: number }> {
    const result = await this.dataSource.query(
      `SELECT COALESCE(SUM(pr.amount::DOUBLE PRECISION), 0) as total
       FROM payment_reservation pr
       JOIN room r ON pr.room_id = r.id
       WHERE r.hotel_id = $1
         AND pr.status = 'confirmed'`,
      [hotelId],
    );

    const total = parseFloat(result[0]?.total) || 0;
    return { total };
  }
}
