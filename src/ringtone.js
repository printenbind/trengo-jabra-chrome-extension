import delay  from 'delay'

const isReady = () => {
  try {
    return Twilio.Device.status() === 'ready'
  } catch (error) {
    return false;
  }
}

const play = () => {
  try {
    Twilio.Device.audio.ringtoneDevices.test('https://media.twiliocdn.com/sdk/js/client/sounds/releases/1.0.0/incoming.mp3')
  } catch (error) {
    return false;
  }
}

const main = async () => {
  while (true) {
    let inQueue = 0;
    let available = false;

    const spans = document.getElementsByTagName("span");
    for (const span of spans) {
      if (span.textContent === 'Queue') {
        inQueue = span.nextElementSibling.textContent
        break;
      }
    }
    const strongs = document.getElementsByTagName("strong");
    for (const strong of strongs) {
      if (strong.textContent === 'Available') {
        if (strong.nextSibling.nodeValue.includes('for calls')) {
          available = true;
          break;
        }
      }
    }

    console.log(`inQueue ${inQueue}`)
    console.log('isReady: ' + isReady())
    console.log('available: ' + available)

    if (available && inQueue > 0 && isReady()) {
      play()
    }

    await delay(30000)
  }
}

main()
