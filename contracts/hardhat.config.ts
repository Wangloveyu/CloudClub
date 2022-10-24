import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    // 节点
    ganache: {
      // rpc url, change it according to your ganache configuration
      // 节点的地址
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      // 部署账户的私钥
      accounts: [
        '0xf943d3e969549dc41663b311599ae46e1c5eca926e9e582ba0f2122bb1744166',
        '0xb537d99421516c144145e3dfc33a2dd4612646c914f4aa97dff64c128919b12d',
        '0x1e120c33d9196d036f11017ae935aedee91662c971367b9dcbebc34f01e10cef',
        '0x40ae87e422ee9942061e6d812f7ffe417eefe3667c6b2bb09bea5c5056fdf59d',
        '0xdb4c59b892ded613be7e9cdcf0630945f87b1fb110754474c327246def585017'
      ]
    }
  }
}

export default config
