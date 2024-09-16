import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("NFTGatedEventManager", function () {
  async function deployNFT() {
    const NFT = await ethers.getContractFactory("CaveParty");

    const nft = await NFT.deploy();

    return { nft };
  }

  async function deployNFTGatedManager() {
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const { nft } = await deployNFT();
    const NFTGatedEventManager = await ethers.getContractFactory(
      "NFTGatedEventManager"
    );

    const nftGatedEventManager = await NFTGatedEventManager.deploy();

    return { nft, nftGatedEventManager, owner, addr1, addr2, addr3, addr4 };
  }

  describe("deployment", function () {
    it("should deploy successfully", async function () {
      const { nftGatedEventManager, owner } = await loadFixture(
        deployNFTGatedManager
      );

      expect(await nftGatedEventManager.owner()).to.eq(owner);
      expect(await nftGatedEventManager.eventIdCounter()).to.eq(0);
    });
  });

  describe("createEvent", function () {
    it("should create a new event", async function () {
      const { nft, nftGatedEventManager } = await loadFixture(
        deployNFTGatedManager
      );

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      expect(
        await nftGatedEventManager.createEvent(
          eventName,
          eventDate,
          nftRequired,
          maxCapacity
        )
      )
        .to.emit(nftGatedEventManager, "EventCreated")
        .withArgs(1, eventName, eventDate, nftRequired, maxCapacity);
    });

    it("should revert with error if date is not in future", async function () {
      const { nft, nftGatedEventManager } = await loadFixture(
        deployNFTGatedManager
      );

      const eventName = "Lagos Day Party";
      const eventDate = await time.latest();
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      expect(
        nftGatedEventManager.createEvent(
          eventName,
          eventDate,
          nftRequired,
          maxCapacity
        )
      ).to.be.revertedWith("Event date must be in the future.");
    });

    it("should revert with error if max-capacity is less than 1", async function () {
      const { nft, nftGatedEventManager } = await loadFixture(
        deployNFTGatedManager
      );

      const eventName = "Lagos Day Party";
      const eventDate = await time.increase(10e10);
      const nftRequired = await nft.getAddress();
      const maxCapacity = 0;

      expect(
        nftGatedEventManager.createEvent(
          eventName,
          eventDate,
          nftRequired,
          maxCapacity
        )
      ).to.be.revertedWith("Max capacity must be greater than zero.");
    });

    it("should revert if token address passed it not a contract", async function () {
      const { nftGatedEventManager } = await loadFixture(
        deployNFTGatedManager
      );

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = ethers.ZeroAddress;
      const maxCapacity = 5;

      expect(
        nftGatedEventManager.createEvent(
          eventName,
          eventDate,
          nftRequired,
          maxCapacity
        )
      )
        .to.be.revertedWith("Required NFT address is not a contract");
    });

    it("should revert if token address passed is not a ERC721 contract", async function () {
        const { nftGatedEventManager } = await loadFixture(
          deployNFTGatedManager
        );
  
        const eventName = "Lagos Day Party";
        const eventDate = (await time.latest()) + 3600;
        const nftRequired = await nftGatedEventManager.getAddress();
        const maxCapacity = 5;
  
        expect(
          nftGatedEventManager.createEvent(
            eventName,
            eventDate,
            nftRequired,
            maxCapacity
          )
        )
          .to.be.revertedWith("Required NFT Address is not an ERC721 contract");
      });
  });

  describe("registerForEvent", function() {
    it("should revert if event to register for is not currently active", async function() {
      const { nftGatedEventManager } = await loadFixture(deployNFTGatedManager);
       
      expect(nftGatedEventManager.registerForEvent(1)).to.be.revertedWith("Event is not active.");
    })

    it("should revert if event time has passed this done ---- after the time hash passed", async function() {
      const { nftGatedEventManager, nft } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);

      await time.increase(5000);
       
      expect(nftGatedEventManager.registerForEvent(1)).to.be.revertedWith("Event is not active.");
    })

    it("should revert if event status is inactive ---- this done after the event status has been updated", async function() {
      const { nftGatedEventManager, nft } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);

      expect(await nftGatedEventManager.updateEventStatus(0, false)).to.emit(nftGatedEventManager, "EventStatusUpdated").withArgs(0, false);
       
      expect(nftGatedEventManager.registerForEvent(1)).to.be.revertedWith("Event is not active.");
    })

    it("should revert if maxCapacity for event is reached", async function() {
      const { nftGatedEventManager, addr1, addr2, nft } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 2;

      // create the event 
      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);

      // mint nft to addresses that needs to register for event
      await nft.mintToken({value: ethers.parseEther("0.0001")});
      await nft.connect(addr1).mintToken({value: ethers.parseEther("0.0001")});
      await nft.connect(addr2).mintToken({value: ethers.parseEther("0.0001")});

      // register users for the event
      await nftGatedEventManager.registerForEvent(0);
      await nftGatedEventManager.connect(addr1).registerForEvent(0);
       
      expect(nftGatedEventManager.connect(addr2).registerForEvent(0)).to.be.revertedWith("Event is fully booked.");
    })

    it("should revert if a user tries to register twice", async function() {
      const { nftGatedEventManager, nft } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      // create the event 
      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);

      // mint nft to addresses that needs to register for event
      await nft.mintToken({value: ethers.parseEther("0.0001")});

      // register users for the event
      await nftGatedEventManager.registerForEvent(0);
       
      expect(nftGatedEventManager.registerForEvent(0)).to.be.revertedWith("You are already registered for this event.");
    })

    it("should revert if a user doesn't have the required NFT", async function() {
      const { nftGatedEventManager, nft } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      // create the event 
      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);
       
      expect(nftGatedEventManager.registerForEvent(0)).to.be.revertedWith("You do not own the required NFT.");
    })

    it("should register users for event", async function() {
      const { nftGatedEventManager, nft, owner, addr1, addr2 } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      // create the event 
      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);

      // mint nft to addresses that needs to register for event
      await nft.mintToken({value: ethers.parseEther("0.0001")});
      await nft.connect(addr1).mintToken({value: ethers.parseEther("0.0001")});
      await nft.connect(addr2).mintToken({value: ethers.parseEther("0.0001")});

      expect(await nftGatedEventManager.registerForEvent(0)).to.emit(nftGatedEventManager, "UserRegistered").withArgs(1, owner);
      expect(await nftGatedEventManager.connect(addr1).registerForEvent(0)).to.emit(nftGatedEventManager, "UserRegistered").withArgs(1, addr1);
      expect(await nftGatedEventManager.connect(addr2).registerForEvent(0)).to.emit(nftGatedEventManager, "UserRegistered").withArgs(1, addr2);

      const event1 = await nftGatedEventManager.getEventDetails(0);
      const registerCountForEvent1 = event1[4];

      expect(registerCountForEvent1).to.equal(3);
    })
  })

  describe("check if user is registered", function() {
    it("should check if a user is registered", async function() {
      const { nftGatedEventManager, nft, owner, addr1, addr2 } = await loadFixture(deployNFTGatedManager);

      const eventName = "Lagos Day Party";
      const eventDate = (await time.latest()) + 3600;
      const nftRequired = await nft.getAddress();
      const maxCapacity = 5;

      // create the event 
      await nftGatedEventManager.createEvent(eventName, eventDate, nftRequired, maxCapacity);

      // mint nft to addresses that needs to register for event
      await nft.mintToken({value: ethers.parseEther("0.0001")});

      expect(await nftGatedEventManager.registerForEvent(0)).to.emit(nftGatedEventManager, "UserRegistered").withArgs(1, owner);

      const userRegistered = await nftGatedEventManager.isUserRegistered(0, owner);

      expect(userRegistered).to.equal(true);
    })
  })
});
