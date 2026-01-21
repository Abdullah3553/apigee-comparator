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

@Entity('keystores')
@Unique(['environment_id', 'name'])
@Index(['environment_id'])
@Index(['name'])
@Index(['fetched_at'])
export class Keystore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  environment_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  aliases: any;

  @Column({ type: 'jsonb', nullable: true })
  certificates: any;

  @Column({ type: 'jsonb', nullable: true })
  raw_response: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fetched_at: Date;

  @ManyToOne(() => Environment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'environment_id' })
  environment: Environment;
}
