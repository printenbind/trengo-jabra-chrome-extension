import { init, SignalType, CallControlFactory, RequestedBrowserTransport }  from '@gnaudio/jabra-js';


const waitForPickup = async () => {
  const api = await init({
    transport: RequestedBrowserTransport.CHROME_EXTENSION
  });
  const callControlFactory = new CallControlFactory(api);

  api.deviceList.subscribe((devices) => {
    devices.forEach(async (device) => {
        console.log(`Phone found ${device.name} - ${device.productId}`)
        const deviceCallControl = await callControlFactory.createCallControl(device);
        const gotLock = await deviceCallControl.takeCallLock();

        if (gotLock) {
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
    });
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
