import { studentERC20Contract, studentSocietyContract } from '../utils/contracts'

import { message } from 'antd'

const getInfo = async () => {
  if (studentSocietyContract) {
    const result = await studentSocietyContract.methods.getInformation().call()
    console.log(result)
  }
}

const makeProposal = async (name: string, duration: number, account: any, getUserInformation: any, consultAllProposal: any) => {
  console.log(account)
  if (studentSocietyContract) {
    await studentERC20Contract.methods.approve(studentSocietyContract.options.address, 20).send({
      from: account
    })
    studentSocietyContract.methods
      .makeProposal(name, duration)
      .send({
        from: account,
        gas: '1000000'
      })
      .then((result: any) => {
        console.log(result)
        message.success('成功提出一个提案')
        getUserInformation()
        consultAllProposal()
      })
      .catch((err: any) => {
        message.error('上一个提案仍在表决中或者上一个提案的奖励未领取，请先处理上一个提案')
      })
  }
}

// 同意某个提案
const agreeWithProposal = async (id: number, account: number, getUserInformation: any, consultAllProposal: any) => {
  if (studentSocietyContract) {
    await studentERC20Contract.methods.approve(studentSocietyContract.options.address, 5).send({
      from: account
    })
    console.log('同意')
    studentSocietyContract.methods
      .agreeProposal(id)
      .send({
        from: account,
        gas: '1000000'
      })
      .then((result: any) => {
        console.log(result)
        getUserInformation()
        consultAllProposal()
        message.success('投票成功')
      })
      .catch((err: any) => {
        message.error(err + '')
      })
  }
}

const rejectWithProposal = async (id: number, account: number, getUserInformation: any, consultAllProposal: any) => {
  if (studentSocietyContract) {
    await studentERC20Contract.methods.approve(studentSocietyContract.options.address, 5).send({
      from: account
    })
    studentSocietyContract.methods
      .rejectProposal(id)
      .send({
        from: account
      })
      .then((result: any) => {
        console.log(result)
        getUserInformation()
        consultAllProposal()
        message.success('投票成功')
      })
      .catch((err: any) => {
        message.error(err + '')
      })
  }
}

const getBonus = async (account: number, getUserInformation: any) => {
  if (studentSocietyContract) {
    studentSocietyContract.methods
      .getBonus()
      .send({
        from: account
      })
      .then((result: any) => {
        console.log(result)
        getUserInformation()
        message.success('领取成功')
      })
      .catch((err: any) => {
        message.error('没有可领取的奖励')
      })
  }
}

// 获取奖励
const getKeepsake = async (account: number) => {
  if (studentSocietyContract) {
    studentSocietyContract.methods
      .getKeepsake()
      .send({
        from: account,
        gas: '200000'
      })
      .catch((err: any) => {
        console.log(err)
        message.error(err + '')
      })
  }
}

export { getInfo, getKeepsake, makeProposal, agreeWithProposal, rejectWithProposal, getBonus }
