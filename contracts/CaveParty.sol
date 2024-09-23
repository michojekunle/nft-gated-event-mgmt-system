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
        "https://gateway.pinata.cloud/ipfs/Qmcs26b4ph4xqNyweWciq8H6gTkhESd4yZtECVmESMWPBo";

    // mappings
    mapping(address => uint256) public walletMints;

    // functions
    constructor() ERC721("CaveParty", "CPY") {}

    function _baseURI() internal view override returns (string memory) {
        return assetMetadata;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return assetMetadata;
    }

    function safeMint(address to) internal {
        uint256 tokenId = totalMints;
        totalMints++;

        _safeMint(to, tokenId);
    }

    function mintToken() external payable {
        require(mintPrice >= msg.value, "0.0001 ether required to mint");
        require(
            walletMints[msg.sender] < maxPerWallet,
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

    function updateMetadata(
        string memory _newAssetMetadata
    ) external onlyOwner {
        assetMetadata = _newAssetMetadata;
    }

    function getAssetMetadata()
        external
        view
        onlyOwner
        returns (string memory)
    {
        return assetMetadata;
    }
}
