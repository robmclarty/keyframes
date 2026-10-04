# Release notes for keyframes

- **verify is null on purpose.** The checkride scaffold excludes `CHANGELOG.md` from both
  markdownlint and cspell, so no narrow check covers a release diff (version string and
  changelog prose). The full `pnpm check` gate already runs at the end of every agent turn.
- **Each release is tagged and the tag is pushed.** The remote is
  `github.com/robmclarty/keyframes`, and `/version` creates an annotated `vX.Y.Z` tag and
  pushes it. `confirm` stays false because nothing runs on a tag yet. The branch isn't pushed
  by `/version`, so push `main` by hand after a release.
- **When npm publishing of `@robmclarty/keyframes` is wired up** (e.g. a CI publish on tag),
  set `publish.confirm` to true, because a tag push will then publish, and record the CI gate
  here.
