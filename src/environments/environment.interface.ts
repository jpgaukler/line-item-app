export interface Environment {
  apiBaseUrl: string;
  auth0: {
    domain: string;
    clientId: string;
    apiAudience: string;
  };
}
