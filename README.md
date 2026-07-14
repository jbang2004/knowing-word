# Knowing Word

Knowing Word is a story-first Chinese character learning experience. It turns a
course of characters into a calm, playful study space: learn a character's
structure and original meaning, trace its components, practise with feedback,
and keep a private progress trail on the device.

![Knowing Word social card](public/og.png)

## What is included

- 80 character learning cards across three Grade 5 Chinese lessons
- 416 interactive prompts covering word meaning, structure, components, and
  writing practice
- A browsable catalog of 79 Chinese character components
- Character search, lesson filters, favorites, pronunciation playback, and
  focused practice rounds
- A browser-only handwriting pad and device-local learning history
- Responsive UI with day/night reading modes

The application deliberately uses its own visual language and generated
illustration rather than copying the original site's artwork.

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
