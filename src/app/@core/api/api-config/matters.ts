// export const Matters_API = {
//   matters: {
//     get: 'Law_Matter/GetList',
//     update: 'Law_MatterV2/Update',
//     create:'Law_MatterV2/Create',
//     getById:'Law_MatterV2/GetById',
//     delete:'Law_Matter/Delete',
//     getClientNameAndMatterCodeByClientId:'Law_Matter/GetCLientNameAndMattCodeByClient',
//     uploadLogo:'Law_Matter/UploadLogo',
//     getMatterCodeByMatterId:"AppLookup/GetMatterCodeById",
//     updateGeneral:"Law_Matter/UpdateGeneral",
//     getCLientNameAndMattCodeByClientAndParent:"Law_Matter/GetCLientNameAndMattCodeByClientAndParent",
//     deactiveMatter:"Law_Matter/Law_MatterActiveAndDeactive",
//     importentMatter:"Law_Matter/SetUserImportent",
//     getPartiesByMatterId:"Law_MattParties/GetMatterPartiesById",
//     sendMatterToSAP:"Law_Matter/AddMatterToSap"
//   },
// };

export const Matters_API = {
  matters: {
    // ============ NEW ============
    get: 'Matters',
    create: 'Matters',
    update: 'Matters',
    getById: 'Matters',
    nextCode: 'Matters/next-code',
    getMatterParties: 'MatterParties',
    toggleImportant: 'Matters',
    deactiveMatter: 'Matters/{id}/activation',
    getMatterCodeByMatterId: 'lookups/matters',
    getClientNameAndMatterCodeByClientId:
      'Law_Matter/GetCLientNameAndMattCodeByClient',
    getCLientNameAndMattCodeByClientAndParent:
      'Law_Matter/GetCLientNameAndMattCodeByClientAndParent',
    getPartiesByMatterId: 'Law_MattParties/GetMatterPartiesById',
    importentMatter: 'Matters',

    // ============ V1 (شغالة) ============
    delete: 'Law_Matter/Delete',
    uploadLogo: 'Law_Matter/UploadLogo',
    // getMatterCodeByMatterId: 'AppLookup/GetMatterCodeById',
    updateGeneral: 'Law_Matter/UpdateGeneral',
    // deactiveMatter: 'Law_Matter/Law_MatterActiveAndDeactive',
    // importentMatter: 'Law_Matter/SetUserImportent',
    sendMatterToSAP: 'Law_Matter/AddMatterToSap',
  },
};
