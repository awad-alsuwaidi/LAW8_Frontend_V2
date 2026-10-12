export const Matters_API = {
  matters: {
    get: 'Law_Matter/GetList',
    update: 'Law_MatterV2/Update',
    create:'Law_MatterV2/Create',
    getById:'Law_MatterV2/GetById',
    delete:'Law_Matter/Delete',
    getClientNameAndMatterCodeByClientId:'Law_Matter/GetCLientNameAndMattCodeByClient',
    uploadLogo:'Law_Matter/UploadLogo',
    getMatterCodeByMatterId:"AppLookup/GetMatterCodeById",
    updateGeneral:"Law_Matter/UpdateGeneral",
    getCLientNameAndMattCodeByClientAndParent:"Law_Matter/GetCLientNameAndMattCodeByClientAndParent",
    deactiveMatter:"Law_Matter/Law_MatterActiveAndDeactive",
    importentMatter:"Law_Matter/SetUserImportent",
    getPartiesByMatterId:"Law_MattParties/GetMatterPartiesById",
    sendMatterToSAP:"Law_Matter/AddMatterToSap"
  },
};