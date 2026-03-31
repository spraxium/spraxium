export interface SendOptions {
  /**
   * Force use of a specific webhook index instead of the automatic
   * round-robin rotation. Zero-based. Throws RangeError if out of bounds.
   */
  webhookIndex?: number;
}
