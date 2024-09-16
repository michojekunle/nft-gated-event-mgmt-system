# NFT-Gated Event Management Smart Contract

## Overview

This is an NFT-gated event management smart contract where only users who own specific NFTs can register for events. The contract allows the creation of multiple events, with each event associated with a unique NFT collection for access control. Users can register for different events, and each event has a unique token address that restricts registration to holders of that specific NFT. Events have customizable capacities, registration limits, and statuses.

### Features

- **Event Creation**: Multiple events can be created, each with its own name, date, NFT collection, and maximum capacity.
- **NFT-Gated Access**: Only users holding a specific NFT can register for the corresponding event.
- **Capacity Management**: Events can set a maximum number of participants, preventing overbooking.
- **Event Tracking**: All events are tracked, and the contract can provide details on any event, inc[luding who is regis](http://registered.Security)tered.
- **Security Features**: Ownership validation via NFTs, capacity checks, and reentrancy protection.

---

## Smart Contract Architecture

### Key Components:

- **Event Struct**: Holds the details of each event, including name, date, required NFT, and registration limits.
- **Event Creation**: Only the contract owner can create events.
- **Registration**: Users can register for an event only if they hold the NFT required for that event and if the event is not at capacity or inactive.
- **Event Status Management**: The owner can activate or deactivate events.
- **Tracking**: All events are tracked with unique IDs, and participants can check if they are registered.

---

## Prerequisites

- **Node.js** (for running the local development environment)
- **Hardhat** (for local Ethereum blockchain and contract deployment)

---

## Installation

### 1\. Clone the Repository

```
git clone https://github.com/michojekunle/nft-gated-event-mgmt-system.git
```

### 2\. Install Dependencies

```
npm install
```

This will install the necessary dependencies for running Hardhat and other too

## Contract Usage 

For NFTGatedEventManager contract check out the contracts directory for other contracts (Nft and helper contracts)

### 1\. Creating an Event (Owner Only)

After deployment, the owner (contract deployer) can create an event by calling the `createEvent` function:

```
solidity
```

Copy code

`function createEvent( string memory _eventName, uint256 _eventDate, address _nftRequired, uint256 _maxCapacity )`

Parameters:

- `_eventName`: The name of the event.
- `_eventDate`: UNIX timestamp of the event.
- `_nftRequired`: The contract address of the required NFT collection.
- `_maxCapacity`: The maximum number of participants.

Example:

```
eventManager.createEvent( "Blockchain Conference", 1726496465, // 3 days from now "0xYourNFTAddressHere", 100 );
```

### 2\. Registering for an Event (For NFT Holders)

Participants who hold the required NFT for an event can register using the `registerForEvent` function:

```
solidity
```

Copy code

`function registerForEvent(uint256 _eventId)`

- `_eventId`: The unique ID of the event for which the user is registering.

Example:

```
eventManager.registerForEvent(1); // Registers for event with ID 1
```

### 3\. Viewing Event Details

Use the `getEventDetails` function to get details of a specific event:

```
function getEventDetails(uint256 _eventId)
```

Returns:

- Event name
- Event date
- NFT address required
- Maximum capacity
- Current registered count
- Event active status

Example:

```
(string memory eventName, uint256 eventDate, address nftRequired, uint256 maxCapacity, uint256 registeredCount, bool isActive) = eventManager.getEventDetails(1);
```

### 4\. Check If a User Is Registered for an Event

You can check if a specific address is registered for a particular event using:

```
function isUserRegistered(uint256 _eventId, address _user) external view returns (bool);
```

Example:

```
bool isRegistered = eventManager.isUserRegistered(1, 0xYourUserAddressHere);
```

### 5\. Toggle Event Status (Owner Only)

The owner can activate or deactivate an event:

```
function updateEventStatus(uint256 _eventId, bool _isActive)
```

- `_eventId`: The unique ID of the event.
- `_isActive`: The new status (`true` for active, `false` for inactive).

## Security Considerations

1. **NFT Ownership Verification**: The contract checks that users own the required NFTs before they can register.
2. **Access Control**: Only the contract owner can create and manage events.
3. **Capacity Limits**: Prevents overbooking by setting a maximum capacity for each event.
4. **Registration Protection**: Each user can only register once per event to prevent double registrations.

## Testing

Unit tests ensure that the contracts behave as expected. Tests for both Ether and ERC20 staking contracts are located in the test directory.

### Running Tests

Run the following command to execute the tests:

```
npx hardhat test
```

## Deployment

You can deploy the contracts to the lisk-spolia testnet.

### Prerequisites

- An Ethereum development environment like Hardhat.
- A wallet with sufficient funds for deployment.

### Deployment Steps

1. **Set up your hardhat config and .env:**

   - Make sure to have the necessary dependencies installed

     Note: This hardhat config has setup lisk-sepolia network only, you can add other networks if you want to deploy on them

     ```
     require("@nomicfoundation/hardhat-toolbox");
     const dotenv = require("dotenv");
     dotenv.config();
     
     /** @type import('hardhat/config').HardhatUserConfig */
     module.exports = {
       solidity: "0.8.24",
       networks: {
         // for testnet
         "lisk-sepolia": {
           url: "https://rpc.sepolia-api.lisk.com",
           accounts: [process.env.WALLET_KEY],
           gasPrice: 1000000000,
         },
       },
       etherscan: {
         // Use "123" as a placeholder, because Blockscout doesn't need a real API key, and Hardhat will complain if this property isn't set.
         apiKey: {
           "lisk-sepolia": "123",
         },
         customChains: [
           {
             network: "lisk-sepolia",
             chainId: 4202,
             urls: {
               apiURL: "https://sepolia-blockscout.lisk.com/api",
               browserURL: "https://sepolia-blockscout.lisk.com",
             },
           },
         ],
       },
       sourcify: {
         enabled: false,
       },
     };
     ```

- set up your `.env`, in your `.env`

  ```
  WALLET_KEY="your-private-key"
  ```

1. **Update the deployment module**

   ```
   import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
   
   const NFTGatedEventManagerModule = buildModule("NFTGatedEventManagerModule", (m) => {
     
     const NFTGatedEventManager = m.contract("NFTGatedEventManager");
   
     return { NFTGatedEventManager };
   });
   
   export default NFTGatedEventManagerModule;
   
   ```

2. **Deploy the Contract:**

   Deploy the contract using Hardhat:

   ```
   npx hardhat ignition deploy ignition/modules/<name-of-your-module> --network lisk-sepolia
   ```

3. **Verify the Deployment:**

   Once deployed, note the contract address. You can verify the contract on Etherscan or blockscout if deployed on lisk-sepolia using:

   ```
   npx hardhat verify --network lisk-sepolia <your-contract-address> <...args>
   ```

- *Note: &lt;...args&gt; are the arguments passed to the constructor of your contract when it is being deployed*

## Interacting with the Deployed Contracts

You can use scripts to interact with the deployed contracts after they are live. The interaction scripts for this repository can be found in the scripts directory To run scripts that interact with the contracts:

```
npx hardhat run scripts/interaction.ts --network lisk-sepolia
```

## License

This project is licensed under the MIT License. Feel free to use and modify the contract.

## Contributing

Contributions are welcome! Fork the repository, make changes, and submit a pull request.

```
Thank you for reading through I really hope this helps, Happy Hacking! 🤗
```