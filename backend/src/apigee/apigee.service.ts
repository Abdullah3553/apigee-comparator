import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ApigeeInstanceConfig } from '../config/config.service';

@Injectable()
export class ApigeeService {
  private readonly logger = new Logger(ApigeeService.name);
  private clients: Map<string, AxiosInstance> = new Map();

  createClient(instanceConfig: ApigeeInstanceConfig): AxiosInstance {
    const { name, management_url, credentials } = instanceConfig;

    if (this.clients.has(name)) {
      return this.clients.get(name)!;
    }

    const client = axios.create({
      baseURL: management_url,
      auth: {
        username: credentials.username,
        password: credentials.password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.clients.set(name, client);
    this.logger.log(`Created Apigee API client for instance: ${name}`);

    return client;
  }

  async fetchApps(client: AxiosInstance, org: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/apps?expand=true`);
      return response.data.app || [];
    } catch (error) {
      this.logger.error(`Failed to fetch apps for org ${org}:`, error.message);
      throw error;
    }
  }

  async fetchApp(client: AxiosInstance, org: string, appName: string): Promise<any> {
    try {
      const response = await client.get(`/organizations/${org}/apps/${appName}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch app ${appName}:`, error.message);
      throw error;
    }
  }

  async fetchApiProducts(client: AxiosInstance, org: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/apiproducts?expand=true`);
      return response.data.apiProduct || [];
    } catch (error) {
      this.logger.error(`Failed to fetch API products for org ${org}:`, error.message);
      throw error;
    }
  }

  async fetchApiProxies(client: AxiosInstance, org: string): Promise<string[]> {
    try {
      const response = await client.get(`/organizations/${org}/apis`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch API proxies for org ${org}:`, error.message);
      throw error;
    }
  }

  async fetchApiProxyDeployments(client: AxiosInstance, org: string, proxyName: string): Promise<any> {
    try {
      const response = await client.get(`/organizations/${org}/apis/${proxyName}/deployments`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch deployments for proxy ${proxyName}:`, error.message);
      throw error;
    }
  }

  async fetchCaches(client: AxiosInstance, org: string, env: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/caches`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch caches for ${org}/${env}:`, error.message);
      throw error;
    }
  }

  async fetchKvms(client: AxiosInstance, org: string, env: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/keyvaluemaps`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch KVMs for ${org}/${env}:`, error.message);
      throw error;
    }
  }

  async fetchKvmEntries(client: AxiosInstance, org: string, env: string, kvmName: string): Promise<any> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/keyvaluemaps/${kvmName}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch KVM entries for ${kvmName}:`, error.message);
      throw error;
    }
  }

  async fetchTargetServers(client: AxiosInstance, org: string, env: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/targetservers`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch target servers for ${org}/${env}:`, error.message);
      throw error;
    }
  }

  async fetchReferences(client: AxiosInstance, org: string, env: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/references`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch references for ${org}/${env}:`, error.message);
      throw error;
    }
  }

  async fetchKeystores(client: AxiosInstance, org: string, env: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/keystores`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch keystores for ${org}/${env}:`, error.message);
      throw error;
    }
  }

  async fetchKeystoreCertificates(client: AxiosInstance, org: string, env: string, keystoreName: string): Promise<any> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/keystores/${keystoreName}/certs`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch certificates for keystore ${keystoreName}:`, error.message);
      throw error;
    }
  }

  async fetchVirtualHosts(client: AxiosInstance, org: string, env: string): Promise<any[]> {
    try {
      const response = await client.get(`/organizations/${org}/environments/${env}/virtualhosts`);
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch virtual hosts for ${org}/${env}:`, error.message);
      throw error;
    }
  }
}
