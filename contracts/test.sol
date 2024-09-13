// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "./interfaces/IERC721.sol";

contract NFTGatedEvent {
    // state variables
    address owner;
    IERC721 tokenAddress;
    uint totalRegistrations;

    struct Event {
        uint256 eventId;
        string title;
        string description;
    }

    // custom errors
    error YouAreNotTheOwner();
    error ZeroAddressNotAllowed();
    error AccessDeniedRequiredNFTNotFound();
    error UserAlreadyRegistered();
    error UserCheckedInAlready();
    error UserNotRegistered();

    // events
    event NewRegistrationConfirmed(address indexed user);
    event UserCheckedIn();

    // mappings
    mapping(address => bool) registered;
    mapping(address => bool) checkedIn;
    mapping(uint => Event) events;

    // functions
    constructor(address _tokenAddress) {
        owner = msg.sender;
        tokenAddress = IERC721(_tokenAddress);
    }

    function registerForEvent() external {
        if (msg.sender == address(0)) revert ZeroAddressNotAllowed();
        _ownsNFT(msg.sender);
        if (registered[msg.sender]) revert UserAlreadyRegistered();

        registered[msg.sender] = true;

        ++totalRegistrations;

        emit NewRegistrationConfirmed(msg.sender);
    }

    function checkInToEvent() external {
        if (msg.sender == address(0)) revert ZeroAddressNotAllowed();
        _ownsNFT(msg.sender);
        if (!registered[msg.sender]) revert UserNotRegistered();
        if (checkedIn[msg.sender]) revert UserCheckedInAlready();

        checkedIn[msg.sender] = true;

        emit UserCheckedIn();
    }

    function totalRegistered() external view returns (uint) {
        return totalRegistrations;
    }

    // private functions
    function _onlyOwner() private view {
        if (msg.sender != owner) revert YouAreNotTheOwner();
    }

    function _ownsNFT(address _user) private view {
        if (tokenAddress.balanceOf(_user) < 0)
            revert AccessDeniedRequiredNFTNotFound();
    }
}
