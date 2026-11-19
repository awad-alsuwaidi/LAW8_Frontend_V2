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
    sendMatterToSAP: 'Settings/general/send-matter-to-sap',

    // ============ V1 (شغالة) ============
    delete: 'Law_Matter/Delete',
    uploadLogo: 'Law_Matter/UploadLogo',
    updateGeneral: 'Law_Matter/UpdateGeneral',
  },
};
