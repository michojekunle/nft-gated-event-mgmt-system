// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC721} from "./interfaces/IERC721.sol";
import {IERC165} from "./interfaces/IERC165.sol";
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract NFTGatedEventManager is ReentrancyGuard {
    struct Event {
        string eventName; // Name of the event
        uint256 eventDate; // Event date (timestamp)
        address nftRequired; // NFT address required for this event
        bool isActive; // Event status
        uint256 maxCapacity; // Maximum number of participants allowed
        uint256 registeredCount; // Current number of participants
        mapping(address => bool) isRegistered; // Tracks users who have registered
    }

    uint256 public eventIdCounter; // Unique ID counter for events
    mapping(uint256 => Event) public events; // Maps event ID to Event struct
    address public owner; // Contract owner for event management

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function."
        );
        _;
    }

    event EventCreated(
        uint256 eventId,
        string eventName,
        uint256 eventDate,
        address nftRequired,
        uint256 maxCapacity
    );
    event UserRegistered(uint256 eventId, address user);
    event EventStatusUpdated(uint256 eventId, bool newStatus);

    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
    }

    // Event creation: Only the owner can create an event
    function createEvent(
        string memory _eventName,
        uint256 _eventDate,
        address _nftRequired,
        uint256 _maxCapacity
    ) public onlyOwner {
        require(
            _eventDate > block.timestamp,
            "Event date must be in the future."
        );
        require(_maxCapacity > 0, "Max capacity must be greater than zero.");

        // Check if the require nft address is a contract
        uint32 size;
        assembly {
            size := extcodesize(_nftRequired)
        }
        require(size > 0, "Required NFT address is not a contract");

        // Check if the nft contract supports ERC721 interface
        require(
            IERC165(_nftRequired).supportsInterface(type(IERC721).interfaceId),
            "Required NFT Address is not an ERC721 contract"
        );

        Event storage newEvent = events[eventIdCounter];
        newEvent.eventName = _eventName;
        newEvent.eventDate = _eventDate;
        newEvent.nftRequired = _nftRequired;
        newEvent.maxCapacity = _maxCapacity;
        newEvent.isActive = true;

        emit EventCreated(
            eventIdCounter,
            _eventName,
            _eventDate,
            _nftRequired,
            _maxCapacity
        );

        eventIdCounter++; // Increment event ID counter for the next event
    }

    // Register for an event: Verifies NFT ownership
    function registerForEvent(uint256 _eventId) external nonReentrant {
        Event storage currentEvent = events[_eventId];
        require(currentEvent.isActive, "Event is not active.");
        require(
            block.timestamp < currentEvent.eventDate,
            "Event registration has closed."
        );
        require(
            currentEvent.registeredCount < currentEvent.maxCapacity,
            "Event is fully booked."
        );
        require(
            !currentEvent.isRegistered[msg.sender],
            "You are already registered for this event."
        );
        require(
            IERC721(currentEvent.nftRequired).balanceOf(msg.sender) > 0,
            "You do not own the required NFT."
        );

        // Register the user
        currentEvent.isRegistered[msg.sender] = true;
        currentEvent.registeredCount++;

        emit UserRegistered(_eventId, msg.sender);
    }

    // Get event details by ID
    function getEventDetails(
        uint256 _eventId
    )
        external
        view
        returns (string memory, uint256, address, uint256, uint256, bool)
    {
        Event storage currentEvent = events[_eventId];
        return (
            currentEvent.eventName,
            currentEvent.eventDate,
            currentEvent.nftRequired,
            currentEvent.maxCapacity,
            currentEvent.registeredCount,
            currentEvent.isActive
        );
    }

    // Toggle event status (activate/deactivate)
    function updateEventStatus(
        uint256 _eventId,
        bool _isActive
    ) external onlyOwner {
        Event storage currentEvent = events[_eventId];
        currentEvent.isActive = _isActive;

        emit EventStatusUpdated(_eventId, _isActive);
    }

    // Check if a user is registered for an event
    function isUserRegistered(
        uint256 _eventId,
        address _user
    ) external view returns (bool) {
        return events[_eventId].isRegistered[_user];
    }
}
