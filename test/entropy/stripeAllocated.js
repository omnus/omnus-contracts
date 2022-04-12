const { expect } = require("chai")
const d = new Date();
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ERC721_STRIPED_SUPPLY = 320;

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
  let hardhatStripedERC721
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

    const ERC721Striped = await ethers.getContractFactory("StripeAllocatedERC721")
    hardhatStripedERC721 = await ERC721Striped.deploy(ERC721_STRIPED_SUPPLY, hardhatOAT.address, hardhatICE.address, LIGHT_NUM_IN_RANGE, NO_FEE)

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

        const contractBalance4 = await ethers.provider.getBalance(
          hardhatIceTester.address,
        )
        expect(contractBalance4).to.equal(0)

        const contractBalance5 = await ethers.provider.getBalance(
          hardhatStripedERC721.address,
        )
        expect(contractBalance5).to.equal(0)
      })
    })
  });

  context.only("Stripe Allocation Functions", function () {

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

        for (let i = 0; i < ERC721_STRIPED_SUPPLY; i += 1) {

          var tx1 = await hardhatStripedERC721
          .connect(owner)
          .randomlyAllocatedMint()  
          var receipt = await tx1.wait()
          console.log(BigInt(receipt.events[0].args.tokenId))   
          
        }

        //await expect(
        //  hardhatStripedERC721
        //  .connect(owner)
        //  .randomlyAllocatedMint()  
        //).to.be.reverted

      })

    })

  })
})