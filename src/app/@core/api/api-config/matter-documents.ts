export const Matters_Documents_API = {
  // matterDocuments: {
  //   get: 'Law_MatterDocuments/GetList',
  //   getById: 'Law_MatterDocuments/GetById',
  //   update: 'Law_MatterDocuments/Update',
  //   create: 'Law_MatterDocuments/Create',
  //   delete: 'Law_MatterDocuments/Delete',
  //   download: 'Law_MatterDocuments/download',
  // },
  matterDocuments: {
    get: 'MatterDocuments',
    getById: 'MatterDocuments/{id}',
    create: 'MatterDocuments/by-matter/{matterId}',
    update: 'MatterDocuments/{id}',
    delete: 'MatterDocuments/{id}',
    download: 'MatterDocuments/{id}/download',
  },
  matterDocumentsdashboard: {
    get: 'Law_MatterDocuments/GetListDashBoard',
  },
};
