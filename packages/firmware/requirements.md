# Steps

1. Device Wake (timer or button press)
2. Check wake source
3. Fetch Time
4. If time is between 5:00 am and 8:00 am OR 3:00 pm and 7:00pm OR button was pressed
   1. Call generate-image endpoint
   2. Once response has returned download the image https://storage.hermes-lab.com/dev/eink/metroTable/display.png
   3. Refresh eink display and display new image
   4. sleep device for 15 min (enable timer + button wake)
5. For all other times (and button NOT pressed)
   1. download the image https://storage.hermes-lab.com/dev/eink/screensaver/display.png
   2. Refresh eink display and display new image
   3. sleep device for 3.5 hours (enable timer + button wake)

## Manual Control Features

### Key 1 (Metro Button)
- Button press during deep sleep wakes the device immediately
- Forces metro data fetch regardless of current time
- Treats button wake as if it's an active period
- Device sleeps for 15 minutes after button-triggered update
- Works during both active and inactive periods

### Key 2 (Screensaver Button)
- Button press during deep sleep wakes the device immediately
- Forces screensaver display regardless of current time
- Bypasses metro data fetch and API call
- Device sleeps for 3.5 hours after button-triggered update
- Works during both active and inactive periods
