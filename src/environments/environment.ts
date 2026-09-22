export const environment = {
  production: false,

  // Remote (Azure) URLs
  apiUrl: 'https://law8-tenancy-api-evevejd5emgedrhw.uaenorth-01.azurewebsites.net/api/v1',
  authUrl: 'https://law8-auth-api-chexfmhreucwgye3.uaenorth-01.azurewebsites.net/api/v1',

  // Local development URLs (Tenancy.Api :5236, Auth.Api :5238)
  apiUrlLocal: 'http://localhost:5236/api/v1',
  authUrlLocal: 'http://localhost:5238/api/v1',

  tenant: 'admin',

  auth: {
    redirectUri: 'http://localhost:4200/callback',
  },
};