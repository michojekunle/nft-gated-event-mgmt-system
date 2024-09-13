// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "./Base64.sol";

contract FluffyFury is ERC721URIStorage, Ownable(msg.sender) {
    event Minted(uint256 tokenId);

    uint256 private _tokenIdCounter;
    uint256 public mintPrice = 0.0001 ether; // Specify the mint price in ether
    string public svgData; // The SVG stored in the contract

    constructor(string memory initialSvg) ERC721("FluffyFury", "FFY") {
        require(bytes(initialSvg).length > 0, "SVG data cannot be empty");
        require(bytes(initialSvg).length <= 5000, "SVG data too large");
        svgData = initialSvg; // Initialize the SVG during deployment
    }

    // Modifier to check if the payment sent is correct
    modifier mintPricePaid() {
        require(msg.value == mintPrice, "Incorrect Ether amount sent");
        _;
    }

    // Converts an SVG to a Base64 string
    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(svg));
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    // Generates a tokenURI using the Base64 string as the image
    function formatTokenURI(string memory imageURI) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "Fluffy Fury", "description": "Your access into any event created using this token address", "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    // Mints the token, only anyone can mint after paying the mintPrice
    function mint() external payable mintPricePaid {
        string memory imageURI = svgToImageURI(svgData); // Use stored SVG
        string memory tokenURI = formatTokenURI(imageURI);

        _tokenIdCounter++;
        uint256 newItemId = _tokenIdCounter;

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit Minted(newItemId);
    }

    // Withdraws all funds in the contract to the owner's address
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");

        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Withdrawal failed");
    }

    // Allows the owner to update the SVG, after validating that the new SVG contains "ipfs://"
    function updateSVG(string memory _newSvg) external onlyOwner {
        require(bytes(_newSvg).length > 0, "SVG data cannot be empty");
        require(bytes(_newSvg).length <= 5000, "SVG data too large"); // Add size validation if needed

        svgData = _newSvg; // Update the SVG data
    }

    // Transfer ownership (inherited from Ownable)
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        _transferOwnership(newOwner);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}