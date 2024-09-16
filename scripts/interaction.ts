import { ethers } from "hardhat";

async function main() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  const nft_mint_price = ethers.parseEther("0.0001");

  const nftGatedContractAddress = "0xDbeaeb362f2889255b81f0d3E77F92Ee220D24Dc";
  const fluffyNFTTokenAddress = "0x8d62Cdd85BF63acD648c06b0766b33e381686DF0";
  const caveNFTTokenAddress = "0x8613BFbd4A1c460a88E6ea15cCCD7dBEa67A882d";

  const FluffyFuryNFT = await ethers.getContractAt(
    "IFluffyFury",
    fluffyNFTTokenAddress
  );
  const CavePartyNFT = await ethers.getContractAt(
    "ICaveParty",
    caveNFTTokenAddress
  );
  const nftGatedEventManager = await ethers.getContractAt(
    "INFTGatedEventManager",
    nftGatedContractAddress
  );

  // create events and log transactions
  // event one arguments
  const eventNameEventOne = "Health Summit Africa";
  const eventDateEventOne = new Date().getTime() + 3600;
  const nftRequiredEventOne = fluffyNFTTokenAddress;
  const maxCapacityEventOne = 500;

  // call transaction to create event one   
  const createEventOneTx = await nftGatedEventManager.createEvent(
    eventNameEventOne,
    eventDateEventOne,
    nftRequiredEventOne,
    maxCapacityEventOne
  );
  await createEventOneTx.wait();
  console.log("Event One creating Tx: ", createEventOneTx);

  // event two arguments 
  const eventNameEventTwo = "Web3Bridge Blockchain Conference";
  const eventDateEventTwo = new Date().getTime() + 7200;
  const nftRequiredEventTwo = caveNFTTokenAddress;
  const maxCapacityEventTwo = 5000;
  
  // call transaction to create event one   
  const createEventTwoTx = await nftGatedEventManager.createEvent(
    eventNameEventTwo,
    eventDateEventTwo,
    nftRequiredEventTwo,
    maxCapacityEventTwo
  );
  await createEventTwoTx.wait();
  console.log("Event Two creating Tx: ", createEventTwoTx);

  // get event details 
  const eventOne = await nftGatedEventManager.getEventDetails(0);
  const eventTwo = await nftGatedEventManager.getEventDetails(1);

  // log event details to console
  console.log("Event One: ", eventOne);
  console.log("Event Two: ", eventTwo);

  // mints nfts and register attendees for events
  // mints nft for event one
  const mintFluffyForOwnerTx = await FluffyFuryNFT.mint({ value: nft_mint_price });
  const mintFluffyForAddr1Tx = await FluffyFuryNFT.connect(addr1).mint({ value: nft_mint_price });

  //logs 
  console.log("Mint FluffyFury NFT For Owner Tx: ", mintFluffyForOwnerTx);
  console.log("Mint FluffyFury NFT For Addr1 Tx: ", mintFluffyForAddr1Tx);


  // registers users for event one
  const registerOwnerForEventOneTx = await nftGatedEventManager.registerForEvent(0);
  const registerAddr1ForEventOneTx = await nftGatedEventManager.connect(addr1).registerForEvent(0);

  //logs
  console.log("Register Owner For event one Tx: ", registerOwnerForEventOneTx);
  console.log("Register Addr1 For event one Tx: ", registerAddr1ForEventOneTx);

  // mints nft for event two
  const mintCavePartyNFTForOwnerTx = await CavePartyNFT.mintToken({ value: nft_mint_price });
  const mintCavePartyNFTForAddr1Tx = await CavePartyNFT.connect(addr2).mintToken({ value: nft_mint_price });

  // logs
  console.log("Mint CaveParty NFT For Owner Tx: ", mintCavePartyNFTForOwnerTx);
  console.log("Mint CaveParty NFT For Addr1 Tx: ", mintCavePartyNFTForAddr1Tx);

  // registers users for event two
  const registerOwnerForEventTwoTx = await nftGatedEventManager.registerForEvent(1);
  const registerAddr1ForEventTwoTx = await nftGatedEventManager.connect(addr2).registerForEvent(1);

  //logs
  //logs
  console.log("Register Owner For event two Tx: ", registerOwnerForEventTwoTx);
  console.log("Register Addr1 For event two Tx: ", registerAddr1ForEventTwoTx);

  const ownerBalanceBeforeWithdrawal = await ethers.provider.getBalance(owner);
  console.log("Owner balance before withdrawal: ", ethers.formatEther(ownerBalanceBeforeWithdrawal));

  // withdraws funds from nfts' to owners account
  const withdrawFundsFluffyFuryNFTTx = await CavePartyNFT.withdrawFunds();   
  const withdrawFundsCavePartyNFTTx = await FluffyFuryNFT.withdrawFunds();
  
  //logs
  console.log("withdraw Funds from FluffyFuryNFT Tx: ", withdrawFundsFluffyFuryNFTTx);
  console.log("Withdraw Funds from CavePartyNFT Tx: ", withdrawFundsCavePartyNFTTx);

  const ownerBalanceAfterWithdrawal = await ethers.provider.getBalance(owner);
  console.log("Owner balance after withdrawal: ", ethers.formatEther(ownerBalanceAfterWithdrawal));
}

main().catch((error) => {
  console.error(error);
});
