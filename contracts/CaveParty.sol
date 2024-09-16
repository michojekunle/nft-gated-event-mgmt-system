// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CaveParty is ERC721, Ownable(msg.sender) {
    // events
    event Minted(uint256 tokenId);

    // statet variables
    uint256 public totalMints = 0;
    uint256 public mintPrice = 0.0001 ether;
    uint256 public maxPerWallet = 1;
    string public assetMetadata =
        "ipfs://QmeXnyhrkEGfKzQRtusyWNFKcjyZxLcU1puRvxLkK2kTeS";

    // mappings
    mapping(address => uint256) public walletMints;

    // functions
    constructor() ERC721("CaveParty", "CPY") {}

    function _baseURI() internal view override returns (string memory) {
        return assetMetadata;
    }

    function safeMint(address to) internal {
        uint256 tokenId = totalMints;
        totalMints++;

        _safeMint(to, tokenId);
    }

    function mintToken() external payable {
        require(mintPrice == msg.value, "0.0001 ether required to mint");
        require(
            walletMints[msg.sender] <= maxPerWallet,
            "mints per wallet exceeded"
        );

        walletMints[msg.sender] += 1;
        safeMint(msg.sender);
    }

    function getMyWalletMints() external view returns (uint256) {
        return walletMints[msg.sender];
    }

    function withdrawFunds() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "withdrawal failed");
    }

    function updateMetadata(string memory _newAssetMetadata) external onlyOwner {
        require(checkMetadata(_newAssetMetadata), "Invalid asset metadata: must include 'ipfs://'");

        assetMetadata = _newAssetMetadata;
    }

    function getAssetMetadata() external view onlyOwner returns(string memory) {
        return assetMetadata;
    }

    function checkMetadata(string memory _newAssetMetadata) private pure returns (bool) {
        bytes memory metadataBytes = bytes(_newAssetMetadata);
        bytes memory ipfsBytes = bytes("ipfs://");

        if (metadataBytes.length < ipfsBytes.length) return false;

        for (uint256 i = 0; i <= metadataBytes.length - ipfsBytes.length; i++) {
            bool check = true;
            for (uint256 j = 0; j < ipfsBytes.length; j++) {
                if (metadataBytes[i + j] != ipfsBytes[j]) {
                    check = false;
                    break;
                }
            }
            if (check) {
                return true;
            }
        }

        return false;
    }
}