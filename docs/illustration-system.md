# Illustration system

The original course capture contains 210 authenticated-page screenshots. Its
visual teaching pattern is concentrated in four places:

1. a playful course landscape and module mascots on the home page;
2. one mnemonic scene on each image-supported character study page;
3. two three-option picture questions for each core character;
4. diagrammatic red/blue, assembly, and spatial-structure exercises.

The last group is represented by interactive HTML and CSS plus the factual
red-blue diagram from the teaching package. The rebuilt app uses newly
generated artwork for semantic scenes and localized, unsigned copies of the
historical teaching resources required for accurate instruction.

## Generated asset set

- 76 character meaning illustrations, one for every unique character in the
  public course catalog; every character-study page therefore has its own scene
- 3 lesson scenes: `桂花雨`, `落花生`, and `冀中的地道战`
- 1 home learning scene with an original blue-and-gold magpie guide
- 6 additional reusable semantic distractor illustrations

This produces 86 optimized assets in total. For the 37 characters that include
picture questions, the same canonical meaning illustration is used on the
study page and as the correct answer in both questions. Distractors are chosen
deterministically from other character meanings, and their captions follow the
image being shown. This keeps every option semantically truthful while making
the question set stable across visits.

## Art direction

All images use an original contemporary children's-book language: tactile
gouache, layered paper-collage depth, warm cream grounds, jade, coral, saffron,
lapis, and deep navy. Scenes have one clear focal action, generous crop safety,
and no embedded words, characters, logos, or watermarks. Potentially sensitive
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
