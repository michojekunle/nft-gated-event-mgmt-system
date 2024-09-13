import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FluffyFuryModule = buildModule("FluffyFuryModule", (m) => {
  
  const FluffyFury = m.contract("NFTGatedEventManager");

  return { FluffyFury };
});

export default FluffyFuryModule;
