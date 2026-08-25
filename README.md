# Knowing Word

Knowing Word is a course-first Chinese character learning experience. It keeps
the learning rhythm of a planned Chinese course: start from a lesson’s word
list, understand one character, complete its ordered mini-quiz, then revisit
the same characters through three focused practice routes.

![Knowing Word social card](public/og-cover.jpg)

## What is included

- The complete current 26-lesson Grade 5 volume 1 course map, including six
  skimming lessons and an original three-step comprehension path for every text
- 365 official lesson-character records (359 unique glyphs), plus 65 optional
  context extensions; all 430 records carry role-aware components and real
  recognition, phonology, semantics, generation, discrimination, and context tasks
- Explicit curriculum roles for 200 recognition targets, 16 polyphonic targets,
  and 220 writing targets; all polyphonic targets include in-context reading checks
- Four aligned learning routes: word-list mini quizzes, character assembly,
  radical-color recognition, and spatial-structure recognition
- A component studio that ranks the generated components by course appearance
- A Profile v5 learning model that separates first-completion achievements from
  six current mastery dimensions, due dates, independent streaks, lapses, cue
  levels, latency, and diagnosed error types; writing self-check is reported
  separately from objectively scored character reconstruction
- An old-before-new daily plan (up to 10 due characters and 5 new characters),
  adaptive 5-minute/1/3/7/14/30-day review, slow-response caps, targeted
  remediation, and one best retrieval task per due dimension
- Real, shareable URLs for all 2,007 active learning and practice routes
- D1-backed cross-device profiles, daily activity, answer events, and
  route-specific resume state, with local-first offline fallback; answer
  history uses eight CAS-protected rows to stay below D1's per-row limit
- Pronunciation, guided then concealed browser handwriting with explicit
  component/position/stroke self-check, R2-backed read-aloud recording that
  requires complete replay and accuracy assessment, and responsive day/night modes
- 385 localized teaching resources: 274 historical glyph stages, 58 red-blue
  character diagrams, and 53 pronunciation recordings
- 359 responsive picture-embedded official character visuals, 26 original
  lesson scenes, the original deep-dive illustration set, six supplemental
  scenes, and a new social sharing card
- One approved “封” reference voice cloned with Qwen3-TTS 1.7B Base 4-bit
  across all 423 unique character narrations, with punctuated transcripts,
  forced-alignment timing, and a human-listening release gate

The application uses its own visual language and a fully authored mnemonic
system: natural objects carry the component geometry instead of placing large
glyphs over pictures. Source teaching resources that are needed for factual
accuracy are localized under `public/heritage`, so no temporary signed URL is
required at runtime.

See [the course-flow alignment notes](docs/course-flow-alignment.md) for the
implemented learning sequence and each route's completion rule.
See [the illustration system](docs/illustration-system.md) for the source-page
visual audit, asset coverage, and art direction.
See [the architecture guide](docs/architecture.md) for runtime boundaries,
generated-data rules, persistence, and production invariants.

## Run locally

    npm install
    npm run generate:grade5
    npm run dev

Then visit the local URL printed by the development server.

## Quality checks

    npm run check
    npm test
    npm run check:bundle

The test command builds the app, server-renders all 2,007 active routes, checks
resume/completion regressions, validates every illustration and historical
resource, verifies all 423 narration timelines, and confirms that the public
catalog contains no credentials, textbook scans, or signed media links.
The bundle check enforces a 450 KB ceiling per client chunk and rejects any
return of the former all-routes client engine.

## Privacy and content boundaries

This public project intentionally excludes all user account data, credentials,
enrollment information, and original signed asset URLs. Workspace identity is
provided by the host; otherwise the app creates an anonymous, HttpOnly device
identity. Progress is persisted to D1 and mirrored to localStorage for offline
recovery. Read-aloud recordings are private per identity in R2 and are removed
with a full learning-record reset.

Before using the course material in a commercial or public production setting,
confirm that you hold the necessary curriculum and content rights.
