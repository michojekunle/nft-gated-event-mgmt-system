// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTGatedEventManager is ReentrancyGuard {
    struct Event {
        string eventName;
        uint256 eventDate;
        address nftRequired;
        bool isActive;
        uint256 maxCapacity;
        uint256 registeredCount;
        bool supportsERC721;
        address[] attendees;
    }
    
    mapping(uint256 => mapping (address => bool)) public isUserRegistered; // Tracks users who have registered
    uint256 public eventIdCounter;
    mapping(uint256 => Event) public events;
    address public owner;

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
    event UserRegistered(uint256 eventId, address indexed user);
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
        require(
            _nftRequired.code.length > 0,
            "Required NFT address is not a contract"
        );

        bool supportsERC721 = IERC165(_nftRequired).supportsInterface(
            type(IERC721).interfaceId
        );
        require(
            supportsERC721,
            "Required NFT Address is not an ERC721 contract"
        );

        Event storage newEvent = events[eventIdCounter];
        newEvent.eventName = _eventName;
        newEvent.eventDate = _eventDate;
        newEvent.nftRequired = _nftRequired;
        newEvent.maxCapacity = _maxCapacity;
        newEvent.isActive = true;
        newEvent.supportsERC721 = supportsERC721;

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
            !isUserRegistered[_eventId][msg.sender],
            "You are already registered for this event."
        );
        require(
            IERC721(currentEvent.nftRequired).balanceOf(msg.sender) > 0,
            "You do not own the required NFT."
        );

        currentEvent.attendees.push(msg.sender);
        isUserRegistered[_eventId][msg.sender] = true;
        currentEvent.registeredCount++;

        emit UserRegistered(_eventId, msg.sender);
    }

    // Get event details by ID
    function getEventDetails(
        uint256 _eventId
    )
        external
        view
        returns (
            string memory,
            uint256,
            address,
            uint256,
            uint256,
            bool,
            bool,
            address[] memory
        )
    {
        Event storage currentEvent = events[_eventId];
        return (
            currentEvent.eventName,
            currentEvent.eventDate,
            currentEvent.nftRequired,
            currentEvent.maxCapacity,
            currentEvent.registeredCount,
            currentEvent.isActive,
            currentEvent.supportsERC721,
            currentEvent.attendees
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

    function deactivateExpiredEvents() external {
        for (uint256 i = 0; i < eventIdCounter; i++) {
            Event storage currentEvent = events[i];
            if (
                currentEvent.isActive &&
                block.timestamp > currentEvent.eventDate
            ) {
                currentEvent.isActive = false;
                emit EventStatusUpdated(i, false);
            }
        }
    }
}
