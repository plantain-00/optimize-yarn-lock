import minimist from 'minimist'
import * as packageJson from '../package.json'
import { optimize } from './core'

let suppressError = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   optimize-yarn-lock [options]
Examples: optimize-yarn-lock
          optimize-yarn-lock -p demo
Options:
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
 -p                                                 yarn.lock dir path
 -check                                             Only check
`)
}

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as {
    v?: unknown
    version?: unknown
    suppressError?: unknown
    p?: string
    check?: boolean
    h?: unknown
    help?: unknown
  }

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    process.exit(0)
  }

  if (argv.h || argv.help) {
    showHelp()
    process.exit(0)
  }

  suppressError = !!argv.suppressError

  await optimize({
    yarnLockPath: argv.p,
    check: argv.check,
  })
}

executeCommandLine().then(() => {
  console.log(`optimize-yarn-lock success.`)
}, (error: unknown) => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  if (!suppressError) {
    process.exit(1)
  }
})
