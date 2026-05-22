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
import { RoomStatus } from 'src/enums/rooms.enum';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column('decimal')
  price: number;
  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.FREE,
  })
  status: string;
  @Column()
  ability: string;
  @Column({ nullable: true })
  image: string;
  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservation: Reservation[];

  @OneToMany(() => PaymentReservation, (payment) => payment.room)
  payment: PaymentReservation[];
}
