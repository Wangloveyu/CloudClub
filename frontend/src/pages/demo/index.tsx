import { Input, Button, Modal, Card, List, message } from 'antd'
import { useState, useEffect } from 'react'
import { agreeWithProposal, getBonus, getKeepsake, makeProposal, rejectWithProposal } from '../../assets/handler'
import { studentERC20Contract, studentSocietyContract, web3 } from '../../utils/contracts'
import { GanacheTestChainId, GanacheTestChainName, GanacheTestChainRpcUrl } from '../../assets/data'
import './index.css'

const getTime = (time: number) => {
  time *= 1000 // 毫秒为0
  const date = new Date(time)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

let myAccount: number = 0

const DemoPage = () => {
  const [list, setList] = useState<any[] | undefined>([])
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState(0)
  const [inputString, setInputString] = useState('')
  const [inputNumber, setInputNumber] = useState(0)
  const [token, setToken] = useState(0)
  const [remainTime, setRemainTime] = useState(10)
  const [info, setInfo] = useState<any>(undefined)
  useEffect(() => {
    let timer: any

    console.log(myAccount)
    if (myAccount !== 0) {
      studentSocietyContract.once(
        'TokenList',
        {
          fromBlock: 0
        },
        (err: any, res: any) => {
          if (!err) {
            // message.success(`你的纪念品tokenId是${res.returnValues.Tokens}`)
            getUserInformation()
          }
          console.log(err, res)
        }
      )

      timer = setInterval(() => {
        setRemainTime(prev => {
          if (prev <= 0) {
            if (myAccount !== 0) {
              consultAllProposal()
              setRemainTime(10)
            }
            return 10
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [myAccount])

  const onClickConnectWallet = async () => {
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    // @ts-ignore
    const { ethereum } = window
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
      alert('MetaMask is not installed!')
      return
    }

    try {
      // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
      if (ethereum.chainId !== GanacheTestChainId) {
        const chain = {
          chainId: GanacheTestChainId, // Chain-ID
          chainName: GanacheTestChainName, // Chain-Name
          rpcUrls: [GanacheTestChainRpcUrl] // RPC-URL
        }

        try {
          // 尝试切换到本地网络
          await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.chainId }] })
        } catch (switchError: any) {
          // 如果本地网络没有添加到Metamask中，添加该网络
          if (switchError.code === 4902) {
            await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain] })
          }
        }
      }

      // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
      await ethereum.request({ method: 'eth_requestAccounts' })
      // 获取小狐狸拿到的授权用户列表
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      // 如果用户存在，展示其account，否则显示错误信息
      setAccount(accounts[0])
      myAccount = accounts[0]
    } catch (error: any) {
      message.error(error + '')
    }
  }

  const getToken = async () => {
    if (studentSocietyContract && myAccount) {
      // 只有send方法才能调用会修改状态变量的方法
      console.log(
        await studentSocietyContract.methods.getToken().send({
          from: myAccount
        })
      )
      getUserInformation()
    }
  }
  const login = async (id: number) => {
    const accounts = await web3.eth.getAccounts()
    if (accounts.length === 0) {
      alert('Not connected yet.')
      return
    }
    setAccount(accounts[id])
    myAccount = accounts[id]
    console.log(accounts)
    if (studentSocietyContract) {
      // 只有send方法才能调用会修改状态变量的方法
      studentSocietyContract.methods
        .login()
        .send({
          from: accounts[id]
        })
        .then((res: any) => {
          getUserInformation()
          consultAllProposal()
          message.success('连接成功')
        })
        .catch((err: any) => {
          message.error('连接失败')
        })
    }
  }

  const getUserInformation = async () => {
    const accounts = await web3.eth.getAccounts()
    if (accounts.length === 0) {
      message.error('仍未连接钱包')
      return
    }
    const result = await studentERC20Contract.methods.balanceOf(myAccount).call()
    const data = await studentSocietyContract.methods.users(myAccount).call()
    console.log(result, data)
    setToken(result)
    setInfo(data)
  }

  // 查看所有提案
  const consultAllProposal = async () => {
    const accounts = await web3.eth.getAccounts()
    if (accounts.length === 0) {
      message.error('仍未连接钱包')
      return
    }
    if (studentSocietyContract) {
      const len = await studentSocietyContract.methods.nextuuid().call()
      console.log('协议数量', len)
      const res = []
      const start = len - 6 > 0 ? len - 6 : 1

      // 这段代码放在服务器上更好，否则会没钱
      for (let i = start; i < len; i++) {
        await studentSocietyContract.methods.checkComplete(i).send({
          from: accounts[0],
          gas: '200000'
        })
        const result = await studentSocietyContract.methods.proposals(i).call()
        res.push(result)
      }
      console.log(res)
      res.reverse()
      setList([...res])
    }
  }

  return (
    <Card className="userBox">
      {myAccount !== 0 ? (
        <>
          <h3>当前账户：{account}</h3>
          <Button
            onClick={async () => {
              login(0)
            }}
          >
            切换到账户1(仅测试用)
          </Button>

          <Button
            onClick={async () => {
              login(1)
            }}
          >
            切换到账户2(仅测试用)
          </Button>
          <h3>账户余额：{token} tokens</h3>
          <h3>发起的提案数：{info?.total}</h3>
          <h3>被通过的提案数：{info?.successNum}</h3>
          {info?.tokenId === '0' ? '' : <h3>纪念品TokenId：{info?.tokenId}</h3>}
          <h3>下次提案数据更新剩余时间：{remainTime}s</h3>

          <div className="functionBox">
            <Button onClick={() => setOpen(true)}>发起提案(20 tokens)</Button>
            <Button
              onClick={() => {
                getBonus(myAccount, getUserInformation)
              }}
            >
              领取奖励
            </Button>
            <Button
              disabled={info?.tokenId !== '0'}
              onClick={() => {
                getKeepsake(myAccount)
              }}
            >
              {info?.tokenId === '0' ? '领取纪念品' : '已领取纪念品'}
            </Button>
            <Button
              onClick={() => {
                getToken()
              }}
            >
              领取代币(仅测试用)
            </Button>
          </div>
          <br />
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={list}
            renderItem={item => {
              return (
                <Card title={item.name}>
                  <p>提案id: {item.index}</p>
                  <p>开始时间: {getTime(parseInt(item.startTime))}</p>
                  <p>投票时间: {item.duration}s</p>
                  <p>当前状态: {item.complete ? (item.agree > item.reject ? '提案通过' : '提案被拒绝') : '正在进行'}</p>
                  <p>赞成人数：{item.agree}</p>
                  <p>反对人数：{item.reject}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button onClick={() => agreeWithProposal(item.index, myAccount, getUserInformation, consultAllProposal)}>赞成(5 token)</Button>
                    <Button onClick={() => rejectWithProposal(item.index, myAccount, getUserInformation, consultAllProposal)}>反对(5 token)</Button>
                  </div>
                </Card>
              )
            }}
          />
        </>
      ) : (
        <>
          <h3>账户未连接，请连接后再进行操作</h3>
          <Button
            onClick={async () => {
              await onClickConnectWallet()
              login(0)
            }}
          >
            连接钱包
          </Button>
        </>
      )}
      {open ? (
        <Modal
          open
          onOk={async () => {
            makeProposal(inputString, inputNumber, myAccount, getUserInformation, consultAllProposal)
            setOpen(false)
          }}
          onCancel={() => {
            setOpen(false)
          }}
        >
          <Input
            onBlur={e => {
              setInputString(e.target.defaultValue)
            }}
            style={{ width: 'calc(100% - 200px)' }}
            placeholder="请输入提案主题"
          />
          <br />
          <br />
          <Input
            onBlur={e => {
              setInputNumber(parseInt(e.target.defaultValue))
            }}
            type="number"
            style={{ width: 'calc(100% - 200px)' }}
            placeholder="请输入提案持续时间(s)"
          />
        </Modal>
      ) : (
        ''
      )}
    </Card>
  )
}

export default DemoPage
