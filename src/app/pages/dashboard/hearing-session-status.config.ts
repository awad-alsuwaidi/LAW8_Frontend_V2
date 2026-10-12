import { MatterStatus } from "src/app/pages/matters/enums/matter-status";


export const hearingSession_statusConfig = {
    [MatterStatus.NewCase]: {
        style: 'bg-success50 text-success600',
    },
    [MatterStatus.DraftCase]: {
        style: 'bg-success50 text-success600',
    },
    [MatterStatus.ForCourtRegistration]: {
        style: 'bg-success50 text-success600',
    },
    [MatterStatus.FirstHearing]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterStatus.PleadingStage]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterStatus.ReturnedForPleading]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterStatus.UnderProcess]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterStatus.AppealPeriod]: {
        style: 'bg-error50 text-textErrorPrimary',
    },
    [MatterStatus.FinalJudgment]: {
        style: 'bg-blue50 text-blue600',
    },
    [MatterStatus.CombinedCase]: {
        style: 'bg-blue50 text-blue600',
    },
    [MatterStatus.Transferred]: {
        style: 'bg-blue50 text-blue600',
    },
    [MatterStatus.TransferredToPublicProsecution]: {
        style: 'bg-blue50 text-blue600',
    },
    [MatterStatus.Closed]: {
        style: 'bg-grey100 text-textTertairy',
    },
    [MatterStatus.Adjudicated]: {
        style: 'bg-grey100 text-textTertairy',
    },
};
