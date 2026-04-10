import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { Reservation } from '../../booking/entities/reservation.entity';
import { PaymentReservation } from '../../payment-booking/entities/payment-reservation.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  price: number;
  @Column({
    type: 'enum',
    enum: ['free', 'busy', 'booked'],
    default: 'free',
  })
  status: string;
  @Column()
  ability: string;
  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservation: Reservation[];

  @OneToMany(() => PaymentReservation, (payment) => payment.room)
  payment: PaymentReservation[];
}
