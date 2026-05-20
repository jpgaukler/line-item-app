export interface Environment {
  apiBaseUrl: string;
  auth0: {
    domain: string;
    clientId: string;
    audience: string;
  };
}
