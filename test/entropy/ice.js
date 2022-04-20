const { expect } = require("chai")
const d = new Date();
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ERC721_SUPPLY = 100;
const LIGHT_NUM_IN_RANGE = 0;
const STANDARD_NUM_IN_RANGE = 1;
const HEAVY_NUM_IN_RANGE = 2;
const LIGHT_ENTROPY = 3;
const STANDARD_ENTROPY = 4;
const HEAVY_ENTROPY = 5;
const NO_FEE = 0;
const BULK_TEST_NUMBER_IN_RANGE = 5;
const BULK_TEST_ENTROPY = 5;

let day = d.getDay();


describe.only("IceRing On-chain RNG Functionality", function () {
  let hardhatICE
  let hardhatOAT
  let hardhatRandomERC721
  let hardhatIceTester
  let owner
  let addr1
  let entropy1
  let entropy2
  let entropy3
  let treasury
  let addrs

  beforeEach(async function () {
    ;[owner, addr1, entropy1, entropy2, entropy3, treasury, ...addrs] = await ethers.getSigners()

    const OAT = await ethers.getContractFactory("OAT")
    hardhatOAT = await OAT.deploy()

    const ICE = await ethers.getContractFactory("Ice")
    hardhatICE = await ICE.deploy(hardhatOAT.address)

    hardhatFakeOAT = await OAT.deploy()

    const ERC721 = await ethers.getContractFactory("RandomlyAllocatedERC721")
    hardhatRandomERC721 = await ERC721.deploy(ERC721_SUPPLY, hardhatOAT.address, hardhatICE.address, STANDARD_NUM_IN_RANGE, NO_FEE, NO_FEE)

    const IceTest = await ethers.getContractFactory("IceTestImplementer")
    hardhatIceTester = await IceTest.deploy(false, hardhatOAT.address, hardhatICE.address, NO_FEE, NO_FEE)

    hardhatIceTesterDirect = await IceTest.deploy(true, hardhatOAT.address, hardhatICE.address, NO_FEE, NO_FEE)

    hardhatIceTesterWithFakeOat = await IceTest.deploy(false, hardhatFakeOAT.address, hardhatICE.address, NO_FEE, NO_FEE)

  })

  context("Contract Setup", function () {
    describe("Constructor", function () {
      it("Has a contract balance of 0", async () => {
        const contractBalance = await ethers.provider.getBalance(
          hardhatICE.address,
        )
        expect(contractBalance).to.equal(0)

        const contractBalance2 = await ethers.provider.getBalance(
          hardhatOAT.address,
        )
        expect(contractBalance2).to.equal(0)

        const contractBalance3 = await ethers.provider.getBalance(
          hardhatRandomERC721.address,
        )
        expect(contractBalance3).to.equal(0)

        const contractBalance4 = await ethers.provider.getBalance(
          hardhatIceTester.address,
        )
        expect(contractBalance4).to.equal(0)
      })
    })
  });


  context("Owner Functions", function () {
    describe("Adding new entropy", function () {
      it("Owner can add entropy", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        const seed1 = await hardhatICE.viewEntropyAddress(1)
        expect(seed1).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        const seed2 = await hardhatICE.viewEntropyAddress(2)
        expect(seed2).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

        const seed3 = await hardhatICE.viewEntropyAddress(3)
        expect(seed3).to.equal(entropy3.address)
        
      })

      it("Non-owner cannot add entropy", async () => {
        await expect(
          hardhatICE.connect(addr1).addEntropy(entropy1.address),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })
    })

    describe("Modifying entropy", function () {
      it("Owner can modify entropy", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        const seed1 = await hardhatICE.viewEntropyAddress(1)
        expect(seed1).to.equal(entropy1.address)


        var tx2 = await hardhatICE
        .connect(owner)
        .updateEntropy(
          1, entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyUpdated")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._index).to.equal(1)
        expect(receipt.events[0].args._newAddress).to.equal(entropy2.address)
        expect(receipt.events[0].args._oldAddress).to.equal(entropy1.address)

        const seed1new = await hardhatICE.viewEntropyAddress(1)
        expect(seed1new).to.equal(entropy2.address)
        
      })

      it("Non-owner cannot modify entropy", async () => {
        await expect(
          hardhatICE.connect(addr1).addEntropy(entropy1.address),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })
    })

    describe("Clearing entropy", function () {
      it("Owner can clear entropy", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        const seed1 = await hardhatICE.viewEntropyAddress(1)
        expect(seed1).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        const seed2 = await hardhatICE.viewEntropyAddress(2)
        expect(seed2).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

        const seed3 = await hardhatICE.viewEntropyAddress(3)
        expect(seed3).to.equal(entropy3.address)

        var tx4 = await hardhatICE
        .connect(owner)
        .deleteAllEntropy()
        expect(tx3).to.emit(hardhatICE, "entropyCleared")

        const seed1cleared = await hardhatICE.viewEntropyAddress(1)
        expect(seed1cleared).to.equal(ZERO_ADDRESS)
        const seed2cleared = await hardhatICE.viewEntropyAddress(1)
        expect(seed2cleared).to.equal(ZERO_ADDRESS)
        const seed3cleared = await hardhatICE.viewEntropyAddress(1)
        expect(seed3cleared).to.equal(ZERO_ADDRESS)

        // can add new entropy:
        var tx5 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx5).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx5.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        const seed1new = await hardhatICE.viewEntropyAddress(1)
        expect(seed1new).to.equal(entropy1.address)

      })

      it("Non-owner cannot clear entropy", async () => {
        await expect(
          hardhatICE.connect(addr1).deleteAllEntropy(),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })
    })

    describe("Modifying Fee", function () {
      it("Owner can modify base Fee", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .updateBaseFee(1000000000)
        expect(tx1).to.emit(hardhatICE, "FeeUpdated")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.oldFee).to.equal(0)
        expect(receipt.events[0].args.newFee).to.equal(1000000000)

        const fee = await hardhatICE.getOm05()
        expect(fee).to.equal(1000000000)
        
      })

      it("Owner can modify eth exponent", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .updateBaseFee(1000000000)
        expect(tx1).to.emit(hardhatICE, "FeeUpdated")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.oldFee).to.equal(0)
        expect(receipt.events[0].args.newFee).to.equal(1000000000)

        const fee = await hardhatICE.getOm05()
        expect(fee).to.equal(1000000000)

        var tx1 = await hardhatICE
        .connect(owner)
        .updateETHFeeExponent(1)
        expect(tx1).to.emit(hardhatICE, "ETHExponentUpdated")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.oldETHExponent).to.equal(0)
        expect(receipt.events[0].args.newETHExponent).to.equal(1)

        const feeExponent = await hardhatICE.getOm06()
        expect(feeExponent).to.equal(1)

        const ethFee = await hardhatICE.getEthFee()
        expect(ethFee).to.equal(10000000000)

        var tx2 = await hardhatICE
        .connect(owner)
        .updateETHFeeExponent(12)
        expect(tx2).to.emit(hardhatICE, "ETHExponentUpdated")
        var receipt2 = await tx2.wait()
        expect(receipt2.events[0].args.oldETHExponent).to.equal(1)
        expect(receipt2.events[0].args.newETHExponent).to.equal(12)

        const feeExponent2 = await hardhatICE.getOm06()
        expect(feeExponent2).to.equal(12)

        const ethFee2 = await hardhatICE.getEthFee()
        expect(BigInt(ethFee2)).to.equal(BigInt(1000000000000000000000))
        
      })

      it("Owner can modify oat exponent", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .updateBaseFee(1000000000)
        expect(tx1).to.emit(hardhatICE, "FeeUpdated")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.oldFee).to.equal(0)
        expect(receipt.events[0].args.newFee).to.equal(1000000000)

        const fee = await hardhatICE.getOm05()
        expect(fee).to.equal(1000000000)

        var tx1 = await hardhatICE
        .connect(owner)
        .updateOATFeeExponent(2)
        expect(tx1).to.emit(hardhatICE, "OATExponentUpdated")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.oldOATExponent).to.equal(0)
        expect(receipt.events[0].args.newOATExponent).to.equal(2)

        const feeExponent = await hardhatICE.getOm07()
        expect(feeExponent).to.equal(2)

        const oatFee = await hardhatICE.getOatFee()
        expect(oatFee).to.equal(100000000000)

        var tx2 = await hardhatICE
        .connect(owner)
        .updateOATFeeExponent(11)
        expect(tx2).to.emit(hardhatICE, "OATExponentUpdated")
        var receipt2 = await tx2.wait()
        expect(receipt2.events[0].args.oldOATExponent).to.equal(2)
        expect(receipt2.events[0].args.newOATExponent).to.equal(11)

        const feeExponent2 = await hardhatICE.getOm07()
        expect(feeExponent2).to.equal(11)

        const oatFee2 = await hardhatICE.getOatFee()
        expect(BigInt(oatFee2)).to.equal(BigInt(100000000000000000000))
        
      })

      it("Non-owner cannot modify base fee", async () => {
        await expect(
          hardhatICE.connect(addr1).updateBaseFee(1000000000),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })

      it("Non-owner cannot modify eth exponent", async () => {
        await expect(
          hardhatICE.connect(addr1).updateETHFeeExponent(4),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })

      it("Non-owner cannot modify oat exponent", async () => {
        await expect(
          hardhatICE.connect(addr1).updateOATFeeExponent(4),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })
    })

    describe("Modifying Treasury", function () {
      it("Owner can modify treasury", async () => {
        var tx1 = await hardhatICE
          .connect(owner)
          .setTreasury(treasury.address)
        expect(tx1).to.emit(hardhatICE, "TreasurySet")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.treasury).to.equal(treasury.address)

        const treasuryAddressParameter = await hardhatICE.treasury()
        expect(treasuryAddressParameter).to.equal(treasury.address)
        
      })

      it("Non-owner cannot modify treasury", async () => {
        await expect(
          hardhatICE.connect(addr1).setTreasury(addr1.address),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })
    })


    describe("Withdraw ERC20Spendable", function () {
      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

        await hardhatICE
        .connect(owner)
        .updateBaseFee(
          1000000000
        )

        var ownerOat = await hardhatOAT.balanceOf(owner.address)

        await hardhatIceTester
        .connect(owner)
        .updateOATFee(
          1000000000
        )

        await hardhatOAT
        .connect(owner)
        .transfer(hardhatIceTester.address, 2000000000)

        var tx1 = await hardhatIceTester.connect(owner).getEntropyStandard()
        expect(tx1).to.emit(hardhatOAT, "Transfer")

      })

      it("Non-owner cannot withdraw", async () => {

        var currentBalance = await hardhatOAT.balanceOf(addr1.address)

        expect(currentBalance).to.equal(0)

        await expect(
          hardhatICE.connect(addr1).withdrawERC20(hardhatOAT.address, 1000000000),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
        currentBalance = await hardhatOAT.balanceOf(addr1.address)

        expect(currentBalance).to.equal(0)
      })

      it("Owner can withdraw", async () => {

        var tx1 = await hardhatICE
          .connect(owner)
          .setTreasury(treasury.address)
        expect(tx1).to.emit(hardhatICE, "TreasurySet")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.treasury).to.equal(treasury.address)

        var currentBalance = BigInt(await hardhatOAT.balanceOf(owner.address))

        //expect(currentBalance).to.equal(BigInt(9999999990000000000n))

        currentBalance = BigInt(await hardhatOAT.balanceOf(treasury.address))

        expect(currentBalance).to.equal(BigInt(0n))

        var tx1 = await hardhatICE
        .connect(owner)
        .withdrawERC20(hardhatOAT.address, 1000000000)
        expect(tx1).to.emit(hardhatICE, "Transfer")

        currentBalance = BigInt(await hardhatOAT.balanceOf(owner.address))

       // expect(currentBalance).to.equal(BigInt(9999999990000000000n))

        currentBalance = BigInt(await hardhatOAT.balanceOf(treasury.address))

        expect(currentBalance).to.equal(BigInt(1000000000n))
       
      })
    })

    describe("Withdraw ETH", function () {
      beforeEach(async function () {
        await owner.sendTransaction({
          to: hardhatICE.address,
          value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
        });
      })

      it("Non-owner cannot withdraw", async () => {

        await expect(
          hardhatICE.connect(addr1).withdrawETH(1000000000000),
        ).to.be.revertedWith("Ownable: caller is not the owner")
        
      })

      it("Owner can withdraw", async () => {

        var tx1 = await hardhatICE
          .connect(owner)
          .setTreasury(treasury.address)
        expect(tx1).to.emit(hardhatICE, "TreasurySet")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.treasury).to.equal(treasury.address)

        const priorBalance = await ethers.provider.getBalance(
          treasury.address,
        )

        await expect(
          hardhatICE.connect(owner).withdrawETH(1000000000000),
        ).to.not.be.reverted
        
        const postBalance = await ethers.provider.getBalance(
          treasury.address,
        )
        expect(BigInt(postBalance)).to.equal(BigInt(priorBalance) + BigInt(1000000000000))
       
      })
    })
  })

  context("IceRing Functions", function () {

    describe("Requesting standard entropy", function () {

      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

      })

      it("Fails when token not the caller", async () => {

        await expect(
          hardhatIceTesterWithFakeOat.connect(owner).getEntropyStandard(),
        ).to.be.revertedWith("Call from unauthorised caller")

      })
    })

    describe("Requesting Standard entropy", function () {

      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        await hardhatICE
        .connect(owner)
        .updateBaseFee(
          1000000000
        )

      })

      it("Fails when token not passed and fee required", async () => {

        await expect(
          hardhatIceTester.connect(owner).getEntropyStandard(),
        ).to.be.revertedWith("Incorrect ERC20 payment")

      })

      it("Fails when ETH not passed and fee required", async () => {

        await expect(
          hardhatIceTesterDirect.connect(owner).getEntropyStandard(),
        ).to.be.revertedWith("Incorrect ETH payment")

      })

      it("Fails when token passed in but no balance", async () => {

        await hardhatIceTester
        .connect(owner)
        .updateOATFee(
          1000000000
        )

        await expect(
          hardhatIceTester.connect(owner).getEntropyStandard(),
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance")

      })

      it("Fails when ETH passed in but no balance", async () => {

        await hardhatIceTesterDirect
        .connect(owner)
        .updateETHFee(
          1000000000
        )

        await expect(
          hardhatIceTesterDirect.connect(owner).getEntropyStandard(),
        ).to.be.revertedWith("Transaction reverted: function call failed to execute")

      })

      it("Succeeds when token passed", async () => {

        await hardhatIceTester
        .connect(owner)
        .updateOATFee(
          1000000000
        )

        await hardhatOAT
        .connect(owner)
        .transfer(hardhatIceTester.address, 1000000000)

        var tx1 = await hardhatIceTester.connect(owner).getEntropyStandard()
        expect(tx1).to.emit(hardhatOAT, "Transfer")

      })

      it("Succeeds when ETH passed", async () => {

        await hardhatIceTesterDirect
        .connect(owner)
        .updateETHFee(
          1000000000
        )

        await owner.sendTransaction({
          to: hardhatIceTesterDirect.address,
          value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
        });

        var tx1 = await hardhatIceTesterDirect.connect(owner).getEntropyStandard()
        expect(tx1).to.emit(hardhatOAT, "Transfer")

      })
    })

    describe("TokenID Random Assignment - token relayed", function () {

      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

      })

      it("Works for full collection", async () => {

        for (let i = 0; i < ERC721_SUPPLY; i += 1) {
  
          var tx1 = await hardhatRandomERC721
          .connect(owner)
          .randomlyAllocatedMint(1)  
          var receipt = await tx1.wait()
          console.log(BigInt(receipt.events[2].args.tokenId))   

        }

        await expect(
          hardhatRandomERC721
          .connect(owner)
          .randomlyAllocatedMint(1)  
        ).to.be.reverted

      })

    })

    describe("TokenID Random Assignment - direct access", function () {

      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

      })

      it("Works for full collection", async () => {

        for (let i = 0; i < ERC721_SUPPLY; i += 1) {
  
          var tx1 = await hardhatRandomERC721
          .connect(owner)
          .randomlyAllocatedMint(0)  
          var receipt = await tx1.wait()
          console.log(BigInt(receipt.events[2].args.tokenId))   

        }

        await expect(
          hardhatRandomERC721
          .connect(owner)
          .randomlyAllocatedMint(0)  
        ).to.be.reverted

      })

    })

    describe("TokenID Random Assignment - payment required", function () {

      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        await hardhatICE
        .connect(owner)
        .updateBaseFee(
          1000000000
        )

      })

      it("Fails when token not passed and fee required", async () => {

        await expect(
          hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(1),
        ).to.be.revertedWith("Incorrect ERC20 payment")

      })

      it("Fails when token passed in but no balance", async () => {

        await hardhatRandomERC721
        .connect(owner)
        .updateOATFee(1000000000)

        await expect(
          hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance")

      })

      it("Succeeds when token passed", async () => {

        await hardhatRandomERC721
        .connect(owner)
        .updateOATFee(1000000000)

        await hardhatOAT
        .connect(owner)
        .transfer(hardhatRandomERC721.address, 20000000000)

        var tx1 = await hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(1)
        expect(tx1).to.emit(hardhatOAT, "Transfer")

      })

      it("Fails when ETH not passed (as no balance) and fee required", async () => {

        await expect(
          hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(0),
        ).to.be.revertedWith("Incorrect ETH payment")

      })

      it("Succeeds when ETH passed", async () => {

        await hardhatRandomERC721
        .connect(owner)
        .updateETHFee(1000000000)

        await owner.sendTransaction({
          to: hardhatRandomERC721.address,
          value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
        });

        var tx1 = await hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(0)  

        var tx1 = await hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(0)

      })
    })

    describe("Requesting standard entropy", function () {

      beforeEach(async function () {
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Entropy seed increments", async () => {

        var tx1 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard()
        expect(tx1).to.emit(hardhatICE, "entropyServed")

        //var entropy = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy));

        var args = await hardhatICE.getConfig()
        expect(args[2]).to.equal(10000001)
        expect(args[0]).to.equal(1)

        var tx2 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard()
        expect(tx2).to.emit(hardhatICE, "entropyServed")

        //var entropy2 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy2));

        var args2 = await hardhatICE.getConfig()
        expect(args2[2]).to.equal(10000002)
        expect(args2[0]).to.equal(2)

        var tx3 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard()
        expect(tx3).to.emit(hardhatICE, "entropyServed")

        //var entropy3 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy3));

        var args3 = await hardhatICE.getConfig()
        expect(args3[2]).to.equal(10000003)
        expect(args3[0]).to.equal(3)

        var tx4 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard()
        expect(tx4).to.emit(hardhatICE, "entropyServed")

        //var entropy4 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy4));

        var args4 = await hardhatICE.getConfig()
        expect(args4[2]).to.equal(10000004)
        expect(args4[0]).to.equal(1)

      })

      it("Heavy Mode", async () => {

        var tx1 = await hardhatIceTester
        .connect(owner)
        .getEntropyHeavy()
        expect(tx1).to.emit(hardhatICE, "entropyServed")

        //var entropy1 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy1));

        var args1 = await hardhatICE.getConfig()
        expect(args1[2]).to.equal(10000001)
        expect(args1[0]).to.equal(3)

        var tx2 = await hardhatIceTester
        .connect(owner)
        .getEntropyHeavy()
        expect(tx2).to.emit(hardhatICE, "entropyServed")

        //var entropy2 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy2));

        var args2 = await hardhatICE.getConfig()
        expect(args2[2]).to.equal(10000002)
        expect(args2[0]).to.equal(3)

      })
    })
 
    describe("Requesting standard entropy - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()
        
        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTester
          .connect(owner)
          .getEntropyStandard()
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropy()
          //console.log(BigInt(entropy));

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(2)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(postConfig[2]).to.equal("10000005")
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing light entropy - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)



      })

      it("Bulk entropy output", async () => {

        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          const priorConfig = await hardhatICE
          .connect(owner)
          .getConfig()

          var tx1 = await hardhatIceTester
          .connect(owner)
          .getEntropyLight()
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropyLight()
          //console.log(BigInt(entropy));

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(postConfig[0])
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing heavy entropy - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTester
          .connect(owner)
          .getEntropyHeavy()
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropyHeavy()
          //console.log(BigInt(entropy));

        }
        
        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(3)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesting standard entropy number in range - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTester
          .connect(owner)
          .getNumberInRangeStandard(100)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRange(100)
          //console.log(BigInt(entropy), ","); 

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(2)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing light entropy number in range - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()
        
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTester
          .connect(owner)
          .getNumberInRangeLight(100)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRangeLight(100)
          //console.log(BigInt(entropy), ","); 

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(postConfig[0])
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing heavy entropy number in range - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

       })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()
        
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTester
          .connect(owner)
          .getNumberInRangeHeavy(100)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRangeHeavy(100)
          //console.log(BigInt(entropy), ","); 
      
        
        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(3)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })

    })

    // Direct Tests

    describe("Requesting standard entropy DIRECT - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()
        
        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTesterDirect
          .connect(owner)
          .getEntropyStandard()
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropy()
          //console.log(BigInt(entropy));

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(2)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(postConfig[2]).to.equal("10000005")
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing light entropy DIRECT - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)



      })

      it("Bulk entropy output", async () => {

        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          const priorConfig = await hardhatICE
          .connect(owner)
          .getConfig()

          var tx1 = await hardhatIceTesterDirect
          .connect(owner)
          .getEntropyLight()
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropyLight()
          //console.log(BigInt(entropy));

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(postConfig[0])
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing heavy entropy DIRECT - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTesterDirect
          .connect(owner)
          .getEntropyHeavy()
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropyHeavy()
          //console.log(BigInt(entropy));

        }
        
        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(3)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesting standard entropy number in range DIRECT - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTesterDirect
          .connect(owner)
          .getNumberInRangeStandard(100)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRange(100)
          //console.log(BigInt(entropy), ","); 

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(2)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing light entropy number in range DIRECT - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

      })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()
        
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTesterDirect
          .connect(owner)
          .getNumberInRangeLight(100)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRangeLight(100)
          //console.log(BigInt(entropy), ","); 

        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(postConfig[0])
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })
    })

    describe("Requesing heavy entropy number in range DIRECT - bulk test", function () {

      beforeEach(async function () {
        
        var tx1 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy1.address
        )
        expect(tx1).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

        var tx2 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy2.address
        )
        expect(tx2).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx2.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy2.address)

        var tx3 = await hardhatICE
        .connect(owner)
        .addEntropy(
          entropy3.address
        )
        expect(tx3).to.emit(hardhatICE, "entropyAdded")
        var receipt = await tx3.wait()
        expect(receipt.events[0].args._entropyAddress).to.equal(entropy3.address)

       })

      it("Bulk entropy output", async () => {
        
        const priorConfig = await hardhatICE
        .connect(owner)
        .getConfig()
        
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTesterDirect
          .connect(owner)
          .getNumberInRangeHeavy(100)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRangeHeavy(100)
          //console.log(BigInt(entropy), ","); 
      
        
        }

        const postConfig = await hardhatICE
        .connect(owner)
        .getConfig()

        expect(priorConfig[0]).to.equal(0)
        expect(postConfig[0]).to.equal(3)
        expect(priorConfig[1]).to.equal(postConfig[1])
        expect(priorConfig[2]).to.equal(10000000)
        expect(postConfig[2]).to.equal(10000005)
        expect(priorConfig[3]).to.equal(postConfig[3])
        expect(priorConfig[4]).to.equal(postConfig[4])
        expect(priorConfig[5]).to.equal(postConfig[5])
        expect(priorConfig[6]).to.equal(postConfig[6])
      })

    })

  });
})