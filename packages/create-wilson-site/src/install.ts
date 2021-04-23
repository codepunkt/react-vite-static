import spawn from 'cross-spawn'

const install = (root: string, useYarn: boolean) => {
  return new Promise<void>((resolve, reject) => {
    let command: string
    let args: string[]

    if (useYarn) {
      command = 'yarnpkg'
      args = ['install', '--cwd', root]
    } else {
      command = 'npm'
      args = ['install', '--loglevel', 'error']
    }

    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        })
        return
      }
      resolve()
    })
  })
}

export default install
