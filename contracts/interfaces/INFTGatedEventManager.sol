// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface INFTGatedEventManager {
    // Event creation: Only the owner can create an event
    function createEvent(
        string memory _eventName,
        uint256 _eventDate,
        address _nftRequired,
        uint256 _maxCapacity
    ) external;

    // Register for an event: Verifies NFT ownership
    function registerForEvent(uint256 _eventId) external;

    // Get event details by ID
    function getEventDetails(
        uint256 _eventId
    )
        external
        view
        returns (string memory, uint256, address, uint256, uint256, bool);

    // Toggle event status (activate/deactivate)
    function updateEventStatus(uint256 _eventId, bool _isActive) external;

    // Check if a user is registered for an event
    function isUserRegistered(
        uint256 _eventId,
        address _user
    ) external view returns (bool);
}
