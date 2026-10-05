import assert from "node:assert/strict";
import { ExportRequest } from "./export_download_service.ts";

const parsed = ExportRequest.safeParse({ courseId: "math-101", subscriberIds: ["learner-7"], requestedBy: "teacher@example.com" });
assert.equal(parsed.success, true);
const rejected = ExportRequest.safeParse({ courseId: "", subscriberIds: [], requestedBy: "not-an-email" });
assert.equal(rejected.success, false);
console.log("request boundary test passed");
