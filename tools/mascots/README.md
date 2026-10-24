# Mascot art library

Team logos can use a realistic mascot illustration instead of the drawn vector art. Each image is made once
per mascot (about 300 subjects in `subjects.json`, covering every mascot name the game uses), in grayscale,
and the game tints it with each school's own colors and adds the band and ink outline. So every school still
gets its own 1-of-1 logo from its letters, colors and layout, while sharing the mascot drawing.

Until images exist, `src/app/003b-data-mascot-images.js` is empty and logos use the vector art.

## Make the images

1. Add a Gemini API key to the cloud environment (environment settings, Edit) as the variable
   `SKILL_IMAGE_GEN_GEMINI_KEY`, then start a new session. Never paste the key into a chat or commit it.
2. Generate, clean up and pack:

```
python3 tools/mascots/generate.py gen --jobs 4      # calls Gemini for every subject without a raw image
python3 tools/mascots/generate.py process           # grayscale, background removed, 176 px WebP in src/assets/mascots/
python3 tools/mascots/generate.py sheet /tmp/sheet.png   # look at them; delete a raw PNG and run gen again to redo one
python3 tools/mascots/generate.py pack              # writes src/app/003b-data-mascot-images.js
python3 tools/build.py --engine
```

`gen` skips subjects that already have a raw image, so it can be stopped and started again. Raw images stay in
`tools/mascots/raw/` and are not committed. `--only key1,key2` regenerates chosen subjects, and
`MASCOT_IMAGE_MODEL` picks another Gemini image model.

## Notes

- The prompt asks for an original mascot illustration, never a copy of a real school's or team's logo.
- Images are packed into `index.html`, so deploying is still just `index.html` and `sw.js`. About 300 images at
  roughly 8 to 12 KB each add 3 to 4 MB.
- A school that picked a drawn icon in its editor (logo key) or uploaded its own logo keeps that.
