export enum ClientType {
  Individual = 'Individual',
  Organization = 'Organization',
}

export const CLIENT_TYPE_OPTIONS = [
  { label: 'clients.individual', value: ClientType.Individual },
  { label: 'clients.organization', value: ClientType.Organization },
];