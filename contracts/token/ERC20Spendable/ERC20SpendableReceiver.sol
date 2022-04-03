// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/ERC20Spendable/SpendableERC20Receiver.sol)

// ERC20SpendableReceiver (Lightweight library for allowing contract interaction on token transfer).

pragma solidity ^0.8.13;

/**
* @dev ERC20SpendableReceiver
*/

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";   
import "./IERC20SpendableReceiver.sol"; 

/**
 * @dev Contract module which allows children to spend tokens in a way that a receiving contract
 * can interact.
 */
abstract contract ERC20SpendableReceiver is Context, Ownable, IERC20SpendableReceiver {
  
  address public immutable ERC20Spendable; 

  event ERC20Received(address _caller, uint256 _tokenPaid, uint256[] _arguments);

  /** 
  * @dev must be passed the token contract for the payable ERC20:
  */ 
  constructor(address _ERC20Spendable) {
    ERC20Spendable = _ERC20Spendable;
  }

  /** 
  * @dev Only allow authorised tokens:
  */ 
  modifier onlyERC20Spendable(address _caller) {
    require (_caller == ERC20Spendable, "Call from unauthorised caller");
    _;
  }

  /** 
  * @dev function to be called on receive. Must be overriden, including the addition of a fee check, if required:
  */ 
  function receiveSpendableERC20(address _caller, uint256 _tokenPaid, uint256[] memory _arguments) external virtual onlyERC20Spendable(msg.sender) returns(bool, uint256[] memory) { 
    // Must be overriden 
  }

}
