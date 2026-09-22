import { AuditLogDto } from './services/audit';

/** One modified property, parsed from the backend's `{ "Prop": { old, new } }` JSON. */
export interface AuditChange {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
}

/** Translation + formatting hooks the parser needs; keeps it free of Angular DI. */
export interface AuditFormatters {
  t: (key: string) => string;
  formatDateTime: (iso: string) => string;
}

/** Entity CLR name in the UI language; falls back to the raw name. */
export function auditEntityLabel(entityName: string, t: (k: string) => string): string {
  const key = 'audit.entities.' + entityName;
  const v = t(key);
  return v === key ? entityName : v;
}

/** Property name in the UI language; unknown names are split on camel case. */
export function auditFieldLabel(field: string, t: (k: string) => string): string {
  const key = 'audit.fields.' + field;
  const v = t(key);
  return v === key ? field.replace(/([a-z])([A-Z])/g, '$1 $2') : v;
}

function formatValue(v: unknown, f: AuditFormatters): string {
  if (v === null || v === undefined || v === '') return f.t('audit.empty');
  if (typeof v === 'boolean') return f.t(v ? 'audit.yes' : 'audit.no');
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return f.formatDateTime(v);
  return String(v);
}

export function parseAuditChanges(raw: string | undefined, f: AuditFormatters): AuditChange[] {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw) as Record<string, { old: unknown; new: unknown }>;
    return Object.entries(obj).map(([field, v]) => ({
      field,
      label: auditFieldLabel(field, f.t),
      oldValue: formatValue(v?.old, f),
      newValue: formatValue(v?.new, f),
    }));
  } catch {
    // Truncated or legacy payload - surface it verbatim rather than hide it.
    return [{ field: '', label: f.t('audit.rawChanges'), oldValue: '', newValue: raw }];
  }
}

/** Short summary for the table cell: "Record created" / "3 fields changed". */
export function auditChangesSummary(log: AuditLogDto, changes: AuditChange[], t: (k: string) => string): string {
  if (log.action !== 'Updated') return t('audit.summary' + log.action);
  const n = changes.length;
  if (n === 0) return '\u2014';
  return (n === 1 ? t('audit.fieldsOne') : t('audit.fieldsMany')).replace('{{count}}', String(n));
}
