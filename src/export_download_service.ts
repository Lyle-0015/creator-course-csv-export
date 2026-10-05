import { z } from "zod";
import { infrai } from "./infrai.ts";

export const ExportRequest = z.object({ courseId: z.string().min(1), subscriberIds: z.array(z.string().min(1)).min(1), requestedBy: z.string().email() });
export type ExportRequest = z.infer<typeof ExportRequest>;
const BUCKET = "course-exports";

export async function createSubscriberCsv(input: unknown): Promise<{ key: string; csv: string; uploadUrl: string; downloadUrl: string; rows: number }> {
  const request = ExportRequest.parse(input);
  const key = `${request.courseId}/subscribers-${Date.now()}.csv`;
  const csv = ["course_id,subscriber_id,requested_by", ...request.subscriberIds.map((id) => `${request.courseId},${id},${request.requestedBy}`)].join("\n") + "\n";
  await infrai.storage.bucket.create({ name: BUCKET });
  const upload = await infrai.storage.object.presign(BUCKET, key, { op: "put", expires_seconds: 600, content_type: "text/csv", idempotency_key: key });
  const uploadResponse = await fetch(upload.url, { method: "PUT", headers: { "Content-Type": "text/csv" }, body: csv });
  if (!uploadResponse.ok) throw new Error(`CSV upload failed with status ${uploadResponse.status}`);
  const download = await infrai.storage.object.presign(BUCKET, key, { op: "get", expires_seconds: 600, response_disposition: `attachment; filename="${request.courseId}-subscribers.csv"` });
  return { key, csv, uploadUrl: upload.url, downloadUrl: download.url, rows: request.subscriberIds.length };
}
