import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Instance } from './instance.entity';

@Entity('environments')
@Index(['instance_id'])
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  instance_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 500 })
  @Index()
  identifier: string;

  @Column({ type: 'timestamp', nullable: true })
  last_refreshed_at: Date | null;

  @Column({ length: 50, default: 'pending' })
  refresh_status: string;

  @Column({ type: 'text', nullable: true })
  refresh_error: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Instance, (instance) => instance.environments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instance_id' })
  instance: Instance;
}
