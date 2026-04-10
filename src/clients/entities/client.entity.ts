import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from '../../booking/entities/reservation.entity';
import { PaymentReservation } from '../../payment-booking/entities/payment-reservation.entity';
@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  last_name: string;
  @Column()
  email: string;
  @Column()
  phone: string;
  @Column()
  password: string;
  @Column()
  country: string;
  @Column({ default: 'user' })
  rol: string;
  @Column({
    type: 'enum',
    enum: ['CC', 'TI', 'TE', 'PP', 'PPT', 'NIT'],
    default: 'CC',
  })
  type_document: string;
  @Column()
  number_document: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.client)
  reservation: Reservation[];

  @OneToMany(() => PaymentReservation, (payment) => payment.client)
  payment: PaymentReservation[];
}
