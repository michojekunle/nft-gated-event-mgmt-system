const hre = require('hardhat');

const main = async () => {
    // Get 'OnChainNFT' contract
    const nftContractFactory = await hre.ethers.getContractFactory("FluffyFury");
  
    // Deploy contract
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed;
  
    console.log("✅ Contract deployed to:", nftContract.target);
  
    // SVG image that you want to mint
    const svg = ``;
  
    // Call the mint function from our contract
    const txn = await nftContract.mint(svg);
    const txnReceipt = await txn.wait();
  
    // Get the token id of the minted NFT (using our event)
    const event = await txnReceipt.events?.find((event: any) => event.event === "Minted");
    const tokenId = event?.args["tokenId"];
  
    console.log(
      "🎨 Your minted NFT:",
      `https://testnets.opensea.io/assets/${nftContract.target}/${tokenId}`
    );
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();
  