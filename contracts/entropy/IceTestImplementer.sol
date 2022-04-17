// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/entropy/IceTestImplementer.sol)
// https://omnuslab.com/icering

/**
*
* @dev - Example contract for implementing ICE calls.
*
*/

pragma solidity ^0.8.13;

import "./IceRing.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

contract IceTestImplementer is IceRing, Ownable {

  bool private direct;

  constructor(bool _direct, address _oatContract, address _iceContract, uint256 _ethFee, uint256 _oatFee) 
    IceRing(_oatContract, _iceContract, _ethFee, _oatFee)
  {
    direct = _direct;
  }

  function getNumberInRangeLight(uint256 _upperBound) external returns(uint256 numberInRange_) {
    if (!direct) return(_getNumberInRangeOAT(NUMBER_IN_RANGE_LIGHT, _upperBound));
    else return(_getNumberInRangeETH(NUMBER_IN_RANGE_LIGHT, _upperBound));
  }

  function getNumberInRangeStandard(uint256 _upperBound) external returns(uint256 numberInRange_) {   
    if (!direct) return(_getNumberInRangeOAT(NUMBER_IN_RANGE_STANDARD, _upperBound));
    else return(_getNumberInRangeETH(NUMBER_IN_RANGE_STANDARD, _upperBound));
  }

  function getNumberInRangeHeavy(uint256 _upperBound) external returns(uint256 numberInRange_) {
    if (!direct) return(_getNumberInRangeOAT(NUMBER_IN_RANGE_HEAVY, _upperBound));
    else return(_getNumberInRangeETH(NUMBER_IN_RANGE_HEAVY, _upperBound));
  }

  function getEntropyLight() external returns(uint256 numberInRange_) {
    if (!direct) return(_getEntropyOAT(ENTROPY_LIGHT));
    else return(_getEntropyETH(ENTROPY_LIGHT));
  }

  function getEntropyStandard() external returns(uint256 numberInRange_) {
    if (!direct) return(_getEntropyOAT(ENTROPY_STANDARD));
    else return(_getEntropyETH(ENTROPY_STANDARD));
  }

  function getEntropyHeavy() external returns(uint256 numberInRange_) {
    if (!direct) return(_getEntropyOAT(ENTROPY_HEAVY));
    else return(_getEntropyETH(ENTROPY_HEAVY));
  }

  /**
  *
  * @dev Update fee:
  *
  */
  function updateETHFee(uint256 _ethFee) external onlyOwner {
    _updateETHFee(_ethFee);
  }

  /**
  *
  * @dev Update fee:
  *
  */
  function updateOATFee(uint256 _oatFee) external onlyOwner {
    _updateOATFee(_oatFee);
  }

  receive() external payable {
    require(msg.sender == owner(), "Only owner can fund contract");
  }
}