const os = window.require('os');
const path = window.require('path');

export default {
  'gallery': {
    'imageCountOfSinglePage': 20,
    'packCountOfSinglePage': 20,
    'downloadPath': path.join(os.homedir(), 'Pictures'),
    'otherPath': path.join(os.homedir(), 'Pictures'),
    'r18': true,
    'proxy': 'http://127.0.0.1:10809',
    'proxyEnabled': false,
    'domainOf24fa': 'https://www.24fa.link/',
    'maxRetryCount': 5,
  },
  'reader': {
    'deltaLine': 100,
    'contentRange': 300,
    'overflowNum': 20,
    'distanceToUpdate': 2000,
    'fontSize': 17,
  },
};
