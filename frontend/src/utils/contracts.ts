import Address from './contract-address.json'
import StudentSociety from './abis/StudentSocietyDAO.json'
import StudentToken from './abis/StudentToken.json'
import StudentItem from './abis/StudentItem.json'
const Web3 = require('web3')

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
// console.log(window.web3)
// let web3 = new Web3(Web3.currentProvider)

// 设置provider，否则会报错
// web3.setProvider(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))

// 采用webSocker Provider
const ether_port = 'ws://localhost:8545'
const web3 = new Web3(new Web3.providers.WebsocketProvider(ether_port))

// 修改地址为部署的合约地址
const studentSocietyAddress = Address.studentSociety
const studentSocietyABI = StudentSociety.abi

const studentERC20Address = Address.studentERC20
const studentERC20ABI = StudentToken.abi

const studentERC721Address = Address.studentERC721
const studentERC721ABI = StudentItem.abi

// 获取合约实例
const studentSocietyContract = new web3.eth.Contract(studentSocietyABI, studentSocietyAddress)
const studentERC20Contract = new web3.eth.Contract(studentERC20ABI, studentERC20Address)
const studentERC721Contract = new web3.eth.Contract(studentERC721ABI, studentERC721Address)

// 导出web3实例和其它部署的合约
export { web3, studentSocietyContract, studentERC20Contract, studentERC721Contract }
