#!/usr/bin/env node
import meow from 'meow'

import { run } from './runner'

const cli = meow(
  `
    Deletes package components, which are not included in given opts
    Usage:
      Basic:
        @qiwi/nexus-cli --nexus.username=foo --nexus.password=bar --nexus.url=baz --package.repo=npm --package.name=bat --package.group=quz --package.versions=1.0.0 --package.versions=1.0.1
      With config file: 
        @qiwi/nexus-cli --config=some/path/config.json
      With config file and overriding
        @qiwi/nexus-cli --config=some/path/config.json --package.repo=npm --package.name=bat --package.group=quz --package.versions=1.0.0 --package.versions=1.0.1
    Options:
      --nexus.username,
      --nexus.password - Nexus API credentials;
      --nexus.url - Nexus API URL;
      --nexus.limit - Nexus Components API limits for deleteComponent, see more details in push-it-to-the-limit (https://github.com/antongolub/push-it-to-the-limit#ratelimit)
      --package.repo - name of package repository;
      --package.name - package name (thanks, cap!);
      --package.group - package group;
      --package.range - package versions range to be deleted;
      --config - path to config file;
      --yes - delete components without confirmation.
  `,
  {
    flags: {
      nexus: {
        type: 'string',
        isRequired: (flags) => !flags.config,
        isMultiple: true,
      },
      package: {
        type: 'string',
        isRequired: (flags) => !flags.config,
        isMultiple: true,
      },
      config: {
        type: 'string'
      },
      yes: {
        type: 'boolean'
      }
    }
  }
)

run(cli.flags as any)
  .then(() => process.exit(0))
