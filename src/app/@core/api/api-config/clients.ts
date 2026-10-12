export const Clients_API = {
  client: {
    get:'ClientV2/GetActiveList', //'Client/GetList',
    getById: 'ClientV2/GetById',
    create: 'ClientV2/Create',
    update: 'ClientV2/Update',
    getOrNewClientCode:"ClientV2/GetClientCodeorNewClient",
    // createIntake: '/CreateClientIntake',
    activationClient:'ClientV2/Activation',
  },
  clientInActiveList:{
    get:"ClientV2/GetInActiveList"

  }
};
