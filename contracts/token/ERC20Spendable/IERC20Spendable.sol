// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/ERC20Spendable/ISpendableERC20.sol)

// IERC20Spendable - Interface definition for contracts to implement spendable ERC20 functionality

pragma solidity ^0.8.13;

/**
* @dev IERC20Spendable
*
*/

interface IERC20Spendable{
  function spendToken(address receiver, uint256 _tokenPaid, uint256[] memory _arguments) external returns(uint256[] memory);
}