import { ACTIVE_ENV } from '../app/@core/config/env.config';
import { envMap, EnvConfig } from '../app/@core/config/env.map';

export const environment: EnvConfig = envMap[ACTIVE_ENV];