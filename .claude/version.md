# Release notes for keyframes

- **verify is null on purpose.** The checkride scaffold excludes `CHANGELOG.md` from both
  markdownlint and cspell, so no narrow check covers a release diff (version string and
  changelog prose). The full `pnpm check` gate already runs at the end of every agent turn, and
  again in the publish workflow before anything reaches npm.
- **A pushed tag publishes, so `confirm` is true.** `/version` creates an annotated `vX.Y.Z` tag
  and pushes it to `github.com/robmclarty/keyframes`. That starts two workflows:
  - `publish.yaml`: its `build` job runs `pnpm check` and `npm pack` with no way to publish. Its
    `publish` job then waits at the `npm-publish` environment for Rob's approval, and publishes
    the packed tarball through npm trusted publishing, with provenance.
  - `release.yaml`: turns the version's CHANGELOG section into a GitHub Release.
- **The branch isn't pushed by `/version`,** so push `main` by hand after a release. A workflow
  runs for a tag only once it's on `main`, so when a release adds or renames one, push `main`
  before the tag.
- **After approving,** run `npx @robmclarty/keyframes@<version> --version` from an empty
  directory and check that it prints the new version.
- **If the publish job fails,** fix the cause and use Run workflow on the Publish workflow, from
  the tag; an already-published version is skipped. npm's trusted publisher for this package
  allows publish but not dist-tag changes, so a dist-tag error points there. v0.3.0, the first
  version on npm, was published by hand, so it carries no provenance.
