// export const Matters_Activity_API = {
//   matterActivity: {
//     get: 'Law_MatterActivity/GetList',
//     getById: 'Law_MatterActivity/GetById',
//     update: 'Law_MatterActivity/Update',
//     create: 'Law_MatterActivity/Create',
//     delete: 'Law_MatterActivity/Delete',
//   },
// };


export const Matters_Activity_API = {
  matterActivity: {
    get: 'MatterActivities',
    create: 'MatterActivities',
    update: 'MatterActivities/{id}',
    getById: 'MatterActivities/{id}',
    delete: 'MatterActivities/{id}',
    adjourn: 'MatterActivities/{id}/adjourn',
    lookups: 'lookups',
    usersLookup: 'users/lookup',
    mattersLookup: 'Matters',
  },
};
