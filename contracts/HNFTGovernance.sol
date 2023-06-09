// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract HNFTGovernance {
    mapping(address => mapping(uint256 => address)) public hnft2tokenId2GovernanceToken;

    event Governance(uint256 indexed nftId, address indexed erc20Address);

    function governWith(address hnftAddress, uint256 nftId, address erc20Address) public {
        IERC721 nftAddress = IERC721(hnftAddress);
        require(nftAddress.ownerOf(nftId) == msg.sender, "Only the NFT owner can governed");
        require(hnft2tokenId2GovernanceToken[hnftAddress][nftId] == address(0), "NFT has become governed");
        hnft2tokenId2GovernanceToken[hnftAddress][nftId] = erc20Address;

        emit Governance(nftId, erc20Address);
    }

    function getGovernanceToken(address hnftAddress, uint256 nftId) public view returns (address) {
        return hnft2tokenId2GovernanceToken[hnftAddress][nftId];
    }
}