// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "./IERC721.sol";

interface ICaveParty is IERC721 {
    function getAssetMetadata() external view returns (string memory);

    function updateMetadata(string memory _newAssetMetadata) external;

    function withdrawFunds() external;

    function getMyWalletMints() external view returns (uint256);

    function mintToken() external payable;
}
