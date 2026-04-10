import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class AdminHotels {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.admin_hotel)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Hotel, (hotel) => hotel.admin_hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;
}
