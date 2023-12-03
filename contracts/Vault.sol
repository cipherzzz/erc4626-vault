// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Vault is ERC4626 {
    constructor(
        address _token,
        string memory _name,
        string memory _symbol
    ) ERC4626(IERC20Metadata(_token)) ERC20(_name, _symbol) {}
}
