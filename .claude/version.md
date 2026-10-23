# Release notes for keyframes

- **verify is null on purpose.** The checkride scaffold excludes `CHANGELOG.md` from both
  markdownlint and cspell, so no narrow check covers a release diff (version string and
  changelog prose). The full `pnpm check` gate already runs at the end of every agent turn.
- **Each release is tagged and the tag is pushed.** The remote is
  `github.com/robmclarty/keyframes`, and `/version` creates an annotated `vX.Y.Z` tag and
  pushes it. `confirm` stays false because nothing runs on a tag yet. The branch isn't pushed
  by `/version`, so push `main` by hand after a release.
- **npm publishing is by hand, after `/version`.** Nothing publishes on a tag push, so
  `confirm` stays false. Once the release commit and tag exist, run `npm pack --dry-run` to
  read the file list (only `bin/`, `dist/`, `schema/`, `LICENSE`, `README.md` and
  `package.json`), then `npm publish` from a logged-in account. The `prepack` script deletes
  `dist/` and rebuilds it with `tsc --build --force`, since a plain `tsc --build` trusts the
  root `tsconfig.tsbuildinfo` and emits nothing into an empty `dist/`, and `publishConfig`
  makes the scoped package public. Then run `npx @robmclarty/keyframes@<version> --version`
  from an empty directory and check that it prints the new version.
- **When npm publishing moves to CI** (e.g. a publish on tag), set `publish.confirm` to true,
  because a tag push will then publish, and record the CI gate here.
