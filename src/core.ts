import * as fs from 'fs'
import * as util from 'util'
import * as lockfile from '@yarnpkg/lockfile'
import * as semver from 'semver'
import * as url from 'url'

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

interface Options {
  yarnLockPath: string
  check: boolean
}

function optimizeByOrder(
  json: { [name: string]: Result },
  compareFn: (a: Result, b: Result, fixedVersions: Set<string>) => number,
) {
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
    for (const item of array) {
      cleanResolved(item.result)
    }
    if (array.length <= 1) {
      continue
    }
    const versions = new Set<Result>()
    const fixedVersions = new Set<string>()
    for (const item of array) {
      const cleanedVersion = semver.clean(item.version)
      if (cleanedVersion && semver.valid(cleanedVersion)) {
        fixedVersions.add(cleanedVersion)
      }
      versions.add(item.result)
    }
    if (versions.size <= 1) {
      continue
    }
    const sortedVersion = Array.from(versions).sort((a, b) => compareFn(a, b, fixedVersions))
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
}

export async function optimize(options?: Partial<Options>) {
  const yarnLockPath = options?.yarnLockPath || 'yarn.lock'
  const check = options?.check
  
  const raw = await readFileAsync(yarnLockPath)
  const json = (lockfile.parse(raw.toString()) as { object: { [name: string]: Result } }).object

  optimizeByOrder(json, (a, b, fixedVersions) => {
    const aIsFixed = fixedVersions.has(a.version)
    const bIsFixed = fixedVersions.has(b.version)
    if (bIsFixed && !aIsFixed) {
      return 1
    }
    if (aIsFixed && !bIsFixed) {
      return -1
    }
    return semver.compare(b.version, a.version)
  })

  optimizeByOrder(json, (a, b) => semver.compare(b.version, a.version))

  const result = lockfile.stringify(json)
  if (check) {
    console.info(result)
  } else {
    await writeFileAsync(yarnLockPath, result)
  }
}

function cleanResolved(version: Result) {
  const u = url.parse(version.resolved)
  if (u.search) {
    u.search = null
    version.resolved = url.format(u)
  }
}

interface Result {
  version: string
  resolved: string
  dependencies: unknown[]
}
