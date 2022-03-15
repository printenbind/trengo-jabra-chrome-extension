import { init, SignalType, CallControlFactory, RequestedBrowserTransport }  from '@gnaudio/jabra-js';



let api = null
let callControlFactory = null;
let deviceCallControl = null;

const waitForPickup = async () => {
  if (!api) {
    api = await init({
      transport: RequestedBrowserTransport.CHROME_EXTENSION
    });
  }
  if (!callControlFactory) {
    callControlFactory = new CallControlFactory(api);
  }

  api.deviceList.subscribe(async (devices) => {
    if (devices.length > 0) {
      const device = devices[0];
      console.log(`Phone found ${device.name} - ${device.productId}`)

      if (!deviceCallControl) {
        deviceCallControl = await callControlFactory.createCallControl(device);
      }

      try {
        if (await deviceCallControl.takeCallLock()) {
          console.log('Phone lock successfull')
          deviceCallControl.deviceSignals.subscribe((signal) => {
            console.log(SignalType[signal.type], signal)
            if (signal.value && SignalType.HOOK_SWITCH === signal.type) {
                pickupOrHangup()
            }
            if (!signal.value && SignalType.ONLINE === signal.type) {
              hangup()
            }
          });
        } else {
          console.log('Failed to get phone lock')
        }
      } catch (error) {
        console.log('Failed to get phone lock hard')
      }
    }
  });
}

const pickupOrHangup = () => {
  console.log('Phone hook trigger')
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

waitForPickup();
