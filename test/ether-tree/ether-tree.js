const { expect } = require("chai")
const bookPriceETH = ethers.utils.parseEther("0.0001");
const bookPriceToken = 100000000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const tokenURI = "foo"
const d = new Date();
let day = d.getDay();


describe("EtherTree", function () {
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
    ;[owner, addr1, addr2, addr3, addr4, treasury, ...addrs] = await ethers.getSigners()

    const Trees = await ethers.getContractFactory("EtherTree")
    hardhatTrees = await Trees.deploy()

    const mockERC721   = await ethers.getContractFactory("mockERC721")
    hardhatLoomlockNFT = await mockERC721.deploy()

    const mockERC20 = await ethers.getContractFactory("OAT")
    hardhatERC20 = await mockERC20.deploy(
    )

    const Ice = await ethers.getContractFactory("Ice")
    hardhatIce = await Ice.deploy(
      hardhatERC20.address
    )

    const Forest = await ethers.getContractFactory("TheForest")
    hardhatForest = await Forest.deploy(
      hardhatTrees.address,
      hardhatLoomlockNFT.address,
      owner.address,
      hardhatIce.address,
      hardhatERC20.address
    )

  })

  context("Allocation from forest", function () {
    describe("Tree Allocation", function () {
      it("Normie Allocation", async () => {
        // 1) Transfer all the ethertree items to the forest:
        for (let i = 0; i < 100; i += 1) {
          
          if (i != 5 && i != 98) {
            var tx1 = await hardhatTrees.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, hardhatForest.address, i);
          }  
        }

        // 2) Mint normie:
        var tx2 = await hardhatForest.connect(addr1).claimTree(false, {
          value: ethers.utils.parseEther("0.005"),
        });

      })

      it("Wassie Allocation", async () => {
        
        // 1) Transfer all the ethertree items to the forest:
        for (let i = 0; i < 100; i += 1) {
          
          if (i != 5 && i != 98) {
            var tx1 = await hardhatTrees.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, hardhatForest.address, i);
          }  
        }
       
        // 2) Claim tree wassie, no wassie, no workie:
        await expect(
          hardhatForest.connect(addr1).claimTree(true, {
            value: ethers.utils.parseEther("0.001"),
          }),
        ).to.be.revertedWith("Must have a wassie for this price. Pay normie price, or checkout yellowbird.ethertree.org")

        // 3) Mint wassie. Much wow.
        var txx = await hardhatLoomlockNFT.connect(addr1).safeMint();

        // 4a) Try to mint normie, get message  
        await expect(
          hardhatForest.connect(addr1).claimTree(false, {
            value: ethers.utils.parseEther("0.005"),
          }),
        ).to.be.revertedWith("You have a wassie! Press the other button it's cheaper!")

        // 4) Claim tree wassie, wassie, workie:
        await expect(
          hardhatForest.connect(addr1).claimTree(true, {
            value: ethers.utils.parseEther("0.001"),
          }),
        ).to.not.be.reverted

        // 5) Claim second tree wassie, no workie greedy wassie:
        await expect(
          hardhatForest.connect(addr1).claimTree(true, {
            value: ethers.utils.parseEther("0.001"),
          }),
        ).to.be.revertedWith("Hey, one each please!")


        // 6) Another address also need wassie:
        await expect(
          hardhatForest.connect(addr2).claimTree(true, {
            value: ethers.utils.parseEther("0.001"),
          }),
        ).to.be.revertedWith("Must have a wassie for this price. Pay normie price, or checkout yellowbird.ethertree.org")

        // 7) But can mint normie:
        await expect(
          hardhatForest.connect(addr2).claimTree(false, {
            value: ethers.utils.parseEther("0.005"),
          }),
        ).to.not.be.reverted

        // 8) But just the one:
        await expect(
          hardhatForest.connect(addr2).claimTree(false, {
            value: ethers.utils.parseEther("0.005"),
          }),
        ).to.be.revertedWith("Hey, one each please!")

        // 9) Which includes with a wassie:
        var txx = await hardhatLoomlockNFT.connect(addr2).safeMint();

        await expect(
          hardhatForest.connect(addr2).claimTree(true, {
            value: ethers.utils.parseEther("0.001"),
          }),
        ).to.be.revertedWith("Hey, one each please!")
      })

      it("Can withdraw", async () => {

        // 1) Transfer all the ethertree items to the forest:
        for (let i = 0; i < 100; i += 1) {
  
          if (i != 5 && i != 98) {
            var tx1 = await hardhatTrees.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, hardhatForest.address, i);
          }  
        }

        // 2) Mint normie:
        var tx2 = await hardhatForest.connect(addr1).claimTree(false, {
          value: ethers.utils.parseEther("0.005"),
        });

        await expect(
          hardhatForest.connect(owner).withdrawEth(ethers.utils.parseEther("0.005")),
        ).to.not.be.reverted
      })

    })
  });
})