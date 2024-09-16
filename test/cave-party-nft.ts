import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("CavePartyNFT", function () {
  // function to deploy NFT in test environment
  async function deployNFT() {
    const NFT = await ethers.getContractFactory("CaveParty");

    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const nft = await NFT.deploy();

    return { nft, owner, addr1, addr2, addr3, addr4 };
  }

  describe("Deployment", function () {
    it("was deployed successfully", async function () {
      const { nft, owner} = await loadFixture(deployNFT);

      expect(await nft.owner()).to.be.equal(owner);
      expect(await nft.name()).to.be.equal("CaveParty");
      expect(await nft.symbol()).to.be.equal("CPY");
      expect(await nft.totalMints()).to.be.equal(0);
      expect(await nft.maxPerWallet()).to.be.equal(1);
    });
  });

  describe("mintToken", function () {
    it("mints an nft to the specified addresses", async function () {
      const { nft, owner, addr1, addr2 } = await loadFixture(deployNFT);

      const previousOwnerBalance = await nft.balanceOf(owner);
      const previousAddr1Balance = await nft.balanceOf(addr1);

      await nft.mintToken({ value: ethers.parseEther("0.0001") });
      await nft.connect(addr1).mintToken({ value: ethers.parseEther("0.0001") });

      const newOwnerBalance = await nft.balanceOf(owner);
      const newAddr1Balance = await nft.balanceOf(addr1);

      expect(await nft.getMyWalletMints()).to.be.equal(1);
      expect(await nft.connect(addr1).getMyWalletMints()).to.be.equal(1);
      expect(await nft.connect(addr2).getMyWalletMints()).to.be.equal(0);
      expect(newOwnerBalance).to.be.greaterThan(previousOwnerBalance);
      expect(newAddr1Balance).to.be.greaterThanOrEqual(previousAddr1Balance);
    });

    it(" reverts if ether is not passed to mint function", async function () {
      const { nft } = await loadFixture(deployNFT);

      expect(nft.mintToken()).to.be.revertedWith("0.0001 ether required to mint");
    });
  });

  describe("withdraw funds", function () {
    it("reverts if there are no funds in the contract", async function () {
      const { nft } = await loadFixture(deployNFT);

      expect(nft.withdrawFunds()).to.be.revertedWith("No funds available");
    });

    it("reverts if non-owner calls the contract", async function () {
      const { nft, addr1 } = await loadFixture(deployNFT);

      expect(nft.connect(addr1).withdrawFunds()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );;
    });

    it("withdraws funds to the owner's address", async function () {
      const { nft, owner, addr1 } = await loadFixture(deployNFT);

      await nft.mintToken({ value: ethers.parseEther("0.0001") });
      await nft.connect(addr1).mintToken({ value: ethers.parseEther("0.0001") });

      const contractBalance = await ethers.provider.getBalance(nft);
      const previousOwnerBalance = await ethers.provider.getBalance(owner);

      const tx = await nft.withdrawFunds();
      const txReceipt = await tx.wait();

      const gasUsed = txReceipt!.cumulativeGasUsed;
      const effectiveGasPrice = txReceipt!.gasPrice;
      const gasCost = gasUsed * effectiveGasPrice;

      const newOwnerBalance = await ethers.provider.getBalance(owner);

      expect(newOwnerBalance).to.be.equal(
        previousOwnerBalance - gasCost + contractBalance
      );
    });
  });

  describe("transferOwnership", function() {
    it("should revert if non-owner tries to call the function", async function() {
      const {nft, addr1, addr2} = await loadFixture(deployNFT);

      expect(nft.connect(addr2).transferOwnership(addr1)).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
    })

    it("should transfer ownership to a new address", async function() {
      const { nft, addr1 } = await loadFixture(deployNFT);

      await nft.transferOwnership(addr1);

      expect(await nft.owner()).to.be.equal(addr1);
    })
  })

  describe("updateMetadata", function() {
    it("should revert if non owner calls the function", async function() {
      const { nft, addr1 } = await loadFixture(deployNFT);

      const metadata = "ipfs://QmeXnyhrkEGfKzQRtusyWNFKcjyZxLcU1puRvxLkK2kTeS";

      expect(nft.connect(addr1).updateMetadata(metadata)).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
    })

    it("should revert if invalid metadata is passed", async function() {
      const { nft } = await loadFixture(deployNFT);

      const metadata = "QmeXnyhrkEGfKzQRtusyWNFKcjyZxLcU1puRvxLkK2kTeS";

      expect(nft.updateMetadata(metadata)).to.be.revertedWith(
        "Invalid asset metadata: must include 'ipfs://'"
      );
    })

    it("should update metadata successfully", async function() {
      const { nft } = await loadFixture(deployNFT);

      const metadata = "ipfs://Qmcs26b4ph4xqNyweWciq8H6gTkhESd4yZtECVmESMWPBo";

      // for this test i had
      await nft.updateMetadata(metadata);

      expect(await nft.getAssetMetadata()).to.be.equal(metadata);
    })

    it("should revert if non-owner calls getMetdata", async function() {
      const { nft, addr1 } = await loadFixture(deployNFT);

      expect(nft.connect(addr1).getAssetMetadata()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );;
    })
  })
});