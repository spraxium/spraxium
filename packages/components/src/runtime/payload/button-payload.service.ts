import { Inject, Injectable } from '@spraxium/common';
import { PayloadService } from './payload.service';

/**
 * Injectable facade that exposes dynamic-button payload revocation to the
 * application layer.
 */
@Injectable()
export class ButtonPayloadService {
  constructor(@Inject(PayloadService) private readonly payloads: PayloadService) {}

  /** Revoke a single payload ref. Missing refs are ignored. */
  async revoke(ref: string): Promise<void> {
    await this.payloads.delete(ref);
  }

  /** Revoke many payload refs in one call. Missing refs are ignored. */
  async revokeMany(refs: ReadonlyArray<string>): Promise<void> {
    await Promise.all(refs.map((ref) => this.revoke(ref)));
  }
}
