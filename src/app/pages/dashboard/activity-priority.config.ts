import { MatterTaskPriority } from "src/app/pages/matters/enums/matter-taskPriority";

export const activity_priorityConfig = {
    [MatterTaskPriority.Urgent]: {
        style: 'bg-error50 text-textErrorPrimary',
    },
    [MatterTaskPriority.High]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterTaskPriority.Medium]: {
        style: 'bg-success50 text-success600',
    },
    [MatterTaskPriority.Low]: {
        style: 'bg-grey100 text-grey600',
    }
};