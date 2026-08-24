# Release-only assets

`narration/` contains the approved Qwen3 audio and timing files used by the
formal narration release workflow. These files are never served from the
application's static asset directory.

`npm run preseed:narration` publishes this directory to the versioned R2
namespace. `stage-qwen3-narration-release.mjs` produces the same directory
layout after the ASR, alignment, and human-listening gates pass.
