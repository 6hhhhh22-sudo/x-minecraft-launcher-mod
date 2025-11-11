// gameLaunch.ts
import { ElectronController } from '../ElectronController'
import { LaunchService } from '@xmcl/runtime/launch'
import { ControllerPlugin } from './plugin'
import { UserServiceKey } from '@xmcl/runtime-api'
import crypto from 'crypto'

export const gameLaunch: ControllerPlugin = function (this: ElectronController) {
  this.app.waitEngineReady().then(() => {
    this.app.registry.get(LaunchService).then((service) => {
      this.app.registry.get(UserServiceKey).then((userService) => {
        const originalLaunch = service.launch.bind(service)
        service.launch = async (...args: any[]) => {
          try {
            const userState = userService.getUserState()
            const selectedUserId = userState.selectedUserId || ''
            const currentUser = userState.users[selectedUserId] || {}
            const options = args[0] || {}
            if (!options.extraArgs) options.extraArgs = []

            if (currentUser.authority === 'offline') {
              // UUID spoofing
              const spoofUUID = crypto.createHash('md5')
                .update(currentUser.username + Date.now().toString())
                .digest('hex').slice(0, 32).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')

              // Extra args for cracked servers
              options.extraArgs.push('--online', '--server-type', 'cracked', '-Djava.net.preferIPv4Stack=true', `--uuid-spoof`, spoofUUID)
              const proxyHost = '127.0.0.1'
              const proxyPort = 1080
              options.extraArgs.push('-Dhttp.proxyHost=' + proxyHost, '-Dhttp.proxyPort=' + proxyPort, '-DsocksProxyHost=' + proxyHost, '-DsocksProxyPort=' + proxyPort)
              options.extraArgs.push('--auto-reconnect', 'true', '--anti-logout', 'true')
            }

            const result = await originalLaunch(...args)

            // Auto-reconnect
            const process = service.getProcesses()[0]
            if (process && currentUser.authority === 'offline') {
              process.on('exit', (code) => {
                if (code !== 0) {
                  setTimeout(() => service.launch(...args), 5000)
                }
              })
            }
            return result
          } catch (e) {
            console.warn('[CRACKED ERROR]', e)
          }
          // بعد if (currentUser.authority === 'offline') { ... }
if (options.extraArgs?.includes('--server')) {
  options.extraArgs.push('--auto-reconnect', 'true') // optional
}
        }
      })

      // Window control
      service.on('minecraft-window-ready', ({ hideLauncher }) => {
        if (this.mainWin && (this.mainWin.isVisible() || this.mainWin.isMinimized())) {
          this.mainWin.webContents.send('minecraft-window-ready')
          if (hideLauncher) this.mainWin.hide()
        }
      }).on('minecraft-start', ({ showLog }) => {
        this.parking = service.getProcesses().length > 0
        if (!this.getLoggerWindow() && showLog) this.createMonitorWindow()
      }).on('minecraft-exit', (status) => {
        this.parking = service.getProcesses().length > 0
        if (this.mainWin && !this.mainWin.isVisible()) this.mainWin.show()
        this.app.controller.broadcast('minecraft-exit', status)
        const loggerWin = this.getLoggerWindow()
        if (loggerWin && service.getProcesses().length === 0 && !status.crashReport && status.code === 0) {
          loggerWin.close()
          this.loggerWin = undefined
        }
      })
    })
  })
}
