import { copy, ensureDir, readdir, writeFile } from 'fs-extra'
import { basename, join } from 'path'
import minimist from 'minimist'
import chalk from 'chalk'
import { execSync } from 'child_process'
import install from './install'

const argv = minimist(process.argv.slice(2))

const shouldUseYarn = (): boolean => {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

const verifyNodeVersion = () => {
  const currentNodeVersion = process.versions.node
  const semver = currentNodeVersion.split('.')
  const requiredVersion = parseInt(
    require(join(__dirname, '../package.json'))
      .engines.node.split('.')[0]
      .replace(/^(~|\^)/, ''),
    10
  )
  const installedMajor = parseInt(semver[0], 10)

  if (installedMajor < requiredVersion) {
    throw new Error(
      'You are running Node ' +
        currentNodeVersion +
        '.\n' +
        `Wilson requires Node ${requiredVersion} or higher. \n` +
        'Please update your version of Node.'
    )
  }
}

async function cli() {
  verifyNodeVersion()

  const targetDir = argv._[0] || '.'
  const cwd = process.cwd()
  const root = join(cwd, targetDir)
  console.info(`Creating a new Wilson site in ${chalk.green(root)}.`)

  await ensureDir(root)
  const existing = await readdir(root)
  if (existing.length) {
    console.error(`Error: target directory is not empty.`)
    process.exit(1)
  }

  const renameFiles: Record<string, string> = {
    _gitignore: '.gitignore',
  }
  const write = async (file: string, content?: string) => {
    const targetPath = renameFiles[file]
      ? join(root, renameFiles[file])
      : join(root, file)
    if (content) {
      await writeFile(targetPath, content)
    } else {
      await copy(join(templateDir, file), targetPath)
    }
  }

  // copy over files
  const templateDir = join(__dirname, '../template/preact')
  const files = await readdir(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    await write(file)
  }

  // write package.json with adjusted `name` property
  const pkg = require(join(templateDir, `package.json`))
  pkg.name = basename(root)
  await write('package.json', JSON.stringify(pkg, null, 2))

  const useYarn = shouldUseYarn()

  console.info(``)
  console.info(`Installing dependencies using ${useYarn ? 'yarn' : 'npm'}...`)
  console.info(``)

  await install(root, useYarn)
  const runCommand = useYarn ? 'yarn' : 'npm run'

  console.info(``)
  console.info(`Success!`)
  console.info(`Created a new Wilson site at ${chalk.green(root)}.`)
  console.info(`Inside that directory, you can run several commands`)
  console.info(``)
  console.info(`  ${chalk.cyan(`${runCommand} start`)}`)
  console.info(`    Starts the development server.`)
  console.info(``)
  console.info(`  ${chalk.cyan(`${runCommand} build`)}`)
  console.info(`    Bundles the site into static files for production.`)
  console.info(``)
  console.info(`  ${chalk.cyan(`${runCommand} serve`)}`)
  console.info(`    Serves the production-ready site on localhost.`)
  console.info(``)
  console.info(`We suggest that you begin by typing:`)
  console.info(``)
  console.info(`    ${chalk.cyan('cd')} ${targetDir}`)
  console.info(`    ${chalk.cyan(`${runCommand} start`)}`)
}

cli().catch((e) => {
  console.error(e)
  process.exit(1)
})
