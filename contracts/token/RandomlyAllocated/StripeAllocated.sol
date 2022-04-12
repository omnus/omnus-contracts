// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/RandomlyAllocated/StripeAllocated.sol)
// https://omnuslab.com/randomallocation

// StripeAllocated (Allocate the items in a fixed length collection, calling IceRing to randomly assign each ID, with
// IDs aggregated by stripes).

pragma solidity ^0.8.13;

/**
*
* @dev StripeAllocated
*
* This contract extension allows the selection of items from a finite collection, each selection using the IceRing
* entropy source and removing the assigned item from selection. The allocation moves through the total allocation
* in 'stripes' which provides randomised allocation with a reduced intial gas cost. 
* Intended for use with random token mints etc.
*
*/

import "@openzeppelin/contracts/utils/Context.sol";  
import "@omnus/contracts/entropy/IceRing.sol";
import "hardhat/console.sol";

/**
*
* @dev Contract module which allows children to randomly allocated items from a decaying array.
* You must pass in:
* 1) The length of the collection you wish to select from (e.g. 10,000)
* 2) The number of stripes the IDs will be served in, (e.g. 100)
* 3) The IceRing contract address for this chain.
* 
* The contract will pass back the item from the array that has been selected and remove that item from the array,
* hence you have a decaying list of items to select from. The first stripe is selected based on RNG from IceRing.
* Selection from within the stripe is randomised. When the stripe is exhausted a new stripe is loaded, until the 
* collection is exhausted.
*
*/

