// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/ERC20Spendable/ISpendableERC20.sol)

// IERC20SpendableReceiver - Interface definition for contracts to implement spendable ERC20 functionality

pragma solidity ^0.8.13;

/**
* @dev IERC20SpendableReceiver
*
*/

interface IERC20SpendableReceiver{
  function receiveSpendableERC20(address _caller, uint256 _tokenPaid, uint256[] memory arguments) external returns(bool, uint256[] memory);
}