# Demo

Terminal demo for the GigOps README.

## Quick Preview

```bash
bash demo/mock-output.sh
```

## Generate GIF

Requires [VHS](https://github.com/charmbracelet/vhs):

```bash
brew install vhs    # or: go install github.com/charmbracelet/vhs@latest
vhs demo/demo.tape
```

This produces `demo/gigops-demo.gif`. Reference it in the README:

```markdown
![GigOps Demo](demo/gigops-demo.gif)
```

## Files

| File | Purpose |
|------|---------|
| `mock-output.sh` | Shell script that simulates CLI output with ANSI colors and typing effect |
| `demo.tape` | VHS recording script that runs mock-output.sh and captures to GIF |
| `README.md` | This file |

## Customizing

Edit `mock-output.sh` to change the simulated output. The script uses `sleep` for pacing and a `type_cmd` helper for the typing effect. Adjust `pause` durations to change timing.
