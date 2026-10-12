
import { PermissionAction } from 'src/app/@core/models/permission.interface';

export interface LookupConfig {
  icon: string;
  title: string;
  description: string;

  /** ★ الـ routeName من الـ /me */
  routeName: string;

  /** ★ الـ action المطلوب (default: canRead) */
  action?: PermissionAction;

  /** ★ لو الكارت بيظهر بأي واحدة من مجموعة routeNames */
  anyOfRouteNames?: Array<{ routeName: string; action?: PermissionAction }>;

  command: () => void;
}