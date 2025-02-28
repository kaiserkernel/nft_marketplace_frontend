# Workflow

## Step 1 : NFT Minting (Mining) on BSC
To create and mint NFTs on BSC, you'll need to develop smart contract.
The process involves writing the contract in Solidity, deploying it to BSC, and allowing users to interact with it.

### Parameters to Define for Mining NFT
- Mining Fee
- Max Mintable NFTs
- Metadata storage
- Royalties
- Whitelist

#### Step 1 - Create Smart Contract
Your smart contract will need to inherit the base implementations from libraries like __OpenZeppelin__ which already have most of the functionality you need to handle NFT creation, metadata, and transfers.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, ERC721Royalty, Ownable {
    uint256 private _tokenIdCounter = 0;
    uint256 public miningFee = 0.01 ether;

    // Maximum NFTs that can be minted
    uint256 public maxMintableNFTs = 10000;
    // Keep the track of number of NFTs minted.
    uint256 public totalMinted = 0;
    // Define a base URI for the metadata
    string private _baseTokenURI = "https://ipfs.io/ipfs/";
    // Royalty is 5% (500/10000)
    uint96 public royaltyFee = 500; 

    // Whitelist mapping to allow only certain addresses to mint
    mapping(address => bool) public whitelist;

    // Events for logging purposes
    event AddedToWhitelist(address indexed user);
    event RemovedFromWhitelist(address indexed user);
    event Minted(address indexed to, uint256 indexed tokenId);

    constructor() ERC721("MyNFT", "MNFT") {}

    // Function to add an address to the whitelist (only by contract owner)
    function addToWhitelist(address user) public onlyOwner {
        whitelist[user] = true;
        emit AddedToWhitelist(user);
    }

    // Function to remove an address from the whitelist (only by contract owner)
    function removeFromWhitelist(address user) public onlyOwner {
        whitelist[user] = false;
        emit RemovedFromWhitelist(user);
    }
    
    // Override the function to set royalty information
    function setRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    // Function to set the base URI for metadata
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    // returns the base URL where metadata is stored (in this case, it’s an IPFS URL).
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // Mint function to create a new NFT
    function mint(address to) public {
        // Ensure the sender is whitelisted
        require(whitelist[msg.sender], "Address not whitelisted");
        // Ensure there is space to mint more NFTs
        require(totalMinted < maxMintableNFTs, "Max mintable NFTs reached");
        // Ensure the correct mining fee is sent with the transaction
        require(msg.value == miningFee, "Incorrect mining fee");

        // Mint the NFT and set the token URI
        uint256 tokenId = _tokenIdCounter;
        _mint(to, tokenId);

        // Concatenate IPFS hash with token ID - constructing a URL that will serve as the token URI - (use your actual IPFS hash here)
        string memory tokenURI = string(abi.encodePacked(_baseTokenURI, "your_ipfs_hash_", uint2str(tokenId)));
        // Set the token URI - responsible for associating the metadata with the NFT
        _setTokenURI(tokenId, tokenURI);

        // Set royalty for creator on mint
        _setDefaultRoyalty(to, royaltyFee);  

        _tokenIdCounter++;
        totalMinted++;

        // Emit the Minted event
        emit Minted(to, tokenId);
    }

    // Helper function to convert uint256 to string for token URI
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 temp = _i;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory _str = new bytes(digits);
        uint256 index = digits - 1;
        temp = _i;
        while (temp != 0) {
            _str[index--] = bytes1(uint8(48 + temp % 10));
            temp /= 10;
        }
        return string(_str);
    }

    // Function to withdraw the funds (mining fees) collected by the contract
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Function to check if an address is whitelisted
    function isWhitelisted(address user) public view returns (bool) {
        return whitelist[user];
    }
}
```
#### Step 2 - Frontend Integration
Integrate __NFT minting and transfer__ functionality into a __React frontend using Ethers.js__
#### Step 3 - Deploy NFT Smart Contract on Ethereum
- Install dependency
```
npm install -g hardhat
npm install --save-dev hardhat @openzeppelin/contracts dotenv
```
- Update hardhat.config.js
- Create ``.env`` file
#### Step 4 - Write the Deployment Script
#### Step 5 - Compile the Smart Contract
#### Step 6 - Deploy to Goerli
#### Step 7 - Verify the Contract on Etherscan
## Step 2 : NFT Collection
For your NFT collection, you'll need to organize your minted NFTs by traits, rarity, and categories.

### Parameters for collection
- Collection Name & Description
- NFT Traits
- Rarity Distribution

#### Step 1 - Define NFT Collection Structure
Each NFT can have a ``collectionId`` to link it to a specific collection.
Create collections with metadata like __name__, __description__, __max supply__, etc.

#### Step 2 - Write Smart Contract for the NFT Collection
- Create the collection
- Mint new NFTs
- Set the metadata for each NFT
- Set and manage royalities
- Allow transfer of the NFT
- Whitelist addresses for exclusive minting
```solidity
// Struct to define a Collection
struct Collection {
    string name;            // Name of the collection
    string description;     // Description of the collection
    uint256 maxSupply;      // Max supply of NFTs in the collection
    uint256 mintedSupply;   // Number of NFTs minted in the collection
    string coverImage;      // URL to the cover image representing the collection
    address creator;        // Creator/owner of the collection   
}

