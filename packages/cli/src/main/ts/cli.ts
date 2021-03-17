#!/usr/bin/env node
import meow, { Options } from 'meow'

import { runExecutor } from './executor'

const cli = meow(
  `
    Deletes package components, which are not included in given opts
    Usage:
      Basic:
        @qiwi/nexus-cli --auth.username foo --auth.password bar --url baz --data.repo npm --data.name bat --data.group quz --package.range <1.0.0 --action delete
      With config file: 
        @qiwi/nexus-cli --config=some/path/config.json
      With config file and overriding
        @qiwi/nexus-cli --config=some/path/config.json --data.repo=npm --data.name=bat --data.group=quz --data.range <1.0.0
    Options:
      --auth.username,
      --auth.password - Nexus API credentials;
      --url - Nexus API URL;
      --action - 'delete' or 'download';
      --config - path to config file;
      --data.repo - name of package repository;
      --data.name - package name (thanks, cap!);
      --data.group - package group;
      --data.range - package versions range to be deleted / downloaded;
      --data.cwd - current working dir for 'action' === 'download';
      --data.prompt - disable destructive action confirmation for 'action' === 'delete';
      --data.npmBatch.access - make meta output as @qiwi/npm-batch-cli config with blank values & given access (one of 'public' | 'restricted') (for 'action' === 'download')
      --batch.rateLimit - Nexus Components API limits for deleteComponent, see more details in push-it-to-the-limit (https://github.com/antongolub/push-it-to-the-limit#ratelimit)
  `,
  {
    flags: {
      url: {
        type: 'string',
        isRequired: (flags: any) => !flags.config,
      },
      auth: {
        type: 'string',
        isRequired: (flags: any) => !flags.config,
      },
      config: {
        type: 'string'
      },
      action: {
        type: 'string',
        isRequired: (flags: any) => !flags.config,
      },
      batch: {
        type: 'string'
      },
      data: {
        type: 'string',
        isRequired: (flags: any) => !flags.config,
      },
      skipErrors: {
        type: 'boolean'
      }
    }
  } as Options<any>
)

runExecutor(cli.flags as any, cli.flags.config as any)
  .then(() => process.exit(0))
