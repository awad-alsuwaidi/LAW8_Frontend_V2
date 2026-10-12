import { MatterTaskType } from "src/app/pages/matters/enums/matter-taskType";



export const matterTask_statusConfig = {
    [MatterTaskType.Created]: {
        style: 'bg-grey100 text-grey600',
    },
    [MatterTaskType.Started]: {
        style: 'bg-blue50 text-blue600',
    },
    [MatterTaskType.Hold]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterTaskType.Completed]: {
        style: 'bg-success50 text-success600',
    }
};
