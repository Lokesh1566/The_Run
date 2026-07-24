# The Run

A daily job search ledger. Six reps a day, a 30 day streak tape, and an application pipeline that flags anything going stale.

No build step, no dependencies, no backend. Plain HTML, CSS, and ES modules.

## Running it

Because the JavaScript uses ES modules, opening `index.html` straight off the disk will fail on CORS. Serve it instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this folder to a repo.
2. Settings, then Pages.
3. Source: deploy from branch, `main`, folder `/ (root)`.
4. Live at `https://<username>.github.io/<repo>` in about a minute.

## Structure

```
.
├── index.html          markup only, no inline styles or scripts
├── css/
│   ├── base.css        design tokens, reset, shared form and button styles
│   └── app.css         layout and components
└── js/
    ├── config.js       the routine definition, edit this to change goals
    ├── store.js        persistence and date helpers
    ├── routine.js      daily reps, progress bar, streak tape
    ├── pipeline.js     application table and weekly stats
    └── app.js          entry point, header metrics, backup import and export
```

## Changing the routine

Everything reads from `js/config.js`. To go from 10 applications a day to 7, change one number:

```js
{ id: 'apply', label: 'Applications sent', type: 'count', goal: 7, note: '...' }
```

Tasks are either `count` (a target with plus and minus buttons) or `check` (a single tick). Adding a new task to the array is enough, storage picks it up on the next render.

Other knobs in the same file:

- `STALE_AFTER_DAYS` how long an application sits on Applied before it gets flagged
- `STREAK_THRESHOLD` how many of the six reps a day needs to count toward the streak
- `TAPE_LENGTH` how many days the tape shows

## How the data works

Everything lives in `localStorage` under the key `run.v1`. That means:

- It is private to one browser on one device. Nothing is uploaded anywhere.
- It does not sync between your laptop and your phone.
- Clearing site data wipes it.

Use Export backup on Fridays and keep the JSON somewhere safe. Import backup restores it, including on a different machine.

## Reading the tape

Each bar is one day, oldest on the left.

- light gray, nothing logged
- mid gray, some reps done
- black, all six done
- blue, today

## License

MIT
