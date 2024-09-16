import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTGatedEventManagerModule = buildModule("NFTGatedEventManagerModule", (m) => {
  
  const NFTGatedEventManager = m.contract("NFTGatedEventManager");

  return { NFTGatedEventManager };
});

export default NFTGatedEventManagerModule;
