#!/usr/bin/env node
// The keyframes command. All of its behavior lives in src/cli.ts, which returns
// the exit code; this file only connects it to the process.
import { run } from '../dist/cli.js';

process.exitCode = run(process.argv.slice(2), {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
});
