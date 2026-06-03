import { Environment } from './environment.interface';

export const environment: Environment = {
  apiBaseUrl: 'https://localhost:7165',
  auth0: {
    domain: 'login.dev.line-item.app',
    clientId: 'N8B3KhcpMYABAjSjwZ3jBbqDXE8ZD5gG',
    apiAudience: 'https://line-item.app/api',
  },
};
