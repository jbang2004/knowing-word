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
- `app/infrastructure/browser/*` contains browser delivery concerns such as the
  idempotent event outbox and speech support.
- `app/lib/*` contains small shared models, routing, identity, and request-scoped
  runtime binding access.
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
- lightweight route and home indexes;
- the official component index and visual/narration metadata.

Runtime lesson pages call `loadLessonContent(lessonId)`. They do not import the
all-character compatibility catalog. Official characters and authored extension
characters remain separate until that one lesson is assembled. Extension
characters and extension components also live in separate modules so the
component studio cannot pull the full extension curriculum into its client
chunk.

Generated modules carry a “do not edit” header. Change the source or generator,
regenerate, then run the full verification suite.

## Learning state and delivery

The server's D1 profile is authoritative. `useStudyProfile` uses localStorage as
an immediate offline cache, then replaces it with the server value. Writes are
debounced and retried when connectivity returns.

Answer, skip, and read events use client-generated UUIDs. The browser outbox
persists events before delivery, removes only the acknowledged UUID, and is safe
when another action or browser tab appends an event during a request. D1 uses the
UUID as the idempotency key, so retries do not increment daily totals twice.

Read-aloud recordings are private per workspace or anonymous device identity.
The API accepts only known lesson ids and supported browser audio types, caps
payload size, hashes the owner path, and removes the new R2 object if its D1
metadata transaction fails. A full reset removes R2 objects before deleting D1
metadata.

Built-in narration is not uploaded through the user-recording API. The release
script writes approved audio and timing objects directly to the versioned R2
namespace. The Worker serves that namespace with immutable caching and byte
range support; a missing formal v3 object fails closed.

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
`drizzle/`; approved narration is uploaded with `npm run preseed:narration` and
verified after deployment with `npm run warm:narration -- <site-url>`.
