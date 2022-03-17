import { init, SignalType, CallControlFactory, RequestedBrowserTransport }  from '@gnaudio/jabra-js'
import delay  from 'delay'

let api = null
let navigated = false

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.type === 'navigation') {
    navigated = true
  }
  sendResponse(true)
})

const initialize = async () => {
  api = await init({
    transport: RequestedBrowserTransport.CHROME_EXTENSION
  })
  console.log('Made connection with Jabra chrome extension')
}

const getCallControll = async (device) => {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('getCallControll timeout')
      resolve(null)
    }, 2000)

    try {
      const callControlFactory = new CallControlFactory(api)
      const result = await callControlFactory.createCallControl(device)
      clearTimeout(timeout)
      resolve(result)
    } catch (error) {
      resolve(null)
    }
  })
}


const getLock = async (control) => {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('getLock timeout')
      resolve(false)
    }, 2000)

    try {
      const result = await control.takeCallLock()
      clearTimeout(timeout)
      resolve(result)
    } catch (error) {
      resolve(false)
    }
  })
}

const isConnected = (control) => {
  try {
    control.checkHasDisconnected()
    return true
  } catch (error) {
    console.log('Device connection lost')
    return false
  }
}

const waitForDevice = () => {
  return new Promise((resolve, reject) => {
    console.log('Waiting for jabra device')
    const subscription = api.deviceList.subscribe(async (devices) => {
      if (devices.length > 0) {
        const device = devices[0]
        console.log(`Jabra device found found ${device.name} - ${device.productId}`)

        const control = await getCallControll(device)

        subscription.unsubscribe()
        resolve(control)
      }
    })
  })
}


const listen = async (control) => {
  return new Promise(async (resolve, reject) => {
    console.log("Waiting for device signal")
    const subscription = control.deviceSignals.subscribe((signal) => {
      console.log(SignalType[signal.type], signal)
      if (signal.value && SignalType.HOOK_SWITCH === signal.type) {
          pickupOrHangup()
      }
      if (!signal.value && SignalType.ONLINE === signal.type) {
        hangup()
      }
    })

    while (navigated === false && isConnected(control)) {
      await delay(100)
    }
    navigated = false
    if (isConnected(control)) {
      control.releaseCallLock()
      subscription.unsubscribe()
    }
    resolve()
  })
}

const pickupOrHangup = () => {
  console.log('Device hook trigger')
  let pickupUpButton = null
  let hangUpButton = null

  const collection = document.getElementsByClassName("material-icons")
  for (let item of collection) {
    if (item.textContent === 'call') {
      if (item.offsetParent !== null) {
        pickupUpButton = item.parentNode
      }
    }
    if (item.textContent === 'call_end') {
      if (item.offsetParent !== null && item.parentNode.classList.contains('call-action-icon-red')) {
        hangUpButton = item.parentNode
      }
    }
  }

  if (pickupUpButton) {
    pickupUpButton.click()
    console.log('Pickup successfull')
  } else if (hangUpButton) {
    hangUpButton.click()
    console.log('Hangup successfull')
  } else {
    console.log('Phone window not visible')
    alert('piep')
  }
}

const hangup = () => {
  let button = null

  const collection = document.getElementsByClassName("material-icons")
  for (let item of collection) {
    if (item.textContent === 'call_end') {
      if (item.offsetParent !== null && item.parentNode.classList.contains('call-action-icon-red')) {
        button = item.parentNode
      }
    }
  }

  if (button) {
    button.click()
    console.log('Hangup successfull')
  } else {
    console.log('Phone window not visible for hangup')
  }
}


const main = async () => {
  await initialize()
  while (true) {
    const control = await waitForDevice()
    if (control) {
      if (await getLock(control)) {
        console.log('Device lock successfull')
        await listen(control)
      } else {
        console.log('Cannot get a lock, trying again in 10 sec')
        await delay(10000)
      }
    } else {
      // Jabra extension crashed because of reload race condition
      break;
    }
  }
  alert('Verbinding met koptelefoon verbroken, refresh (F5) de pagina a.u.b');
}

main()
