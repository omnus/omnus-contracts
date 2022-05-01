const { expect, ...chai } = require("chai")
const BN = require("bn.js")
chai.use(require("chai-bn")(BN))
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR) // turn off warnings

describe("RandomEnd", function () {

  const BID_COUNT = 50;
  const START_PROBABILITY = 1
  const END_PROBABILITY = 90
  const STRAIGHT_LINE = 0;
  const EXPONENTIAL = 1;
  const MANUAL = 2;
  const END_PERIOD_IN_MINUTES = 180;
  const SEGMENT_IN_MINUTES = 10;

  let hhMockAuction
  let hardhatICE
  let hardhatERC20
  let owner
  let nonOwner
  let addr1
  let addr2
  let addr3
  let addr4
  let entropy1
  let signers

  let maxSupply

  beforeEach(async function () {
    ;[
      owner,
      nonOwner,
      developer,
      addr1,
      addr2,
      addr3,
      addr4,
      entropy1,
      ...signers
    ] = await ethers.getSigners()

    const ERC20 = await ethers.getContractFactory("MockERC20")
    hardhatERC20 = await ERC20.deploy()

    const ICE = await ethers.getContractFactory("Ice")
    hardhatICE = await ICE.deploy(hardhatERC20.address)

    const MockAuction = await ethers.getContractFactory("MockAuction")
    hhMockAuction = await MockAuction.deploy(
      [START_PROBABILITY * 1000, END_PROBABILITY * 1000, STRAIGHT_LINE, END_PERIOD_IN_MINUTES, SEGMENT_IN_MINUTES],
      [0],
      [hardhatERC20.address, hardhatICE.address],
      [0, 0, 0, 0]
    )

  })

  describe("Random End", function () {
    
    beforeEach(async function () {
      var tx1 = await hardhatICE
      .connect(owner)
      .addEntropy(
        entropy1.address
      )
      expect(tx1).to.emit(hardhatICE, "EntropyAdded")
      var receipt = await tx1.wait()
      expect(receipt.events[0].args._entropyAddress).to.equal(entropy1.address)

    })
    
    it("Straight line test 1", async () => {
      const MockAuction = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction.deploy(
        [START_PROBABILITY * 1000, END_PROBABILITY * 1000, STRAIGHT_LINE, END_PERIOD_IN_MINUTES, SEGMENT_IN_MINUTES],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (END_PERIOD_IN_MINUTES / SEGMENT_IN_MINUTES) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        var prob = Math.round(parseInt(receipt.events[0].args.segmentEndScore.toString()) / 1000);
        console.log(prob.toString() + "%")
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += SEGMENT_IN_MINUTES * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Straight line test 2", async () => {

      const startProbablity = 50
      const endProbability = 100
      const curveMode = STRAIGHT_LINE
      const endPeriodMins = 60
      const segmentMins = 5

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        var prob = Math.round(parseInt(receipt.events[0].args.segmentEndScore.toString()) / 1000);
        console.log(prob.toString() + "%")
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Straight line test 3", async () => {

      const startProbablity = 0
      const endProbability = 99
      const curveMode = STRAIGHT_LINE
      const endPeriodMins = 60
      const segmentMins = 5

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        var prob = Math.round(parseInt(receipt.events[0].args.segmentEndScore.toString()) / 1000);
        console.log(prob.toString() + "%")
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Straight line test 4: Horizontal line", async () => {

      const startProbablity = 20
      const endProbability = 20
      const curveMode = STRAIGHT_LINE
      const endPeriodMins = 240
      const segmentMins = 30

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        var prob = Math.round(parseInt(receipt.events[0].args.segmentEndScore.toString()) / 1000);
        console.log(prob.toString() + "%")
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Straight line test 5 - Falling line", async () => {

      const startProbablity = 50
      const endProbability = 10
      const curveMode = STRAIGHT_LINE
      const endPeriodMins = 240
      const segmentMins = 30

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        var prob = Math.round(parseInt(receipt.events[0].args.segmentEndScore.toString()) / 1000);
        console.log(prob.toString() + "%")
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Exponential Test 1", async () => {

      const startProbablity = 10
      const endProbability = 90
      const curveMode = EXPONENTIAL
      const endPeriodMins = 180
      const segmentMins = 10

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        console.log(BigInt(receipt.events[0].args.segmentEndingProbability))
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log(BigInt(receipt.events[0].args.probabilityRangeHeight)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Exponential Test 2", async () => {

      const startProbablity = 20
      const endProbability = 95
      const curveMode = EXPONENTIAL
      const endPeriodMins = 320
      const segmentMins = 10

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [0],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        console.log(BigInt(receipt.events[0].args.segmentEndingProbability))
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log(BigInt(receipt.events[0].args.probabilityRangeHeight)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Manual Test 1", async () => {

      const startProbablity = 20
      const endProbability = 95
      const curveMode = MANUAL
      const endPeriodMins = 60
      const segmentMins = 10

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [20000,20000,10000,10000,70000,95000],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        console.log(BigInt(receipt.events[0].args.segmentEndingProbability))
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log(BigInt(receipt.events[0].args.probabilityRangeHeight)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Manual Test 2", async () => {

      const startProbablity = 25
      const endProbability = 40
      const curveMode = MANUAL
      const endPeriodMins = 60
      const segmentMins = 10

      const MockAuction2 = await ethers.getContractFactory("MockAuction")
      hhMockAuction2 = await MockAuction2.deploy(
        [startProbablity * 1000, endProbability * 1000, curveMode, endPeriodMins, segmentMins],
        [25000,26000,28000,31000,35000,40000],
        [hardhatERC20.address, hardhatICE.address],
        [0, 0, 0, 0]
      )

      for (let i = 0; i < (endPeriodMins / segmentMins) * 2; i += 1) {
  
        var tx1 = await hhMockAuction2
        .connect(addr1)
        .thisIsTheEnd()  
        var receipt = await tx1.wait()
        console.log("Segment " + receipt.events[0].args.thisSegment.toString()) 
        console.log(receipt.events[0].args.checkMessage)
        console.log(receipt.events[0].args.itIsTheEnd)
        console.log(BigInt(receipt.events[0].args.segmentEndingProbability))
        console.log(BigInt(receipt.events[0].args.segmentEndScore)) 
        console.log(BigInt(receipt.events[0].args.numberInRange)) 
        console.log(BigInt(receipt.events[0].args.probabilityRangeHeight)) 
        console.log("-----") 

        var currentTimestamp = (await ethers.provider.getBlock("latest"))
          .timestamp
        currentTimestamp += segmentMins * 30
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ])
        await ethers.provider.send("evm_mine")

      }
    })

    it("Flat line testing - rising lines", async () => {

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(10000, 90000, 18) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(50000, 100000, 18) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(75000, 99000, 55) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(90000, 90100, 100) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())
      
    })

    it("Flat line testing - falling lines", async () => {

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(90000, 10000, 18) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(100000, 50000, 18) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(99000, 15000, 55) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(90100, 90000, 100) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())
      
    })

    it("Flat line testing - horizontal", async () => {

      var flatCurve = await hhMockAuction
      .connect(addr1)
      .buildStraightLine(20000, 20000, 18) 

      console.log(flatCurve[0])
      console.log(flatCurve[1].toString())
      
    })

    it("Exponential testing (rising is only option)", async () => {

      var exponentialCurve = await hhMockAuction
      .connect(addr1)
      .buildExponentialCurve(10000, 90000, 18) 

      console.log(exponentialCurve[0])
      console.log(exponentialCurve[1].toString())

      var exponentialCurve = await hhMockAuction
      .connect(addr1)
      .buildExponentialCurve(10000, 90000, 12) 

      console.log(exponentialCurve[0])
      console.log(exponentialCurve[1].toString())

      var exponentialCurve = await hhMockAuction
      .connect(addr1)
      .buildExponentialCurve(50000, 100000, 18) 

      console.log(exponentialCurve[0])
      console.log(exponentialCurve[1].toString())

      var exponentialCurve = await hhMockAuction
      .connect(addr1)
      .buildExponentialCurve(15000, 85000, 32) 

      console.log(exponentialCurve[0])
      console.log(exponentialCurve[1].toString())

      var exponentialCurve = await hhMockAuction
      .connect(addr1)
      .buildExponentialCurve(99999, 100000, 32) 

      console.log(exponentialCurve[0])
      console.log(exponentialCurve[1].toString())
      
    })

    it("Flat curve testing - Start percentage validation", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildStraightLine(110000, 50000, 18) 
      ).to.be.revertedWith("Start probability exceeds 100%")

    })

    it("Flat curve testing - End percentage validation", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildStraightLine(1, 110000, 18) 
      ).to.be.revertedWith("End probability exceeds 100%")

    })

    it("Flat curve testing - count validation", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildStraightLine(1, 90000, 0) 
      ).to.be.revertedWith("Count cannot be 0")

    })

    it("Exponential curve testing - Start percentage validation", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildExponentialCurve(110000, 50000, 18) 
      ).to.be.revertedWith("Start probability exceeds 100%")

    })

    it("Exponential curve testing - End percentage validation", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildExponentialCurve(1, 110000, 18) 
      ).to.be.revertedWith("End probability exceeds 100%")

    })

    it("Exponential curve testing - count validation", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildExponentialCurve(1, 90000, 0) 
      ).to.be.revertedWith("Count cannot be 0")

    })

    it("Exponential curve testing - only rising", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildExponentialCurve(90, 89, 2) 
      ).to.be.revertedWith("Exponential curves must increase")

    })

    it("Exponential curve testing - limited to 32 segments", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildExponentialCurve(90, 90000, 33) 
      ).to.be.revertedWith("Exponential curves limited to 32 segments")

    })

    it("Manual curve testing - start prob mismatch", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildManualCurve(10000, 90000, 2, [999, 90000]) 
      ).to.be.revertedWith("Start probability mismatch")

    })

    it("Manual curve testing - end prob mismatch", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildManualCurve(10000, 90000, 2, [10000, 12]) 
      ).to.be.revertedWith("End probability mismatch")

    })

    it("Manual curve testing - count mismatch", async () => {

      await expect(
        hhMockAuction.connect(addr1).buildManualCurve(10000, 90000, 3, [10000, 90000]) 
      ).to.be.revertedWith("Count mismatch")

    })

  })

})
