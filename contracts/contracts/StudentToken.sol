// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StudentToken is ERC20 {
    constructor(uint tokenNum) ERC20("studentToken", "0") {
        _mint(msg.sender, tokenNum);
    }
}
