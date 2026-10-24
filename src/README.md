# Source layout

`app/index.html` is built from the files in this folder. Edit these files, then run

```
python3 tools/build.py            # writes app/index.html
python3 tools/build.py --engine   # also writes app/gd_test.html (the Game Day engine alone, for tests)
python3 tools/build.py --check    # fails if app/index.html is out of date
```

Deploying is unchanged: upload `app/index.html` and `sw.js` (bump `VERSION` in both `sw.js` files).

`manifest.txt` lists the files in build order. The build simply joins them, so everything in `app/`
is still one script with one shared scope, and everything in `engine/game/` is another.

| Folder | What is in it |
| --- | --- |
| `shell/` | The page around everything: `<head>`, the HTML of every screen, and the closing tags |
| `styles/` | The stylesheet, one file per layer, applied in order (later files win) |
| `app/` | The management game: careers, schedules, recruiting, pages, Team Builder, online play. Numbered in build order; `data-*.js` files are large tables (state maps, glyph outlines) |
| `engine/shell/` | The Game Day page that runs inside its own frame |
| `engine/sprites/` | The sprite library and the sprite sheets (`01-data-sheets.js`, base64 images) |
| `engine/game/` | The Game Day engine: setup, AI, physics, drawing, replays, controls, main loop |

Engine files sit inside a `<script type="text/x-gameday">` holder, so a closing tag has to be
written escaped: `<\/div>`, `<\/script>`. The build does not change file contents.
