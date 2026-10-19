// export const Clients_API = {
//   client: {
//     get:'ClientV2/GetActiveList', //'Client/GetList',
//     getById: 'ClientV2/GetById',
//     create: 'ClientV2/Create',
//     update: 'ClientV2/Update',
//     getOrNewClientCode:"ClientV2/GetClientCodeorNewClient",
//     // createIntake: '/CreateClientIntake',
//     activationClient:'ClientV2/Activation',
//   },
//   clientInActiveList:{
//     get:"ClientV2/GetInActiveList"

//   }
// };

export const Clients_API = {
  client: {
    get: 'Clients',
    getById: 'Clients',
    create: 'Clients',
    update: 'Clients',
    delete: 'Clients',
    nextCode: 'Clients/next-code',
    activationClient: 'Clients',
  },

  clientInActiveList: {
    get: 'Clients',
  },

  clientGroups: {
    get: 'lookups/client-groups',
    getById: 'lookups/client-groups',
    create: 'lookups/client-groups',
    update: 'lookups/client-groups',
    delete: 'lookups/client-groups',
  },

  countries: {
    get: 'lookups/countries',
    getById: 'lookups/countries',
    create: 'lookups/countries',
    update: 'lookups/countries',
    delete: 'lookups/countries',
  },

  usersLookup: {
    get: 'users/lookup',
  },
};

export const Clients_Contact_API = {
  clientsContact: {
    get: 'Contacts',
    getById: 'Contacts',
    create: 'Contacts',
    update: 'Contacts',
    delete: 'Contacts',
  },
};
