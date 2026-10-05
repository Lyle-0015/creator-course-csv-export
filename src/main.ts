import { createSubscriberCsv } from "./export_download_service.ts";

const result = await createSubscriberCsv({ courseId: "math-101", subscriberIds: ["learner-7", "learner-8"], requestedBy: "teacher@example.com" });
console.log(JSON.stringify(result, null, 2));
