import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AdminHotels } from '../../admin-hotels/entities/admin-hotels.entity';
import { Payment } from '../../payment/entities/payment.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  last_name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ type: 'enum', enum: ['admin', 'user'] })
  rol: string;
  @Column({
    type: 'enum',
    enum: ['CC', 'TI', 'TE', 'PP', 'PPT', 'NIT'],
    default: 'CC',
  })
  type_document: string;
  @Column()
  number_document: string;
  @Column()
  phone: string;
  @Column()
  country: string;
  @Column()
  city: string;

  @OneToMany(() => AdminHotels, (admin_hotels) => admin_hotels.user)
  admin_hotel: AdminHotels[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Column({ default: false })
  has_premium_service: boolean;

  @Column({ default: false })
  has_vip_service: boolean;
}
