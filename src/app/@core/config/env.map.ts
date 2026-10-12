import { EnvType } from './env.config';

export interface EnvConfig {
  production: boolean;
  env: EnvType;
  brand: string;
  apiUrl: string;
  authUrl: string;
  tenant: string;
  baseUrl: string;
  subDomain: string;
}

const TEST_API_URL  = 'https://law8-backend-v2-fwgvf5h6amfjgtgr.uaenorth-01.azurewebsites.net/api/v1';
const TEST_AUTH_URL = 'https://law8-auth-api-chexfmhreucwgye3.uaenorth-01.azurewebsites.net/api/v1';

const PROD_API_URL  = 'https://api.law8.com/api/v1';
const PROD_AUTH_URL = 'https://auth.law8.com/api/v1';

const stripApiVersion = (url: string): string =>
  url.replace(/\/api\/v\d+\/?$/, '');

const buildEnv = (
  cfg: Omit<EnvConfig, 'baseUrl' | 'subDomain'>
): EnvConfig => ({
  ...cfg,
  baseUrl: stripApiVersion(cfg.apiUrl),
  subDomain: cfg.tenant,
});

export const envMap: Record<string, EnvConfig> = {
  'azure-test': buildEnv({
    production: true,
    env: 'test',
    brand: 'azure',
    apiUrl: TEST_API_URL,
    authUrl: TEST_AUTH_URL,
    tenant: 'taha',
  }),

  'alsuwaidi-test': buildEnv({
    production: false,
    env: 'test',
    brand: 'alsuwaidi',
    apiUrl: TEST_API_URL,
    authUrl: TEST_AUTH_URL,
    tenant: 'taha',
  }),

  'inhouse': buildEnv({
    production: false,
    env: 'test',
    brand: 'inhouse',
    apiUrl: TEST_API_URL,
    authUrl: TEST_AUTH_URL,
    tenant: 'taha',
  }),

  'sandbox': buildEnv({
    production: false,
    env: 'test',
    brand: 'sandbox',
    apiUrl: TEST_API_URL,
    authUrl: TEST_AUTH_URL,
    tenant: 'taha',
  }),

  'azure-prod': buildEnv({
    production: true,
    env: 'prod',
    brand: 'azure',
    apiUrl: PROD_API_URL,
    authUrl: PROD_AUTH_URL,
    tenant: 'admin',
  }),

  'alsuwaidi-prod': buildEnv({
    production: true,
    env: 'prod',
    brand: 'alsuwaidi',
    apiUrl: PROD_API_URL,
    authUrl: PROD_AUTH_URL,
    tenant: 'admin',
  }),
};