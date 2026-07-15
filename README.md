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
- Pronunciation, browser-only handwriting, local read-aloud recording, and
  responsive day/night modes
- 86 original generated illustrations: a unique scene for all 76 catalog
  characters, six supplemental semantic scenes, all three lessons, and the home
  learning journey

The application deliberately uses its own visual language and generated
illustration rather than copying the original site's artwork.

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

The test command builds the app, checks the rendered page, and verifies that
the public course catalog does not contain account data or signed media links.

## Privacy and content boundaries

This public project intentionally excludes all user account data, credentials,
enrollment information, original signed asset URLs, and original media files.
Learning progress is stored only in the visitor's browser via localStorage.

Before using the course material in a commercial or public production setting,
confirm that you hold the necessary curriculum and content rights.
