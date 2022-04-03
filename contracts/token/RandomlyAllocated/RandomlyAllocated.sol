// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/RandomlyAllocated/RandomlyAllocated.sol)

// RandomlyAllocated (Allocate the items in a fixed length collection, calling the IceRing service to randomly assign
// each allocation).

pragma solidity ^0.8.13;

/**
* @dev RandomlyAllocated
*
* This contract extension allows the selection of items from a finite collection, each selection using the IceRing
* entropy source and removing the assigned item from selection. Intended for use with random token mints etc.
*/

import "@openzeppelin/contracts/utils/Context.sol";  
import "../../entropy/IceRing.sol";

/**
 * @dev Contract module which allows children to randomly allocated items from a decaying array.
 * You must pass in:
 * 1) The length of the collection you wish to select from (e.g. 1,000)
 * 2) The IceRing contract address for this chain.
 * 
 * The contract will pass back the item from the array that has been selected and remove that item from the array,
 * hence you have a decaying list of items to select from.
 */
abstract contract RandomlyAllocated is Context, IceRing {

  uint16[] public items; // Array of items - Note max items is 65,535
  uint256 public immutable entropyMode;
  uint256 public fee;
  uint16 private constant LOAD_LIMIT = 2500;
  uint16 public remainingSupplyToLoad;
  uint16 public continueLoadFromId;

  event FeeUpdated(uint256 oldFee, uint256 newFee);

  constructor(uint16 _supply, address _oatContract, address _iceContract, uint256 _entropyMode, uint256 _fee)
    IceRing(_oatContract, _iceContract) {
    
    entropyMode = _entropyMode;
    fee = _fee;
    
    remainingSupplyToLoad = _supply;

    _loadSupply();
  }

  /**
  * @dev Load supply details to the array:
  */
  function _loadSupply() public {
    
    require(remainingSupplyToLoad != 0, "Load complete");

    uint16 loadUntil;

    if (remainingSupplyToLoad > LOAD_LIMIT) {
      loadUntil = continueLoadFromId + LOAD_LIMIT;
      remainingSupplyToLoad -= LOAD_LIMIT;
    }
    else {
      loadUntil = continueLoadFromId + remainingSupplyToLoad;
      remainingSupplyToLoad = 0;
    }

    for(uint16 i = continueLoadFromId; i < loadUntil;) {
      items.push(i);
      unchecked{ i++; }
    }

    continueLoadFromId = loadUntil;

  }
  
  /**
  * @dev View total remaining items in the array
  */
  function _remainingItems() external view returns(uint256) {
    return(items.length);
  }

  /**
  * @dev View items array
  */
  function _itemsArray() external view returns(uint16[] memory) {
    return(items);
  }


  /**
  * @dev Update fee (implement an external call that calls this in child contract, likely ownerOnly)
  */
  function _updateFee(uint256 _fee) internal {
    uint256 oldFee = fee;
    fee = _fee;
    emit FeeUpdated(oldFee, _fee);
  }

  /**
   * @dev Allocate item from array:
   */
  function _getItem() internal returns(uint256 allocatedItem_) { //mode: 0 = light, 1 = standard, 2 = heavy
    // Get our randomly assigned item from remaining items in the array. Actual Index is the returned number 
    // in range minus 1, as our array index starts at 0, not 1: 
    
    uint256 allocatedIndex;

    if (entropyMode == 0) allocatedIndex = (_getNumberInRangeLight(items.length, fee) - 1);
    else if (entropyMode == 1) allocatedIndex = (_getNumberInRangeStandard(items.length, fee) - 1);
    else if (entropyMode == 2) allocatedIndex = (_getNumberInRangeHeavy(items.length, fee) - 1);
    else revert("Unrecognised entropy mode");

    
    allocatedItem_ = uint256(items[allocatedIndex]);

    _shuffleTheArray(allocatedIndex);

    return(allocatedItem_);
  }

  /**
  * @dev Shuffle the array - pop and swap to make sure there is never a gap in our array of available items. We remove
  * the entry for the tree we have just transfered, pop the one off the end of the array and swap it into the vacated
  * slot. While keeping our array neat and tidy this 'shuffle' also adds an extra degree of randomness to the selection
  * process
  */
  function _shuffleTheArray(uint256 _allocatedItemIndex) internal {
      // To prevent a gap in the array, we store the last item in the index of the item to delete, and
      // then delete the last slot (swap and pop).
      uint256 lastItemIndex = items.length - 1;
      // When the item to remove from the array is the last tree, the swap operation is unnecessary
      if (_allocatedItemIndex != lastItemIndex) {
        items[_allocatedItemIndex] = items[lastItemIndex];
      }
      // Remove the last position of the array:
      items.pop();
  }

}