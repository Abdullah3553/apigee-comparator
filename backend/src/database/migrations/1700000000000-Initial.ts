import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1700000000000 implements MigrationInterface {
  name = 'Initial1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create instances table
    await queryRunner.query(`
      CREATE TABLE "instances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "management_url" character varying(500) NOT NULL,
        "org_name" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_instances_name" UNIQUE ("name"),
        CONSTRAINT "PK_instances" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_instance_name" ON "instances" ("name")`);

    // Create environments table
    await queryRunner.query(`
      CREATE TABLE "environments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "instance_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "identifier" character varying(500) NOT NULL,
        "last_refreshed_at" TIMESTAMP,
        "refresh_status" character varying(50) NOT NULL DEFAULT 'pending',
        "refresh_error" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_environments_identifier" UNIQUE ("identifier"),
        CONSTRAINT "PK_environments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_environments_instance" FOREIGN KEY ("instance_id") REFERENCES "instances"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_environment_identifier" ON "environments" ("identifier")`);
    await queryRunner.query(`CREATE INDEX "idx_environment_instance" ON "environments" ("instance_id")`);

    // Create apps table
    await queryRunner.query(`
      CREATE TABLE "apps" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "status" character varying(50),
        "developer_id" character varying(255),
        "credentials" jsonb,
        "products" jsonb,
        "attributes" jsonb,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_apps_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_apps" PRIMARY KEY ("id"),
        CONSTRAINT "FK_apps_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_app_environment" ON "apps" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_app_name" ON "apps" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_app_fetched" ON "apps" ("fetched_at")`);
    await queryRunner.query(`CREATE INDEX "idx_app_credentials" ON "apps" USING GIN("credentials")`);

    // Create api_products table
    await queryRunner.query(`
      CREATE TABLE "api_products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "status" character varying(50),
        "display_name" character varying(255),
        "proxies" jsonb,
        "quota" jsonb,
        "scopes" jsonb,
        "environments" jsonb,
        "attributes" jsonb,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_api_products_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_api_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_api_products_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_api_product_environment" ON "api_products" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_api_product_name" ON "api_products" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_api_product_fetched" ON "api_products" ("fetched_at")`);

    // Create api_proxies table
    await queryRunner.query(`
      CREATE TABLE "api_proxies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "latest_revision" integer,
        "deployed_revisions" jsonb,
        "metadata" jsonb,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_api_proxies_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_api_proxies" PRIMARY KEY ("id"),
        CONSTRAINT "FK_api_proxies_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_api_proxy_environment" ON "api_proxies" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_api_proxy_name" ON "api_proxies" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_api_proxy_fetched" ON "api_proxies" ("fetched_at")`);
    await queryRunner.query(`CREATE INDEX "idx_api_proxy_deployments" ON "api_proxies" USING GIN("deployed_revisions")`);

    // Create caches table
    await queryRunner.query(`
      CREATE TABLE "caches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "expiry_settings" jsonb,
        "overflow_to_disk" boolean,
        "skip_cache_if_element_size_kb" integer,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_caches_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_caches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_caches_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_cache_environment" ON "caches" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_cache_name" ON "caches" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_cache_fetched" ON "caches" ("fetched_at")`);

    // Create kvms table
    await queryRunner.query(`
      CREATE TABLE "kvms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "encrypted" boolean NOT NULL DEFAULT false,
        "entries" jsonb,
        "entry_count" integer NOT NULL DEFAULT 0,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_kvms_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_kvms" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kvms_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_kvm_environment" ON "kvms" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_kvm_name" ON "kvms" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_kvm_fetched" ON "kvms" ("fetched_at")`);

    // Create target_servers table
    await queryRunner.query(`
      CREATE TABLE "target_servers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "host" character varying(500) NOT NULL,
        "port" integer NOT NULL,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "ssl_enabled" boolean NOT NULL DEFAULT false,
        "ssl_info" jsonb,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_target_servers_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_target_servers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_target_servers_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_target_server_environment" ON "target_servers" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_target_server_name" ON "target_servers" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_target_server_fetched" ON "target_servers" ("fetched_at")`);

    // Create references table
    await queryRunner.query(`
      CREATE TABLE "references" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "resource_type" character varying(100) NOT NULL,
        "refers_to" character varying(255) NOT NULL,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_references_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_references" PRIMARY KEY ("id"),
        CONSTRAINT "FK_references_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_reference_environment" ON "references" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_reference_name" ON "references" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_reference_fetched" ON "references" ("fetched_at")`);

    // Create keystores table
    await queryRunner.query(`
      CREATE TABLE "keystores" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "aliases" jsonb,
        "certificates" jsonb,
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_keystores_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_keystores" PRIMARY KEY ("id"),
        CONSTRAINT "FK_keystores_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_keystore_environment" ON "keystores" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_keystore_name" ON "keystores" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_keystore_fetched" ON "keystores" ("fetched_at")`);
    await queryRunner.query(`CREATE INDEX "idx_keystore_certs" ON "keystores" USING GIN("certificates")`);

    // Create virtual_hosts table
    await queryRunner.query(`
      CREATE TABLE "virtual_hosts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "environment_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "host_aliases" jsonb,
        "port" integer NOT NULL,
        "ssl_enabled" boolean NOT NULL DEFAULT false,
        "ssl_info" jsonb,
        "base_url" character varying(500),
        "raw_response" jsonb,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_virtual_hosts_environment_name" UNIQUE ("environment_id", "name"),
        CONSTRAINT "PK_virtual_hosts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_virtual_hosts_environment" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_virtual_host_environment" ON "virtual_hosts" ("environment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_virtual_host_name" ON "virtual_hosts" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_virtual_host_fetched" ON "virtual_hosts" ("fetched_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "virtual_hosts"`);
    await queryRunner.query(`DROP TABLE "keystores"`);
    await queryRunner.query(`DROP TABLE "references"`);
    await queryRunner.query(`DROP TABLE "target_servers"`);
    await queryRunner.query(`DROP TABLE "kvms"`);
    await queryRunner.query(`DROP TABLE "caches"`);
    await queryRunner.query(`DROP TABLE "api_proxies"`);
    await queryRunner.query(`DROP TABLE "api_products"`);
    await queryRunner.query(`DROP TABLE "apps"`);
    await queryRunner.query(`DROP TABLE "environments"`);
    await queryRunner.query(`DROP TABLE "instances"`);
  }
}
