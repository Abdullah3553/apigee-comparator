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

@Entity('api_products')
@Unique(['environment_id', 'name'])
@Index(['environment_id'])
@Index(['name'])
@Index(['fetched_at'])
export class ApiProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  environment_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50, nullable: true })
  status: string;

  @Column({ length: 255, nullable: true })
  display_name: string;

  @Column({ type: 'jsonb', nullable: true })
  proxies: any;

  @Column({ type: 'jsonb', nullable: true })
  quota: any;

  @Column({ type: 'jsonb', nullable: true })
  scopes: any;

  @Column({ type: 'jsonb', nullable: true })
  environments: any;

  @Column({ type: 'jsonb', nullable: true })
  attributes: any;

  @Column({ type: 'jsonb', nullable: true })
  raw_response: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fetched_at: Date;

  @ManyToOne(() => Environment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'environment_id' })
  environment: Environment;
}
