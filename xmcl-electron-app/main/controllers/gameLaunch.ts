// gameLaunch.ts (modified: on key_invalidated, stop launch if in progress, show toast, remove profile)
import { ElectronController } from '../ElectronController'
import { LaunchService } from '@xmcl/runtime/launch'
import { ControllerPlugin } from './plugin'
import { UserServiceKey } from '@xmcl/runtime-api'
import crypto from 'crypto'
import io from 'socket.io-client'

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
              // Get key from localStorage
              const key = localStorage.getItem(`offlineKey_${selectedUserId}`)
              if (key) {
                // Subscribe to key room
                const socket = io('http://localhost:5000')
                socket.emit('subscribe_key', { key })
                socket.on('key_invalidated', async (data) => {
                  const { key: invalidKey, reason } = data
                  if (invalidKey === key) {
                    // Kill process if running
                    const processes = service.getProcesses()
                    processes.forEach(p => p.kill())
                    // Show toast
                    showInvalidationToast(reason)
                    // Remove profile
                    del(userState.users, selectedUserId)
                    // Clear local
                    localStorage.removeItem(`offlineKey_${selectedUserId}`)
                    console.log(`Key invalidated during launch: ${reason}. Launch aborted.`)
                  }
                })
                // Send online status before launch
                await fetch(`http://localhost:5000/update_status/${encodeURIComponent(key)}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: currentUser.username, status: 'online' })
                })
                console.log(`Game launch: Set ${currentUser.username} to online`)
              }
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
              const key = localStorage.getItem(`offlineKey_${selectedUserId}`)
              process.on('exit', async (code) => {
                if (key) {
                  // Send offline status on exit
                  await fetch(`http://localhost:5000/update_status/${encodeURIComponent(key)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUser.username, status: 'offline' })
                  })
                  console.log(`Game exit: Set ${currentUser.username} to offline`)
                }
                if (code !== 0) {
                  setTimeout(() => service.launch(...args), 5000)
                }
              })
            }
            return result
          } catch (e) {
            console.warn('[CRACKED ERROR]', e)
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

// Global function for toast (can be called from anywhere)
const showInvalidationToast = (reason: string) => {
  // Similar to user.ts, use app's toast system
  const snackbar = {
    color: 'error',
    timeout: 5000,
    show: true,
    message: `Your key has been ${reason}. Launcher will close. Please get a new key.`,
    location: 'top',
    transition: 'slide-y-transition'
  }
  // Emit to global bus or store
  console.log(snackbar.message) // Placeholder
}
// 5.34.4.4.4
