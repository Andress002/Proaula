import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { Client } from '../../clients/entities/client.entity';
import { PaymentReservation } from '../../payment-booking/entities/payment-reservation.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Room, (room) => room.reservation)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Client, (client) => client.reservation)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({
    type: 'enum',
    enum: ['canceled', 'confirmed', 'refunded'],
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  check_in: Date;

  @Column({ type: 'date', nullable: true })
  check_out: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => PaymentReservation, (payment) => payment.reservation)
  payment: PaymentReservation[];
}
