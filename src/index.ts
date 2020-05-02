import minimist from 'minimist'
import * as packageJson from '../package.json'
import { optimize } from './core'

let suppressError = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as {
    v?: unknown
    version?: unknown
    suppressError?: unknown
    p?: string
    check?: boolean
  }

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
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
