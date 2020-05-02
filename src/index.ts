import minimist from 'minimist'
import * as fs from 'fs'
import * as util from 'util'
import * as lockfile from '@yarnpkg/lockfile'
import * as semver from 'semver'
import * as packageJson from '../package.json'

let suppressError = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as {
    v?: unknown
    version?: unknown
    suppressError?: unknown
    p?: string
    check?: unknown
  }

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  suppressError = !!argv.suppressError

  const yarnLockPath = argv.p || 'yarn.lock'

  const raw = await readFileAsync(yarnLockPath)
  const json = (lockfile.parse(raw.toString()) as { object: { [name: string]: Result } }).object

  const map = new Map<string, Array<{ version: string, result: Result }>>()
  for (const key in json) {
    const index = key.lastIndexOf('@')
    const packageName = key.substring(0, index)
    const version = key.substring(index + 1)
    let array = map.get(packageName)
    if (!array) {
      array = []
      map.set(packageName, array)
    }
    array.push({
      version,
      result: json[key],
    })
  }

  for (const [key, array] of map.entries()) {
    if (array.length <= 1) {
      continue
    }
    const versions = new Set<Result>()
    for (const item of array) {
      versions.add(item.result)
    }
    if (versions.size <= 1) {
      continue
    }
    const sortedVersion = Array.from(versions).sort((a, b) => semver.compare(b.version, a.version))
    for (const version of sortedVersion) {
      if (array.length === 0) {
        break
      }
      for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i]
        if (item.result === version) {
          array.splice(i, 1)
        } else if (semver.satisfies(version.version, item.version)) {
          array.splice(i, 1)
          json[key + '@' + item.version] = version
        }
      }
    }
  }

  const result = lockfile.stringify(json)
  if (argv.check) {
    console.info(result)
  } else {
    await writeFileAsync(yarnLockPath, result)
  }
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

interface Result {
  version: string
  resolved: string
  dependencies: unknown[]
}
