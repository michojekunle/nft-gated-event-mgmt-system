// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IERC721} from "./IERC721.sol";

interface IFluffyFury is IERC721 {
    function mint() external payable;

    function withdrawFunds() external;

    function updateSVG(string memory _newSvg) external;

    function transferOwnership(address newOwner) external;
}
