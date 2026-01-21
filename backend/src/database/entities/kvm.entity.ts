import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Environment } from './environment.entity';

@Entity('kvms')
@Unique(['environment_id', 'name'])
@Index(['environment_id'])
@Index(['name'])
@Index(['fetched_at'])
export class Kvm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  environment_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'boolean', default: false })
  encrypted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  entries: any;

  @Column({ type: 'int', default: 0 })
  entry_count: number;

  @Column({ type: 'jsonb', nullable: true })
  raw_response: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fetched_at: Date;

  @ManyToOne(() => Environment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'environment_id' })
  environment: Environment;
}
