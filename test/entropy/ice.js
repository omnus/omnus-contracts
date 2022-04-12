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
const BULK_TEST_NUMBER_IN_RANGE = 1;
const BULK_TEST_ENTROPY = 1;

let day = d.getDay();


describe("IceRing On-chain RNG Functionality", function () {
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
    hardhatRandomERC721 = await ERC721.deploy(ERC721_SUPPLY, hardhatOAT.address, hardhatICE.address, LIGHT_NUM_IN_RANGE, NO_FEE)

    const IceTest = await ethers.getContractFactory("IceTestImplementer")
    hardhatIceTester = await IceTest.deploy(hardhatOAT.address, hardhatICE.address)

    hardhatIceTesterWithFakeOat = await IceTest.deploy(hardhatFakeOAT.address, hardhatICE.address)

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
      it("Owner can modify Fee", async () => {

        var tx1 = await hardhatICE
        .connect(owner)
        .updateFee(10000000000)
        expect(tx1).to.emit(hardhatICE, "FeeUpdated")
        var receipt = await tx1.wait()
        expect(receipt.events[0].args.oldFee).to.equal(0)
        expect(receipt.events[0].args.newFee).to.equal(10000000000)

        const fee = await hardhatICE.getOm05()
        expect(fee).to.equal(10000000000)
        
      })

      it("Non-owner cannot modify entropy", async () => {
        await expect(
          hardhatICE.connect(addr1).updateFee(10000000000),
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
        .updateFee(
          10000000000
        )

        await hardhatRandomERC721
        .connect(owner)
        .updateFee(10000000000)

        await hardhatOAT
        .connect(owner)
        .transfer(hardhatRandomERC721.address, 10000000000)

        var tx1 = await hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint()
        expect(tx1).to.emit(hardhatOAT, "Transfer")

      })

      it("Non-owner cannot withdraw", async () => {

        var currentBalance = await hardhatOAT.balanceOf(addr1.address)

        expect(currentBalance).to.equal(0)

        await expect(
          hardhatICE.connect(addr1).withdrawERC20(hardhatOAT.address, 10000000000),
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
        .withdrawERC20(hardhatOAT.address, 10000000000)
        expect(tx1).to.emit(hardhatICE, "Transfer")

        currentBalance = BigInt(await hardhatOAT.balanceOf(owner.address))

       // expect(currentBalance).to.equal(BigInt(9999999990000000000n))

        currentBalance = BigInt(await hardhatOAT.balanceOf(treasury.address))

        expect(currentBalance).to.equal(BigInt(10000000000n))
       
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
          hardhatIceTesterWithFakeOat.connect(owner).getEntropyStandard(0),
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
        .updateFee(
          10000000000
        )

      })

      it("Fails when token not passed and fee required", async () => {

        await expect(
          hardhatIceTester.connect(owner).getEntropyStandard(0),
        ).to.be.revertedWith("Incorrect ERC20 payment")

      })

      it("Fails when token passed in but no balance", async () => {

        await expect(
          hardhatIceTester.connect(owner).getEntropyStandard(10000000000),
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance")

      })

      it("Succeeds when token passed", async () => {

        await hardhatOAT
        .connect(owner)
        .transfer(hardhatIceTester.address, 10000000000)

        var tx1 = await hardhatIceTester.connect(owner).getEntropyStandard(10000000000)
        expect(tx1).to.emit(hardhatOAT, "Transfer")

      })
    })

    describe("TokenID Random Assignment", function () {

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
          .randomlyAllocatedMint()  
          var receipt = await tx1.wait()
          console.log(BigInt(receipt.events[0].args.tokenId))   

        }

        await expect(
          hardhatRandomERC721
          .connect(owner)
          .randomlyAllocatedMint()  
        ).to.be.reverted

      })

      it("Multiload of items works", async () => {

        const ERC721 = await ethers.getContractFactory("RandomlyAllocatedERC721")
        hardhatRandomERC721LargeSupply = await ERC721.deploy(5050, hardhatOAT.address, hardhatICE.address, LIGHT_NUM_IN_RANGE, NO_FEE)
        
        var remainingSupply = await hardhatRandomERC721LargeSupply.connect(owner).remainingSupplyToLoad()
        var continueLoad = await hardhatRandomERC721LargeSupply.connect(owner).continueLoadFromId()
        var loadedItems = await hardhatRandomERC721LargeSupply.connect(owner)._remainingItems()
        expect(remainingSupply).to.equal(2550)
        expect(continueLoad).to.equal(2500)
        expect(loadedItems).to.equal(2500)

        await hardhatRandomERC721LargeSupply.connect(owner)._loadSupply()

        remainingSupply = await hardhatRandomERC721LargeSupply.connect(owner).remainingSupplyToLoad()
        continueLoad = await hardhatRandomERC721LargeSupply.connect(owner).continueLoadFromId()
        loadedItems = await hardhatRandomERC721LargeSupply.connect(owner)._remainingItems()
        expect(remainingSupply).to.equal(50)
        expect(continueLoad).to.equal(5000)
        expect(loadedItems).to.equal(5000)

        await hardhatRandomERC721LargeSupply.connect(owner)._loadSupply()

        remainingSupply = await hardhatRandomERC721LargeSupply.connect(owner).remainingSupplyToLoad()
        continueLoad = await hardhatRandomERC721LargeSupply.connect(owner).continueLoadFromId()
        loadedItems = await hardhatRandomERC721LargeSupply.connect(owner)._remainingItems()
        expect(remainingSupply).to.equal(0)
        expect(continueLoad).to.equal(5050)
        expect(loadedItems).to.equal(5050)

        await expect(
          hardhatRandomERC721LargeSupply
          .connect(owner)
          ._loadSupply()  
        ).to.be.revertedWith("Load complete");

        console.log(await hardhatRandomERC721LargeSupply.connect(owner)._itemsArray())

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
        .updateFee(
          10000000000
        )

      })

      it("Fails when token not passed and fee required", async () => {

        await expect(
          hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint(),
        ).to.be.revertedWith("Incorrect ERC20 payment")

      })

      it("Fails when token passed in but no balance", async () => {

        await hardhatRandomERC721
        .connect(owner)
        .updateFee(10000000000)

        await expect(
          hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint()
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance")

      })

      it("Succeeds when token passed", async () => {

        await hardhatRandomERC721
        .connect(owner)
        .updateFee(10000000000)

        await hardhatOAT
        .connect(owner)
        .transfer(hardhatRandomERC721.address, 10000000000)

        var tx1 = await hardhatRandomERC721
        .connect(owner)
        .randomlyAllocatedMint()
        expect(tx1).to.emit(hardhatOAT, "Transfer")

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
        .getEntropyStandard(0)
        expect(tx1).to.emit(hardhatICE, "entropyServed")

        //var entropy = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy));

        var args = await hardhatICE.getConfig()
        expect(args[2]).to.equal(10000001)
        expect(args[0]).to.equal(1)

        var tx2 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard(0)
        expect(tx2).to.emit(hardhatICE, "entropyServed")

        //var entropy2 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy2));

        var args2 = await hardhatICE.getConfig()
        expect(args2[2]).to.equal(10000002)
        expect(args2[0]).to.equal(2)

        var tx3 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard(0)
        expect(tx3).to.emit(hardhatICE, "entropyServed")

        //var entropy3 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy3));

        var args3 = await hardhatICE.getConfig()
        expect(args3[2]).to.equal(10000003)
        expect(args3[0]).to.equal(3)

        var tx4 = await hardhatIceTester
        .connect(owner)
        .getEntropyStandard(0)
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
        .getEntropyHeavy(0)
        expect(tx1).to.emit(hardhatICE, "entropyServed")

        //var entropy1 = await hardhatICE.repeatLastGetEntropy()
        //console.log(BigInt(entropy1));

        var args1 = await hardhatICE.getConfig()
        expect(args1[2]).to.equal(10000001)
        expect(args1[0]).to.equal(3)

        var tx2 = await hardhatIceTester
        .connect(owner)
        .getEntropyHeavy(0)
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
        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTester
          .connect(owner)
          .getEntropyStandard(0)
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropy()
          //console.log(BigInt(entropy));

        }
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
        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTester
          .connect(owner)
          .getEntropyLight(0)
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropyLight()
          //console.log(BigInt(entropy));

        }
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
        for (let i = 0; i < BULK_TEST_ENTROPY; i += 1) {
  
          var tx1 = await hardhatIceTester
          .connect(owner)
          .getEntropyHeavy(0)
          expect(tx1).to.emit(hardhatICE, "entropyServed")

          //var entropy = await hardhatICE.repeatLastGetEntropyHeavy()
          //console.log(BigInt(entropy));

        }
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
        
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTester
          .connect(owner)
          .getNumberInRangeStandard(100, 0)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRange(100)
          //console.log(BigInt(entropy), ","); 

        }
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
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTester
          .connect(owner)
          .getNumberInRangeLight(100, 0)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRangeLight(100)
          //console.log(BigInt(entropy), ","); 

        }
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
        for (let i = 0; i < BULK_TEST_NUMBER_IN_RANGE; i += 1) {
  
          await hardhatIceTester
          .connect(owner)
          .getNumberInRangeHeavy(100, 0)
  
          //var entropy = await hardhatICE.repeatLastGetNumberInRangeHeavy(100)
          //console.log(BigInt(entropy), ","); 

        }
      })
    })
  });
})