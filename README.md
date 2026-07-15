# Knowing Word

Knowing Word is a course-first Chinese character learning experience. It keeps
the learning rhythm of a planned Chinese course: start from a lesson’s word
list, understand one character, complete its ordered mini-quiz, then revisit
the same characters through three focused practice routes.

![Knowing Word social card](public/og.png)

## What is included

- A course map for three Grade 5 Chinese lessons and their word lists
- 80 character entries and 416 ordered practice prompts
- Four aligned learning routes: word-list mini quizzes, character assembly,
  radical-color recognition, and spatial-structure recognition
- A component studio that ranks 79 components by their course appearance
- Per-question attempts, last-answer status, character-level completion, and
  resume points for each route
- Real, shareable URLs for all 210 authenticated source-page routes
- D1-backed cross-device profiles, daily activity, answer events, and
  route-specific resume state, with local-first offline fallback
- Pronunciation, browser-only handwriting, R2-backed read-aloud recording, and
  responsive day/night modes
- 385 localized teaching resources: 274 historical glyph stages, 58 red-blue
  character diagrams, and 53 pronunciation recordings
- 162 original generated illustrations: 76 object-shaped character mnemonics,
  76 semantic reference scenes, six supplemental scenes, all three lessons,
  and the home learning journey

The application uses its own visual language and a fully authored mnemonic
system: natural objects carry the component geometry instead of placing large
glyphs over pictures. Source teaching resources that are needed for factual
accuracy are localized under `public/heritage`, so no temporary signed URL is
required at runtime.

See [the course-flow alignment notes](docs/course-flow-alignment.md) for the
implemented learning sequence and each route's completion rule.
See [the illustration system](docs/illustration-system.md) for the source-page
visual audit, asset coverage, and art direction.

## Run locally

    npm install
    npm run dev

Then visit the local URL printed by the development server.

## Quality checks

    npm run lint
    npm test

The test command builds the app, server-renders all 210 source routes, checks
resume/completion regressions, validates every illustration and historical
resource, and verifies that the public catalog contains no credentials or
signed media links.

## Privacy and content boundaries

This public project intentionally excludes all user account data, credentials,
enrollment information, and original signed asset URLs. Workspace identity is
provided by the host; otherwise the app creates an anonymous, HttpOnly device
identity. Progress is persisted to D1 and mirrored to localStorage for offline
recovery. Read-aloud recordings are private per identity in R2 and are removed
with a full learning-record reset.

Before using the course material in a commercial or public production setting,
confirm that you hold the necessary curriculum and content rights.
