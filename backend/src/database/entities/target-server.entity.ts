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

@Entity('target_servers')
@Unique(['environment_id', 'name'])
@Index(['environment_id'])
@Index(['name'])
@Index(['fetched_at'])
export class TargetServer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  environment_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500 })
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ type: 'boolean', default: true })
  is_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  ssl_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  ssl_info: any;

  @Column({ type: 'jsonb', nullable: true })
  raw_response: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fetched_at: Date;

  @ManyToOne(() => Environment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'environment_id' })
  environment: Environment;
}
