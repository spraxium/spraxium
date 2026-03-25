import type { ClientAwareTransport, LogTransport } from '../interfaces';

export function isClientAwareTransport(transport: LogTransport): transport is ClientAwareTransport {
  return 'setClient' in transport;
}
