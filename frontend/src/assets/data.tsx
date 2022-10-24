const items = [
  { id: 0, content: '连接钱包' },
  {
    id: 1,
    content: '发起提案'
  },
  {
    id: 2,
    content: '赞成提案'
  },
  {
    id: 3,
    content: '拒绝提案'
  },
  {
    id: 4,
    content: '查询提案'
  },
  {
    id: 5,
    content: '查询所有提案'
  },
  {
    id: 6,
    content: '获取奖励'
  },
  {
    id: 7,
    content: '领取纪念品'
  }
]
const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'
export { items, GanacheTestChainId, GanacheTestChainName, GanacheTestChainRpcUrl }
