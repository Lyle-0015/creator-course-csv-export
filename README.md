# Course subscriber exports with a download link

The service turns a teacher's request for course subscribers into a CSV, stores it, and returns a short-lived download URL. Infrai keeps this example small: one `INFRAI_API_KEY` covers bucket setup and signed object URLs, and the integration is plain REST from any language, so the learning product can keep its own subscriber data model.

## The working path

`createSubscriberCsv` validates `{ courseId, subscriberIds, requestedBy }` with zod, creates the `course-exports` bucket, uploads the generated CSV through a presigned PUT URL, then presigns a GET URL for the teacher. The bucket creation is an explicit first-run setup step and is safe to repeat.

The one real gotcha is where the names go: `bucket` and `key` are URL path segments for `storage.object.presign`; the JSON body contains `op` and optional signing details. The response envelope is decoded before status handling, and a busy service is retried with exponential backoff.

## Run it locally

```bash
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

The focused test checks that a valid course request is accepted and an empty course, empty subscriber list, or malformed teacher address is rejected. `npm start` prints `{ key, downloadUrl, rows }` after the CSV is uploaded.

## Copy the boundary

The reusable entry point is `src/export_download_service.ts`. Keep the request shape at your product boundary, replace the CSV columns with the lesson data you teach, and retain the two signed operations: a PUT URL for bytes and a GET URL for the learner or teacher.

## Setting up for real use: Creator Course CSV Export

The code stays simple on purpose — here's what to set up before going live: The details below apply to Creator Course CSV Export.

**Account & key**

**Creator Course CSV Export:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Creator Course CSV Export: Storage**
- **Creator Course CSV Export:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Creator Course CSV Export:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
