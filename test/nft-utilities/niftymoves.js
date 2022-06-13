const { expect } = require("chai")
const bookPriceETH = ethers.utils.parseEther("0.0001")
const bookPriceToken = 100000000
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const tokenURI = "foo"
const d = new Date()
let day = d.getDay()

describe("nifty", function () {
  let hardhatProxyRegister
  let hardhatBooks
  let owner
  let addr1
  let addr2
  let addr3
  let addr4
  let treasury
  let addrs

  beforeEach(async function () {
    ;[owner, addr1, addr2, addr3, addr4, treasury, ...addrs] =
      await ethers.getSigners()

    const Trees = await ethers.getContractFactory("EtherTree")
    hardhatTrees = await Trees.deploy()

    const nifty = await ethers.getContractFactory("NiftyMoves")
    hardhatnifty = await nifty.deploy()
  })

  context("Niftymove", function () {
    describe("Do it", function () {
      it("Normie Allocation", async () => {
        await expect(
          hardhatnifty
            .connect(addr1)
            .makeNiftyMoves(hardhatTrees.address, addr2.address, [99, 879], {}),
        ).to.be.revertedWith("Hey, one each please!")
      })
    })
  })
})
