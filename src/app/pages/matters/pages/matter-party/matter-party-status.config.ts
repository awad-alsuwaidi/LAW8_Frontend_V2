import { MatterPartyType } from "src/app/pages/matters/enums/matter-partyType";


export const matter_Parties_statusConfig = {
    [MatterPartyType.Client]: {
        style: 'bg-success50 text-success600 !text-[11px]',
    },
    [MatterPartyType.Opponent]: {
        style: 'bg-error50 text-textErrorPrimary !text-[11px]',
    },
    [MatterPartyType.Others]: {
        style: 'bg-alert50 text-alert600 !text-[11px]',
    },
    [MatterPartyType.Judge]: {
        style: 'bg-blue50 text-blue600 !text-[11px]',
    },
    [MatterPartyType.Expert]: {
        style: 'bg-blue50 text-blue600 !text-[11px]',
    },
    
};
