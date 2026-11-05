// export const Matters_Task_API = {
//     matterTask: {
//       get: 'Law_Matter_Tasks/GetList',
//       update: 'Law_Matter_Tasks/Update',
//       create: 'Law_Matter_Tasks/Create',
//       getById: 'Law_Matter_Tasks/GetById',
//       delete: 'Law_Matter_Tasks/Delete',
//       createList: 'Law_Matter_Tasks/CreateList',
//       download: 'Law_Matter_Tasks/download',
//       changeStatus: 'Law_Matter_Tasks/ChangeStatus'
//     },
//   };

export const Matters_Task_API = {
  matterTask: {
    get: 'MatterTasks',
    update: 'MatterTasks/{id}',
    create: 'MatterTasks',
    getById: 'MatterTasks/{id}',
    delete: 'MatterTasks/{id}',
    createList: 'MatterTasks/CreateList',
    downloadAttachment:
      'MatterTasks/{taskId}/attachments/{attachmentId}/download',
    changeStatus: 'MatterTasks',
  },
};
