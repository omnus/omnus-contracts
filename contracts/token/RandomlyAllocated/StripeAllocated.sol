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


  uint16[] public stripes;
  uint8[] public items;  

  uint256 public immutable entropyMode;
  uint256 public immutable finalStripe;
  uint256 public immutable finalStripeWidth;
  
  uint256 public fee;
  uint256 private stripeStartId;

  // Fixed stripe width (a stripe will be either this or the remainder items if the last stripe). 32 = one slot of uint8s:
  uint256 private constant STRIPE_WIDTH = 32; 
  // Maximum collection size of 51,200 (which equates to 1,600 stripes)
  uint256 private constant COLLECTION_LIMIT = 51200;

  mapping (uint256 => uint256) gasStore;
 
  event FeeUpdated(uint256 oldFee, uint256 newFee);

  /**
  *
  * @dev must be passed supply details, ERC20 payable contract and ice contract addresses, as well as entropy mode and fee (if any)
  *
  * Mainnet, ropsten and rinkeby deployments:
  *     ERC20Spendable = 0x400A524420c464b9A8EBa65614F297B5478aD6F3
  *     IceRing        = 0x445D1D7346d6f169BB3A7E41F1212FA45181e32b
  */
  constructor(uint256 _supply, address _ERC20SpendableContract, address _iceContract, uint256 _entropyMode, uint256 _fee)
    IceRing(_ERC20SpendableContract, _iceContract) {
    
    require(_supply < (COLLECTION_LIMIT + 1),"Max supply of 51,200");

    entropyMode = _entropyMode;
    fee = _fee;

    uint256 numberOfStripes = _supply / STRIPE_WIDTH;

    finalStripeWidth = _supply % STRIPE_WIDTH;
    
    // If the supply didn't divide perfectly by the stripe width we have a remainder stripe
    if (finalStripeWidth != 0) {
      // Add one to the numberOfStripes to include the finalStripe:
      numberOfStripes += 1;
    }

    finalStripe = numberOfStripes - 1;

    // Load the stripe tracking array
    for(uint256 i = 0; i < numberOfStripes;) {
      stripes.push(uint16(i));
      unchecked{ i++; }
    }

    //Prime the items array:
    changeStripe();
    
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

    require(items.length != 0 || stripes.length != 0, "ID allocation exhausted");

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

    // If this was the last item in the current array we need to change stripes. DON'T pop the last item in
    // the array as that will tear it down, and the refund does not offset the cost to setup the array
    // anew. Much more gas efficient to overwrite the existing single item array with the new one:
    if (items.length > 1) {
      // Remove the last position of the array:
      items.pop();
    }
    else {
      // Get a new stripe, but only if there is a new stripe waiting:
      if (stripes.length != 0) {
        changeStripe();  
      }
    }

    return(allocatedItem_);
  }

  /**
  *
  * @dev Select a new stripe:
  *
  */
  function changeStripe() internal {
    
    uint256 allocatedIndex;

    if (entropyMode == 0) allocatedIndex = (_getNumberInRangeLight(stripes.length, fee) - 1);
    else if (entropyMode == 1) allocatedIndex = (_getNumberInRangeStandard(stripes.length, fee) - 1);
    else if (entropyMode == 2) allocatedIndex = (_getNumberInRangeHeavy(stripes.length, fee) - 1);
    else revert("Unrecognised entropy mode");

    uint256 chosenStripe = uint256(stripes[allocatedIndex]);

    // Populate the items for this stripe. First check if it's the last stripe.
    // A width of 0 for the final stripe means that the supply has divided perfectly
    // by the number of stripes, and the final stripe is therefore a fill width:
    if (chosenStripe == finalStripe && finalStripeWidth != 0) {

      uint8[] memory tempArray = new uint8[](finalStripeWidth);

      for(uint8 i = 0; i < uint8(finalStripeWidth);) {
        tempArray[i] = i;
        unchecked{ i++; }
      }

      items = tempArray;
    }
    else{
      items = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    }

    stripeStartId = chosenStripe * STRIPE_WIDTH;

    uint256 lastStripeIndex = stripes.length - 1;

    // When the item to remove from the array is the last item, the swap operation is unnecessary
    if (allocatedIndex != lastStripeIndex) {
      stripes[allocatedIndex] = stripes[lastStripeIndex];
    }
 
    // Remove the last position of the array:
    stripes.pop();

  }

}