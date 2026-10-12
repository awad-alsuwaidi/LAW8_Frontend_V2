import { Visability } from "../../enums/visiability";

export const lookupSubCategory_statusConfig = {
    [Visability.Inactive]: {
        style: 'bg-alert50 text-alert600',
    },
    [Visability.Active]: {
        style: 'bg-success50 text-success600',
    }
};
