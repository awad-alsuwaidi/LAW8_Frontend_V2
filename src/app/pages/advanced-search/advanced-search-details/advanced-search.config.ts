import { GlobalSearch } from "../enum/global-search.enum";
import { Activity_Columns } from "./columns-config/activity-columns.config";
import { Applicant_Columns } from "./columns-config/applicants-columns.config";
import { Clients_Columns } from "./columns-config/client-columns.config";
import { Client_Contacts_Columns } from "./columns-config/client-contacts-columns.config";
import { Matters_Columns } from "./columns-config/matter-columns.config";
import { Matter_Contacts_Columns } from "./columns-config/matter-contacts-columns.config";
import { Parties_Columns } from "./columns-config/parties-columns.config";
import { Timesheet_Columns } from "./columns-config/timesheet-columns.config";

export const AdvancedSearch: any = {
    [GlobalSearch.Clients]: {
        columns: Clients_Columns,
        routeParts: {
            firstSegment: '/clients/view/',
            lastSegment: '',
        },
        idkey:'id'
    },
    [GlobalSearch.Matters]: {
        columns: Matters_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '',
        },
        idkey:'id'
    },
    [GlobalSearch.Applicants]: {
        columns: Applicant_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/applicant',
        },
        idkey:'id'
    },
    [GlobalSearch.Client_Contacts]: {
        columns: Client_Contacts_Columns,
        routeParts: {
            firstSegment: '/clients/view/',
            lastSegment: '/contacts',
        },
        idkey:'clientId'
    },
    [GlobalSearch.Hearing_Sessions]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Matter_Contacts]: {
        columns: Matter_Contacts_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/contacts',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Parties]: {
        columns: Parties_Columns,
        route: '/matters',
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/parties',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.TimeSheet]: {
        columns: Timesheet_Columns,
        routeParts: {
            firstSegment: '/clients/view/',
            lastSegment: '/timesheet',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Meetings]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Judgments]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Phone]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Calls]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Expert_Meeting]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
    [GlobalSearch.Note]:{
        columns:Activity_Columns,
        routeParts: {
            firstSegment: '/matters/',
            lastSegment: '/activities',
        },
        idkey:'law_MatterId'
    },
}