import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AdminHotels } from '../../admin-hotels/entities/admin-hotels.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: ['hotel', 'hostel', 'motel', 'airbnb', 'other'],
  })
  type_accomodation: string;
  @Column()
  country: string;
  @Column()
  city: string;
  @Column()
  address: string;
  @Column()
  phone: string;
  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  @OneToMany(() => AdminHotels, (admin_hotels) => admin_hotels.hotel)
  admin_hotel: AdminHotels[];

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];
}
