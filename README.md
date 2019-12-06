# SigfoxJS

![Sigfox Logo img](https://www.logosvgpng.com/wp-content/uploads/2018/03/sigfox-logo-vector.png)

## [WIP]

```bash
npm install sigfox-js --save
```

```javascript
const SigfoxApi = require('sigfox-js');

const apiConnection = new SigfoxApi({
  username: 'username',
  password: 'password'
});

const infoDevices = await connection.devices.getAllDevices();
```

#### To Do:

- Users [x]
- Coverages [x]
- Devices [x]
- Devices Types [ ]
- Groups [ ]
- Tiles [ ]
