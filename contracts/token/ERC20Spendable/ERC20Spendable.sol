// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/ERC20Spendable/SpendableERC20.sol)

// ERC20Spendable 

pragma solidity ^0.8.13;

/**
* @dev ERC20Spendable
*
*/

import "@openzeppelin/contracts/utils/Context.sol";  
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IERC20SpendableReceiver.sol";  

/**
 * @dev Contract module which allows children to randomly allocated items from a decaying array.
 * You must pass in:
 * 1) The length of the collection you wish to select from (e.g. 1,000)
 * 2) The IceRing contract address for this chain.
 * 
 * The contract will pass back the item from the array that has been selected and remove that item from the array,
 * hence you have a decaying list of items to select from.
 */
abstract contract ERC20Spendable is Context, ERC20 {

  function spendToken(address receiver, uint256 _tokenPaid, uint256[] memory _arguments) external returns(uint256[] memory) {
    
    // 1) Transfer tokens to the receiver contract IF this is a non-0 amount. Don't try and transfer 0, which leaves
    // open the possibility that the call is free. If not, the function call after will fail and revert.
    if (_tokenPaid != 0) _transfer(msg.sender, receiver, _tokenPaid); 

    // 2) Perform actions on the receiver:
    (bool success, uint256[] memory returnValues) = IERC20SpendableReceiver(receiver).receiveSpendableERC20(msg.sender, _tokenPaid, _arguments);
    
    require(success, "Token Spend failed.");
    
    return(returnValues);

  }

}