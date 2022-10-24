import { ethers } from 'hardhat'

async function main() {
  const StudentSocietyDAO = await ethers.getContractFactory('StudentSocietyDAO')
  const studentSocietyDAO = await StudentSocietyDAO.deploy()
  await studentSocietyDAO.deployed()

  const studentERC20 = await studentSocietyDAO.studentERC20()

  const studentERC721 = await studentSocietyDAO.studentERC721()

  console.log(`"studentSociety": "${studentSocietyDAO.address}",
  "studentERC20": "${studentERC20}",
  "studentERC721": "${studentERC721}"`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
