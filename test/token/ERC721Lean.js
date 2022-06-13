const { expect, ...chai } = require("chai")
const BN = require("bn.js")
chai.use(require("chai-bn")(BN))
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR) // turn off warnings

describe.only("ERC721Lean", function () {
  let hhMockERCLean
  let owner
  let nonOwner
  let addr1
  let addr2
  let addr3
  let addr4
  let signers

  let maxSupply

  beforeEach(async function () {
    ;[owner, nonOwner, developer, addr1, addr2, addr3, addr4, ...signers] =
      await ethers.getSigners()

    const lean = await ethers.getContractFactory("mockERC721Lean2")
    hhMockERCLean = await lean.deploy()
  })

  describe("Mint", function () {
    beforeEach(async function () {
      //
    })

    it("Mint 100", async () => {
      await expect(hhMockERCLean.connect(addr1).gimme100IWannaPlay()).to.not.be
        .reverted
    })

    it("Mint 1", async () => {
      await expect(hhMockERCLean.connect(addr1).safeMint()).to.not.be.reverted
    })

    it("Mint 3", async () => {
      await expect(hhMockERCLean.connect(addr1).safeMint()).to.not.be.reverted

      await expect(hhMockERCLean.connect(addr1).safeMint()).to.not.be.reverted

      await expect(hhMockERCLean.connect(addr1).safeMint()).to.not.be.reverted
    })

    it("Mint 40 transfer 40", async () => {
      for (let i = 0; i < 40; i += 1) {
        await expect(hhMockERCLean.connect(addr1).safeMint()).to.not.be.reverted
      }

      expect(await hhMockERCLean.balanceOf(addr1.address)).to.equal(40)

      expect(await hhMockERCLean.ownerOf(1)).to.equal(addr1.address)

      expect(await hhMockERCLean.ownerOf(39)).to.equal(addr1.address)

      await expect(
        hhMockERCLean
          .connect(addr1)
          .transferBag(
            addr1.address,
            addr2.address,
            [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
              19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
              35, 36, 37, 38, 39,
            ],
          ),
      ).to.not.be.reverted

      expect(await hhMockERCLean.balanceOf(addr1.address)).to.equal(0)

      expect(await hhMockERCLean.balanceOf(addr2.address)).to.equal(40)

      expect(await hhMockERCLean.ownerOf(1)).to.equal(addr2.address)

      expect(await hhMockERCLean.ownerOf(39)).to.equal(addr2.address)
    })
  })
})
