# Illustration system

The original course capture contains 210 authenticated-page screenshots. Its
visual teaching pattern is concentrated in four places:

1. a playful course landscape and module mascots on the home page;
2. one mnemonic scene on each image-supported character study page;
3. two three-option picture questions for each core character;
4. diagrammatic red/blue, assembly, and spatial-structure exercises.

The last group is represented by interactive HTML and CSS plus the factual
red-blue diagram from the teaching package. The rebuilt app uses two
complementary generated sets: literal semantic scenes for meaning questions
and object-shaped mnemonic scenes for character study. Localized, unsigned
historical resources remain the factual reference layer.

## Generated asset set

- 76 object-shaped mnemonic illustrations, one for every unique character in
  the public catalog; trees, tools, water, architecture, hands, and negative
  space directly carry the component geometry
- 76 character meaning illustrations retained as the literal semantic set
- 3 lesson scenes: `桂花雨`, `落花生`, and `冀中的地道战`
- 1 home learning scene with an original blue-and-gold magpie guide
- 6 additional reusable semantic distractor illustrations

This produces 162 optimized assets in total. The 76 active character visuals
are the object-shaped mnemonic set. For picture questions, the correct image
therefore reinforces both meaning and structure; supplemental distractors are
chosen deterministically and remain semantically truthful.

Each character also has an authored scene script in
`app/data/mnemonic-scenes.ts`. The script names what the whole scene means and
what physical form carries every catalog component. Tests require one script,
one cue per component, and one unique image for every character, preventing a
generic fallback from silently entering the course.

## Art direction

All images use an original contemporary children's-book language: tactile
watercolor and gouache, warm cream grounds, jade, coral, saffron, lapis, and
deep navy. Mnemonic scenes have one clear structural silhouette and no pasted
or printed words, glyph overlays, logos, or watermarks. The learning UI reveals
the native image with warm-red and indigo focus regions, then moves the actual
character equation into the explanation panel. Potentially sensitive
concepts such as `尤`, `民`, `离`, and `战` are intentionally calm,
non-graphic, historically framed, and age appropriate.

Assets are stored as optimized 1024-pixel JPEG files under
`public/illustrations` and loaded responsively through the framework image
component.

## Factual teaching resources

The source package was refreshed through an authorized session during the
import, then stripped of every temporary signed URL. The repository contains
385 stable local files under `public/heritage`: 274 historical-script SVGs, 58
red-blue diagrams, and 53 MP3 pronunciations across 58 character packages. The
reproducible import script accepts credentials only through environment
variables and never writes them to source files.
