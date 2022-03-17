import { init, SignalType, CallControlFactory, RequestedBrowserTransport }  from '@gnaudio/jabra-js';
import delay  from 'delay';

let api = null
let callControlFactory = null;

const initialize = async () => {
  api = await init({
    transport: RequestedBrowserTransport.CHROME_EXTENSION
  });
  callControlFactory = new CallControlFactory(api);
}

const waitForDevice = () => {
  return new Promise((resolve, reject) => {
    console.log('Waiting for jabra device')
    const subscription = api.deviceList.subscribe(async (devices) => {
      if (devices.length > 0) {
        const device = devices[0];
        console.log(`Jabra device found found ${device.name} - ${device.productId}`)

        const control = await callControlFactory.createCallControl(device)
        subscription.unsubscribe();
        resolve(control);
      }
    });
  });
};

const getLock = async (control) => {
  try {
    return await control.takeCallLock();
  } catch (error) {
    return false;
  }
}

const listen = async (control) => {
  return new Promise(async (resolve, reject) => {
    console.log('Device lock successfull')
    const subscription = control.deviceSignals.subscribe((signal) => {
      console.log(SignalType[signal.type], signal)
      if (signal.value && SignalType.HOOK_SWITCH === signal.type) {
          pickupOrHangup()
      }
      if (!signal.value && SignalType.ONLINE === signal.type) {
        hangup()
      }
    });
    await delay(60000);
    if (isConnected(control)) {
      control.releaseCallLock();
      subscription.unsubscribe();
    }
    resolve()
  });
}

const isConnected = (control) => {
  try {
    control.checkHasDisconnected()
    console.log('Device connection stable');
    return true;
  } catch (error) {
    console.log('Device connection lost');
    return false;
  }
}

const pickupOrHangup = () => {
  console.log('Device hook trigger')
  let pickupUpButton = null;
  let hangUpButton = null;

  const collection = document.getElementsByClassName("material-icons");
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
  let button = null;

  const collection = document.getElementsByClassName("material-icons");
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

initialize().then(async () => {
  while (true) {
    const control = await waitForDevice();
    if (await getLock(control)) {
      await listen(control);
    } else {
      await delay(60000);
    }
  }
})
