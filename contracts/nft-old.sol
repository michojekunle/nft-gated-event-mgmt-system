// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FluffyFur is ERC721, ERC721URIStorage, Ownable(msg.sender) {
    // events
    event Minted(uint256 tokenId);

    // statet variables
    uint256 public totalMints = 0;
    uint256 public mintPrice = 0.001 ether;
    uint256 public maxSupply = 280;
    uint256 public maxPerWallet = 1;
    string private assetMetadata =
        "ipfs://QmfAYUMMB7NE9NQk2P91GbyWrEm1XWTGSoCcTFhZDZgFwD";

    // mappings
    mapping(address => uint256) walletMints;

    // functions
    constructor() ERC721("FluffyFury", "FFY") {}

    function _baseURI() internal view override returns (string memory) {
        return assetMetadata;
    }

    function safeMint(address to) internal {
        uint256 tokenId = totalMints;
        totalMints++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, assetMetadata);
    }

    function mintToken() external payable {
        require(mintPrice == msg.value, "wrong amount sent");
        require(
            walletMints[msg.sender] <= maxPerWallet,
            "mints per wallet exceeded"
        );

        walletMints[msg.sender] += 1;
        safeMint(msg.sender);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getMyWalletMints() external view returns (uint256) {
        return walletMints[msg.sender];
    }

    function withdrawFunds() external {
        require(msg.sender == owner(), "You're not the owner");

        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "withdrawal failed");
    }

    function updateMetadata(string memory _newAssetMetadata) external {
        require(msg.sender == owner(), "You're not the owner");
        require(checkMetadata(_newAssetMetadata), "Invalid asset metadata: must include 'ipfs://'");

        assetMetadata = _newAssetMetadata;
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
