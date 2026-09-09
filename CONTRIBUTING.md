# Contributing

Thanks for helping with the SACCO project. This is a small, pragmatic guide.

## Getting set up

1. Clone the repo and start the stack (see the README "Quick start").
2. Never commit your `.env` file.

## Branch workflow

- Create a feature branch off `main`:
  ```bash
  git checkout -b my-feature-name
  ```
- Keep changes small and focused on one task per branch.
- Push the branch and open a pull request against `main`.
- Merge the PR on GitHub once it is reviewed and checks pass.

## Commit style

One logical change per commit, with a short prefix:

- `feat:` — new functionality
- `fix:` — a bug fix
- `infra:` — build, Docker, CI, config
- `docs:` — documentation

Examples:

```bash
git add api/src/...
git commit -m "fix: seed saving types on fresh databases"
git commit -m "docs: explain the gateway ports in README"
```

## Code conventions

- API (Java/Spring): follow the existing package layout
  (`com.example.ngrxcrud.api`); no comments unless they explain a non-obvious
  design decision.
- Web (Angular/Nx): keep components under `web/`, reuse the shared libs under
  `libs/`, and follow the existing component patterns.
- Prefer environment variables with sane defaults over hard-coded values.

## Building and testing

- API:
  ```bash
  docker compose build api
  ```
- Web:
  ```bash
  npm install
  npx nx build ngrx-crud --configuration development --base-href=/sacco/
  ```
- The `main` branch must always build and boot cleanly.

## Before opening a PR

- [ ] `docker compose build api` succeeds
- [ ] `docker compose up` boots with a clean (empty) volume
- [ ] Login works with the seeded admin user
- [ ] The diff contains no secrets and no `.env`

## Not yet available

- Automated CI checks: a GitHub Actions workflow is planned. Until then, the
  manual checks above are the gate for merging.