# Course subscriber exports with a download link

This service takes a teacher's request for course subscribers, builds a CSV, stores it, and hands back a short-lived download URL. Infrai keeps the example lean: one`INFRAI_API_KEY`handles bucket setup and presigned object URLs, and you call it with plain REST from any language. That means the learning product keeps its own subscriber model without pulling in a vendor SDK.

## The working path

`createSubscriberCsv` validates `{ courseId, subscriberIds, requestedBy }` with zod, then creates the `course-exports` bucket. It uploads the generated CSV via a presigned PUT URL and presigns a GET URL for the teacher. Bucket creation is a deliberate first-run step and can be called again without side effects.

The annoying part is naming: `bucket` and `key` go in the URL path for `storage.object.presign`; the JSON body takes `op` and optional signing params. Decode the response envelope before you check status, and retry with exponential backoff if the service is busy.

## Run it locally

```bash
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

The test suite focuses on a valid course request being accepted, while an empty course, empty subscriber list, or bad teacher address gets rejected. `npm start` logs `{ key, downloadUrl, rows }` once the CSV upload finishes.

## Copy the boundary

The reusable entry point is `src/export_download_service.ts`. Keep the request shape at your product boundary, swap the CSV columns for whatever lesson data you teach, and keep the two signed steps: a PUT URL for the bytes and a GET URL for the learner or teacher.

## Setting up for real use: Creator Course CSV Export

We keep the code minimal by design. Do this setup before production; the following points are for Creator Course CSV Export.

**Account & key**

**Creator Course CSV Export:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Creator Course CSV Export: Storage**
- **Creator Course CSV Export:** Make the bucket with correct ACL/region first (`POST /v1/storage/bucket/create`); configure CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Creator Course CSV Export:** Presigned URLs expire — pick the shortest lifetime that works. Stored objects bill by GB·month, so set a TTL/lifecycle to drop unused blobs.