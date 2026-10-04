# Release notes for keyframes

- **verify is null on purpose.** The checkride scaffold excludes `CHANGELOG.md` from both
  markdownlint and cspell, so no narrow check covers a release diff (version string and
  changelog prose). The full `pnpm check` gate already runs at the end of every agent turn.
- **No pushes yet.** The repo has no remote. When npm publishing of `@robmclarty/keyframes`
  is wired up (e.g. a CI publish on tag), set `marker.tag`, `publish.pushTag` and
  `publish.confirm` to true, and record the CI gate here.
