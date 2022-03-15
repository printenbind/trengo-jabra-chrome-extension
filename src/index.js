import { init, SignalType, CallControlFactory, RequestedBrowserTransport }  from '@gnaudio/jabra-js';


const waitForPickup = async () => {
  const api = await init({
    transport: RequestedBrowserTransport.CHROME_EXTENSION
  });
  const callControlFactory = new CallControlFactory(api);

  api.deviceList.subscribe((devices) => {
    devices.forEach(async (device) => {
        const deviceCallControl = await callControlFactory.createCallControl(device);
        const gotLock = await deviceCallControl.takeCallLock();

        const signalSubscription = deviceCallControl.deviceSignals.subscribe((signal) => {
            if (signal.value && SignalType.HOOK_SWITCH === signal.type) {
                alert('pickup2')
            }
        });
    });
  });
}

waitForPickup()
