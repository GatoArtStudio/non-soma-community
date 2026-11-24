import type { ModerationActionEntry, RecordedModerationAction } from "./moderation-action";

export interface ModerationLog {
  record(entry: ModerationActionEntry): Promise<void>;
  listRecent(limit: number): Promise<RecordedModerationAction[]>;
}
