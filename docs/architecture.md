# Knowing Word architecture

## Design target

Knowing Word is organized around one rule: a route may load only the curriculum
and interaction code needed for the task shown on that route. Navigation is made
of real App Router pages; there is no catch-all route and no client-side screen
switchboard.

## Runtime boundaries

- `app/**/page.tsx` validates URL parameters and loads bounded server data.
- `app/features/*` owns route-level interaction. Character study, practice,
  catalog maps, records, components, account/tools, and the shared shell are
  independent client entries.
- `app/domain/*` contains framework-independent learning rules and validation.
- `app/application/*` coordinates platform-neutral profile, recording, and
  event-delivery workflows through explicit interfaces.
- `app/platform/contracts.ts` defines those interfaces; `app/platform/web/*`
  is the browser implementation. A future client supplies its own storage,
  network, connectivity, and recording adapters without changing learning rules.
- `app/infrastructure/browser/*` contains browser delivery concerns such as the
  browser singleton wiring, feedback sounds, haptics, and speech support.
- `app/lib/*` contains small shared models, routing, identity, and request-scoped
  runtime binding access.
- `app/server/services/*` owns persistence operations and media transactions;
  API route files validate HTTP input and translate service results to responses.
- `worker/index.ts` owns Cloudflare delivery concerns: immutable assets, image
  optimization, narration byte ranges, and the request boundary around Vinext.

The Worker passes D1 and R2 through `AsyncLocalStorage`. The storage instance is
registered with `Symbol.for` so Vinext's separate server module instances share
one request scope without sharing one request's bindings with another request.

## Curriculum data

`app/data/grade5-volume1-source.ts` and the authored extension files are the
source of truth. `npm run generate:grade5` produces:

- one module for course and lesson metadata;
- one bounded character module per lesson;
- dynamic lesson loaders;
- one bounded media/view-model module per lesson;
- lightweight route and home indexes;
- the official component index and visual/narration metadata.

Runtime lesson pages call `loadLessonContent(lessonId)`. They do not import the
all-character compatibility catalog. Official characters and authored extension
characters remain separate until that one lesson is assembled. Extension
characters and extension components also live in separate modules so the
component studio cannot pull the full extension curriculum into its client
chunk.

The generator also emits the extension learning overlay. The strict content
validator and runtime tests both require every one of the 430 records to expose
all six skill dimensions; metadata that cannot be reached through
`getPracticeSteps` fails verification.

Generated modules carry a “do not edit” header. Change the source or generator,
regenerate, then run the full verification suite.

## Learning state and delivery

Profile v5 keeps permanent route achievements separate from sparse per-character
memory. Each touched dimension stores status, due time, interval, lapse count,
correct streak, independent streak, and the latest independent evidence. The
server's D1 profile is authoritative. `useStudyProfile` uses localStorage as an
immediate offline cache, reconciles disjoint achievements and latest evidence
with the server response, serializes writes through one queue, and retries when
connectivity returns. The API returns the stored merged profile so the client
does not claim synchronization while still displaying an older snapshot.
Mutable preferences use per-field timestamps, while D1 profile writes use a
revision compare-and-swap loop; two devices racing from the same base are
re-read and merged instead of silently overwriting disjoint evidence. Each
browser page realm has an in-memory answer-counter actor, so even a duplicated
tab cannot inherit and increment the same CRDT counter. Answer history is deterministically split
across eight `profile_answer_shards` rows; `study_profiles` stores the v5 base
with `answers: {}`. GET reconstructs both and PUT also absorbs legacy answers
still present in the base row. Every base or shard row is held below 1.8 MB,
leaving headroom under D1's 2,000,000-byte row limit, while the reconstructed
request may be at most 8 MB. The capacity fixture covers all current 430
characters, 5,537 generated answers, six memory dimensions, and four actors.

The review scheduler is deterministic and receives the attempt timestamp as an
injected clock. A confirmed error is due in five minutes; independent successes
advance through 1, 3, 7, 14, and 30 days. Slow correct responses are capped at
one day, and diagnosed errors schedule both the observed and target dimensions
before switching to a different corrective activity. Prompted answers and
unverified handwriting self-checks cannot create stable mastery. Daily planning persists
introduced/reviewed ids so its 10-old/5-new allowance cannot refill while a
session is in progress.

Answer, skip, and read events use client-generated UUIDs. The browser outbox
persists events before delivery, removes only the acknowledged UUID, and is safe
when another action or browser tab appends an event during a request. D1 uses the
UUID as the idempotency key. Daily totals live only in the authoritative profile;
the event table remains an idempotent audit trail rather than a second aggregate.

Read-aloud recordings are private per workspace or anonymous device identity.
The API accepts only known lesson ids and supported browser audio types, caps
payload size, hashes the owner path, and removes the new R2 object if its D1
metadata transaction fails. A full reset removes R2 objects before deleting D1
metadata.

Built-in narration is not uploaded through the user-recording API. The release
script reads approved files from `release/narration`, writes them directly to
the versioned R2 namespace, and never copies them into the application static
directory. The Worker serves that namespace with immutable caching and byte
range support; a missing formal v3 object fails closed. If a curriculum word is
corrected after an audio release, that record's old audio is withheld and the
current reviewed text uses browser speech until replacement audio passes the
normal human-listening release gate.

## Production invariants

`npm run verify` runs lint, strict type checking, Vinext compatibility checks, a
production build, and the test suite. The tests render every public learning URL
and verify curriculum counts, content assets, narration gates, persistence
semantics, request isolation, and routing behavior.

`npm run check:bundle` adds delivery budgets:

- no client JavaScript chunk may exceed 450 KB raw;
- total client JavaScript may not exceed 1.8 MB raw;
- a stylesheet may not exceed 180 KB raw;
- an `experience-*` all-routes bundle is forbidden.

Publishing must use the Sites project described by `.openai/hosting.json`, with
the `DB` D1 binding and `MEDIA` R2 binding. Database migrations live under
`drizzle/`, including learning-event evidence columns and profile revisions;
approved narration is uploaded with `npm run preseed:narration` and
verified after deployment with `npm run warm:narration -- <site-url>`. Missing
immutable narration objects are mirrored from the pinned public release commit
into the Site's `MEDIA` R2 binding on first access, so deployment archives stay
small while both WebM and mini-program M4A playback remain Site-hosted.
