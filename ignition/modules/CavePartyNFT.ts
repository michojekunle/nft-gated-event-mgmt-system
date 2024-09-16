import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CavePartyModule = buildModule("CavePartyModule", (m) => {
  
  const CaveParty = m.contract("CaveParty");

  return { CaveParty };
});

export default CavePartyModule;
