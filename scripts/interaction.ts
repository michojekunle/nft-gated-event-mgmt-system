import { ethers } from "hardhat";

async function main() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const multisigFactoryAddress = '0x3473b59C85919e4DcA209e2Bc9Aaf27Ab51a6Fa2';
    const web3CXITokenAddress = "0x072D37C74404d375Fa8B069C8aF50C0950DbF351";

    const web3CXI = await ethers.getContractAt("IERC20", web3CXITokenAddress);
    const multisigFactory = await ethers.getContractAt('IMultisigFactory', multisigFactoryAddress);

    // deploy recent multiSig clone
    const quorum = 3;
    const validSigners = [owner, addr1, addr2];

    const deployMultisigCloneTx = await multisigFactory.createMultisigClone(quorum, validSigners);
    await deployMultisigCloneTx.wait();

    console.log("DeploymultisigCloneTx", deployMultisigCloneTx);

    // get deployed multisigs
    const multisigClones = await multisigFactory.getMultisigs();

    console.log("All multisig clones for this multisig factory", multisigClones);

    // get and interact with recent deployed multisig
    const recentMultisigCloneAddress = multisigClones[multisigClones.length - 1];

    console.log("recent multisig address", recentMultisigCloneAddress)

    // get multisig contract 
    const multisig = await ethers.getContractAt('IMultisig', recentMultisigCloneAddress);

    // interact with transfer function of the deployed multisig
    // transfer erc 20token into contract
    const transferTokensTx = await web3CXI.transfer(
        multisig,
        ethers.parseUnits("100", 18)
      );
    transferTokensTx.wait();

    // get balace or recipient before transfer transaction
    const recipientbalanceBefore = await web3CXI.balanceOf(addr2);

    // initialize and approve the transfer function
    const transferAmount = ethers.parseUnits("10", 18);
    const transferTx = await multisig.transfer(transferAmount, addr2, web3CXITokenAddress);
    await transferTx.wait();

    console.log("Transfer Tx", transferTx);

    // approve transfer transaction with other valid signers
    await multisig.connect(addr1).approveTx(1);
    await multisig.connect(addr2).approveTx(1);

    const recipientbalanceAfter = await web3CXI.balanceOf(addr2);

    console.log("Recipient Balance Before transfer transaction: ", recipientbalanceBefore, "\nRecipient Balance After transfer transaction: ", recipientbalanceAfter);    

    // interact with the updatequorum of the deployed multisig
    const newQuorum = 2;
    const updateQuorumTx = await multisig.updateQuorum(newQuorum);
    await updateQuorumTx.wait();

    console.log("Update Quorum Tx", updateQuorumTx);

    await multisig.connect(addr1).approveTx(2);
    await multisig.connect(addr2).approveTx(2);

}

main().catch(error => {
    console.error(error);
})