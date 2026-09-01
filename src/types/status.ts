/**
 * Trial lifecycle, exactly as specified in 02_SRS.md §6 and 07_DATA_MODEL.md.
 * Kept verbatim so the database enum, the API and the UI never drift apart.
 */
export type TrialStatus =
  | 'draft'
  | 'active'
  | 'kept'
  | 'cancellation_in_progress'
  | 'cancelled'
  | 'renewed_or_charged'
  | 'expired'
  | 'archived';

/** Short, human labels for each status. Copy style per 16_CONTENT_AND_COPY.md. */
export const STATUS_LABEL: Record<TrialStatus, string> = {
  draft: 'Draft',
  active: 'Protected',
  kept: 'Kept',
  cancellation_in_progress: 'Cancelling',
  cancelled: 'Cancelled',
  renewed_or_charged: 'Charged',
  expired: 'Expired',
  archived: 'Archived',
};
