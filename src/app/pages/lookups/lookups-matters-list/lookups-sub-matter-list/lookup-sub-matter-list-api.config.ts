import { environment } from 'src/environments/environment';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups';

const isInhouse = environment.brand === 'inhouse';

export const API_CONFIG: Record<string, any> = {
  '1': {
    api: Lookups_API.matterStatuses,       // ★ جديد
    title: 'common.mattStatus',
    addPermission: 'MatterStatuses:canUpdate',
    updatePermission: 'MatterStatuses:canUpdate',
    deletePermission: 'MatterStatuses:canDelete',
    values: [1],
  },
  '2': {
    api: Lookups_API.stages,                // ★ جديد
    title: 'common.stage',
    addPermission: 'MatterStages:canUpdate',
    updatePermission: 'MatterStages:canUpdate',
    deletePermission: 'MatterStages:canDelete',
    values: [],
  },
  '3': {
    api: Lookups_API.clientGroups,          // ★ جديد
    title: isInhouse ? 'common.entityGroup' : 'common.clientGroup',
    addPermission: 'ClientGroups:canUpdate',
    updatePermission: 'ClientGroups:canUpdate',
    deletePermission: 'ClientGroups:canDelete',
    values: [],
  },
  '4': {
    api: Lookups_API.referralTypes,         // ★ جديد
    title: 'common.referralType',
    addPermission: 'ReferralTypes:canUpdate',
    updatePermission: 'ReferralTypes:canUpdate',
    deletePermission: 'ReferralTypes:canDelete',
    values: [],
  },
  '5': {
    api: Lookups_API.partiesDescriptions,   // ★ جديد
    title: 'common.partiesDescription',
    addPermission: 'PartyDescriptions:canUpdate',
    updatePermission: 'PartyDescriptions:canUpdate',
    deletePermission: 'PartyDescriptions:canDelete',
    values: [],
  },
  '6': {
    api: Lookups_API.adjournmentReasons,    // ★ جديد
    title: 'common.adjournmentReasons',
    addPermission: 'AdjournmentReasons:canUpdate',
    updatePermission: 'AdjournmentReasons:canUpdate',
    deletePermission: 'AdjournmentReasons:canDelete',
    values: [],
  },
  '7': {
    api: Lookups_API.taskCodes,             // ★ جديد
    title: 'common.taskCodebilling',
    addPermission: 'TaskCodes:canUpdate',
    updatePermission: 'TaskCodes:canUpdate',
    deletePermission: 'TaskCodes:canDelete',
    values: [],
  },
  '8': {
    api: Lookups_API.practiceAreas,         // ★ جديد
    title: 'common.practiceArea',
    addPermission: 'PracticeAreas:canUpdate',
    updatePermission: 'PracticeAreas:canUpdate',
    deletePermission: 'PracticeAreas:canDelete',
    values: [],
  },
  '9': {
    api: Lookups_API.departments,           // ★ جديد
    title: 'common.department',
    addPermission: 'Departments:canUpdate',
    updatePermission: 'Departments:canUpdate',
    deletePermission: 'Departments:canDelete',
    values: [],
  },
  '10': {
    api: Lookups_API.industries,            // ★ جديد
    title: 'common.industry',
    addPermission: 'Industries:canUpdate',
    updatePermission: 'Industries:canUpdate',
    deletePermission: 'Industries:canDelete',
    values: ['Lawyer'],
  },
  '11': {
    api: Lookups_API.branches,              // ★ جديد
    title: 'common.branch',
    addPermission: 'Branches:canUpdate',
    updatePermission: 'Branches:canUpdate',
    deletePermission: 'Branches:canDelete',
    values: [],
  },
  '13': {
    api: Lookups_API.taskCodesGroups,       // ★ جديد
    title: 'common.taskCodebillinggroup',
    addPermission: 'TaskCodeGroups:canUpdate',
    updatePermission: 'TaskCodeGroups:canUpdate',
    deletePermission: 'TaskCodeGroups:canDelete',
    values: [],
  },
};