// THROTTLING NETWORK for a test case
// 1. Import the NETWORK_PRESETS const
// 2. Add below code for throttling the network passing the preferred n/w condition object
// test('Should be able to update team slug', async ({
//     loginPage,
//     settingsPage,
//     context,
//     page
//   }) => {
//     const cdpSession = await context.newCDPSession(page)

//     await cdpSession.send("Network.emulateNetworkConditions",
//       NETWORK_PRESETS["Regular2G"] as any
//     )
// ...rest of test case
// })

export const NETWORK_PRESETS = {
  Offline: {
    offline: true,
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0,
    connectionType: 'none',
  },
  NoThrottle: {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  },
  Regular2G: {
    offline: false,
    downloadThroughput: (250 * 1024) / 8,
    uploadThroughput: (50 * 1024) / 8,
    latency: 300,
    connectionType: 'cellular2g',
  },
  Good2G: {
    offline: false,
    downloadThroughput: (450 * 1024) / 8,
    uploadThroughput: (150 * 1024) / 8,
    latency: 150,
    connectionType: 'cellular2g',
  },
  Regular3G: {
    offline: false,
    downloadThroughput: (750 * 1024) / 8,
    uploadThroughput: (250 * 1024) / 8,
    latency: 100,
    connectionType: 'cellular3g',
  },
  Good3G: {
    offline: false,
    downloadThroughput: (1.5 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 40,
    connectionType: 'cellular3g',
  },
  Regular4G: {
    offline: false,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (3 * 1024 * 1024) / 8,
    latency: 20,
    connectionType: 'cellular4g',
  },
  WiFi: {
    offline: false,
    downloadThroughput: (30 * 1024 * 1024) / 8,
    uploadThroughput: (15 * 1024 * 1024) / 8,
    latency: 2,
    connectionType: 'wifi',
  },
};
