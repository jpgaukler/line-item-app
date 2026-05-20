import { Environment } from './environment.interface';

export const environment: Environment = {
  apiBaseUrl: 'http://localhost:3001',
  auth0: {
    domain: 'login.line-item.app',
    clientId: 'N8B3KhcpMYABAjSjwZ3jBbqDXE8ZD5gG',
    audience: 'https://line-item.app',
  },
};