abstract contract StripeAllocated is Context, IceRing {

  // Max stripes is 255 and max items per stripe is 255. Therefore max collection that can be allocated in this way is 65,025 items
  uint16[] public stripes; // Array of stripes - Note max stripes is 255
  uint8[] public items;   // Array of items - Note stripe size is 255 (or remainder if less than 255)
  // One user per stripe will need to populate the items for that stripe. Store one uint32 here for everyone who doesn't iterate
  // to a new stripe to offset this gas effect and keep things fair cost for all:
  uint16[] public arrayOfFairness; 
  uint256 public immutable entropyMode;
  uint256 public immutable stripeWidth;
  uint256 public immutable finalStripe;
  uint256 public immutable finalStripeWidth;
  
  uint256 public fee;
  uint256 private stripeStartId;

  uint256 private constant WIDTH_LIMIT = 255; // This is the max value for (items / stripes)
  uint256 private constant STRIPE_LIMIT = 65535;

  event FeeUpdated(uint256 oldFee, uint256 newFee);

  /**
  *
  * @dev must be passed supply details, ERC20 payable contract and ice contract addresses, as well as entropy mode and fee (if any)
  *
  */
  constructor(uint256 _supply, uint256 _stripes, address _ERC20SpendableContract, address _iceContract, uint256 _entropyMode, uint256 _fee)
    IceRing(_ERC20SpendableContract, _iceContract) {
    
    entropyMode = _entropyMode;
    fee = _fee;
    
    // Determine how many IDs will be in each stripe:
    stripeWidth = _supply / _stripes;

    // Anything more than the ARRAY_LIMIT will overflow
    require(stripeWidth < (WIDTH_LIMIT + 1),"Supply divided by number of stripes must be 255 or less");
    require((_stripes < (STRIPE_LIMIT + 1)) && (_stripes > 0),"Number of stripes must be 1 to 65,535");

    // Work out details of the final stripe (may have a remainder to process).
    // final stripe ID is stripe count -1 as we start at 0:
    finalStripe = _stripes - 1;

    finalStripeWidth = _supply % stripeWidth;

    // Load the stripe tracking array
    for(uint256 i = 0; i < _stripes;) {
      stripes.push(uint16(i));
      unchecked{ i++; }
    }

    //Prime the items array:
    changeStripes();
    
  }

  /**
  *
  * @dev View items array
  *
  */
  function _itemsArray() external view returns(uint8[] memory) {
    return(items);
  }

  /**
  *
  * @dev View stripes array
  *
  */
  function _stripesArray() external view returns(uint16[] memory) {
    return(stripes);
  }

  /**
  *
  * @dev Update fee. Implement an external call that calls this in child contract, likely ownerOnly.
  *
  */
  function _updateFee(uint256 _fee) internal {
    uint256 oldFee = fee;
    fee = _fee;
    emit FeeUpdated(oldFee, _fee);
  }

  /**
  *
  * @dev Allocate item from array:
  *
  */
  function _getItem() internal returns(uint256 allocatedItem_) { //mode: 0 = light, 1 = standard, 2 = heavy

    require(stripes.length != 0 || items.length != 0, "ID allocation exhausted");

    // Get our randomly assigned item from remaining items in the array. Actual Index is the returned number 
    // in range minus 1, as our array index starts at 0, not 1: 

    uint256 allocatedIndex;

    if (entropyMode == 0) allocatedIndex = (_getNumberInRangeLight(items.length, fee) - 1);
    else if (entropyMode == 1) allocatedIndex = (_getNumberInRangeStandard(items.length, fee) - 1);
    else if (entropyMode == 2) allocatedIndex = (_getNumberInRangeHeavy(items.length, fee) - 1);
    else revert("Unrecognised entropy mode");
    
    allocatedItem_ = uint256(items[allocatedIndex]) + stripeStartId;

    // To prevent a gap in the array, we store the last item in the index of the item to delete, and
    // then delete the last slot (swap and pop).

    uint256 lastItemIndex = items.length - 1;

    // When the item to remove from the array is the last item, the swap operation is unnecessary

    if (allocatedIndex != lastItemIndex) {
      items[allocatedIndex] = items[lastItemIndex];
    }

    // Remove the last position of the array:
    items.pop();

    // See if we need a new stripe, but only if there is a new stripe waiting:
    if (stripes.length != 0) {
      if (items.length == 0) {
        changeStripes();
      }
      else {
        //Store an item in the array of fairness:
        arrayOfFairness.push(1);
      }
    }
    return(allocatedItem_);
  }

  /**
  *
  * @dev Select a new stripe:
  *
  */
  function changeStripes() internal {
    
    uint256 allocatedIndex;

    if (entropyMode == 0) allocatedIndex = (_getNumberInRangeLight(stripes.length, fee) - 1);
    else if (entropyMode == 1) allocatedIndex = (_getNumberInRangeStandard(stripes.length, fee) - 1);
    else if (entropyMode == 2) allocatedIndex = (_getNumberInRangeHeavy(stripes.length, fee) - 1);
    else revert("Unrecognised entropy mode");

    uint256 chosenStripe = uint256(stripes[allocatedIndex]);

    uint256 selectedStripeWidth;

    // Populate the items for this stripe. First check if it's the last stripe.
    // A width of 0 for the final stripe means that the supply has divided perfectly
    // by the number of stripes, and the final stripe is therefore a fill width:
    if (chosenStripe == finalStripe && finalStripeWidth != 0) {
      selectedStripeWidth = finalStripeWidth;
    }
    else{
      selectedStripeWidth = stripeWidth;
    }

    // Example, width is 100 and we have stripe 3. Stripes before this will be:
    // 0 = 0 to 99
    // 1 = 100 to 199
    // 2 = 200 to 299
    // 3 = 300 to 399
    // Therefore our starting ID is stripeNumber * stripeWidth

    stripeStartId = chosenStripe * stripeWidth;

    uint8[] memory tempArray = new uint8[](selectedStripeWidth);

    for(uint8 i = 0; i < uint8(selectedStripeWidth);) {
      tempArray[i] = i;
      unchecked{ i++; }
    }

    items = tempArray;

    uint256 lastStripeIndex = stripes.length - 1;

    // When the item to remove from the array is the last item, the swap operation is unnecessary
    if (allocatedIndex != lastStripeIndex) {
      stripes[allocatedIndex] = stripes[lastStripeIndex];
    }
 
    // Remove the last position of the array:
    stripes.pop();

    // Offset cost of this using stored gas:
    for(uint256 i = 0; i < arrayOfFairness.length;) {
      arrayOfFairness.pop;
      unchecked{ i++; }
    }

  }

}