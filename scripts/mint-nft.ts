
async function main() {
  // Get 'FluffyFury' contract
  const fluffyFuryConractAddress = "";
  const fluffyFury = await hre.ethers.getContractAt(
    "IFluffyFury",
    fluffyFuryConractAddress
  );

  // SVG image that you want to mint
  const svg = ``;

  // Call the mint function from our contract
  const txn = await fluffyFury.mint(svg);
  const txnReceipt = await txn.wait();

  // Get the token id of the minted NFT (using our event)
  const event = await txnReceipt.events?.find(
    (event: any) => event.event === "Minted"
  );
  const tokenId = event?.args["tokenId"];

  console.log(
    "🎨 Your minted NFT:",
    `https://testnets.opensea.io/assets/${fluffyFuryConractAddress}/${tokenId}`
  );
};

main().catch((error: any) => {
  console.log(error);
  process.exit(1);
});