// Mapping of collectionId to Collection data
mapping(uint256 => Collection) public collections;

// Mapping of tokenId to collectionId
mapping(uint256 => uint256) public tokenIdCollection;

// Update Minted Event log
event Minted(address indexed to, uint256 indexed tokenId, uint256 indexed collectionId);

// Function to create a new collection (only accessible by the owner of the contract)
function createCollection(
    uint256 collectionId,
    string memory name,
    string memory description,
    uint256 maxSupply,
    string memory coverImage
) public onlyOwner {
    // Ensure the collection doesn't already exist
    require(collections[collectionId].maxSupply === 0, "Collection already exist");

    collections[collectionId] = Collection({
        name: name,
        description: description,
        maxSupply: maxSupply,
        mintedSupply: 0,
        coverImage: coverImage,
        creator: msg.sender
    })
}

// Update mint function - add collectionId parameter
funtion mint(address to, uint256 collectionId) {
        ...
    // Ensure the collection exists
    require(collections[collectionId].maxSupply > 0, "Collection does not exist");
    // Ensure there is space in the collection for more NFTs
    require(collections[collectionId].minSupply < collections[collectionId].maxSupply, "Collection reached max supply");
    ...

    // Assign the NFT to the collection
    tokenIdToCollection[tokenId] = collectionId;

    // Update the minted supply of the collection
    collections[collectionId].mintedSupply++;

    // update emit minted
    emit Minted(to, tokenId, collectionId);
}

// Function to get metadata of a collection ( for frontend display )
function getCollectionMetadata(uint256 collectionId) public view returns (Collection memory) {
    return collections[collectionId];
}

// Function to get the collectionId for a specific tokenId
function getTokenCollection(uint256 tokenId) public view returns (uint256) {
    return tokenIdCollection[tokenId];
}

```
#### Step 3 - Integrate Frontend

#### Step 4 - Deploy the Smart Contract
eg: Hardhat
#### Step 5 - Create Frontend for Interacting with the Collection

## Step 3 : NFT Auction System on BSC
You’ll need a smart contract that facilitates bidding, handles auction durations, and determines the highest bidder at the end of the auction.

### Paramters to Define for Auctions
- Auction Start Time
- Auction End Time
- Starting Bid : minimum price for auction
- Bid increment : Define how much each new bid must be higher than the previous bid
- Reserve Price
- Auction Fee : A percentage fee that the platform takes from the auction proceeds


## Step 4 : NFT Explorer on BSC
The NFT Explorer allows users to browse through all minted NFTs, search throught collections, view auction details, and explore metadata such as trait and rarity.

### Parameters for the Explorer
- Search Filters
- NFT Details
- Transaction Histroy

## Step 5 : Integration with User Wallets (MetaMask/WalletConnect)

### Key Features to Implement
- Allow users to connect their wallet to platform.
- Enable them to mint NFTs, place bids, or buy NFTs.
- Securely sign blockchain transactions directly from their wallet.