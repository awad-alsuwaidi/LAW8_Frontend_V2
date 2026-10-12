import { MatterActivityType } from "src/app/pages/matters/enums/matter-activityType";



export const matterActivity_statusConfig = {
    [MatterActivityType.Created]: {
        style: 'bg-grey100 text-grey600',
    },
    [MatterActivityType.Started]: {
        style: 'bg-blue50 text-blue600',
    },
    [MatterActivityType.Hold]: {
        style: 'bg-alert50 text-alert600',
    },
    [MatterActivityType.Completed]: {
        style: 'bg-success50 text-success600',
    }
};
