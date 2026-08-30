import { z } from "zod";

export const screeningBatchItemSchema = z.object({
  Rank: z.number(),
  Symbol: z.string(),
  Date: z.string(),
  Close: z.number(),
  Low_3M: z.number(),
  Position: z.string(),
  PricePosition: z.number(),
  Forecast: z.string(),
  Confidence: z.number(),
  Risk: z.string(),
  LiquidityScore: z.number(),
  TT1: z.string(),
  TT2: z.string(),
  TT3: z.string().nullable().optional(),
});

export const screeningBatchPayloadSchema = z.array(screeningBatchItemSchema);

export type ScreeningBatchItem = z.infer<typeof screeningBatchItemSchema>;

export const confidenceBreakdownSchema = z.object({
  time: z.number(),
  price: z.number(),
  momentum: z.number(),
  trend: z.number(),
  compression: z.number(),
  volume: z.number(),
  penalty: z.number(),
});

export const featureSnapshotSchema = z.object({
  close: z.number(),
  low_3m: z.number(),
  high_3m: z.number(),
  position: z.number(),
  volume_ratio: z.number(),
  upper_wick_ratio: z.number(),
});

export const journalAuditItemSchema = z.object({
  symbol: z.string(),
  analysis_date: z.string(),
  tt_id: z.string(),
  anchor_date: z.string(),
  projected_date: z.string(),
  forecast: z.string(),
  action: z.string(),
  confidence: z.number(),
  confidence_breakdown: confidenceBreakdownSchema,
  hard_vetoes: z.array(z.string()),
  feature_snapshot: featureSnapshotSchema,
  parameter_version: z.string(),
  event_fingerprint: z.string(),
  decision_fingerprint: z.string(),
});

export const journalAuditPayloadSchema = z.array(journalAuditItemSchema);

export type JournalAuditItem = z.infer<typeof journalAuditItemSchema>;