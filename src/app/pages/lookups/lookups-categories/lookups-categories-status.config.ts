import { Visability } from '../enums/visiability';

export const lookupCategory_statusConfig = {
  [Visability.Inactive]: {
    style: 'bg-alert50 text-alert600',
  },
  [Visability.Active]: {
    style: 'bg-success50 text-success600',
  },
};

export const isActive_statusConfig = {
  true: { style: 'bg-success50 text-success600' },
  false: { style: 'bg-alert50 text-alert600' },
};
