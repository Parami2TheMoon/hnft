import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  BillboardLevel2MiningPower,
  BillboardLevel2Name,
} from '../models/hnft';
import { useCustomMetaMask } from './useCustomMetaMask';
import { HNFTCollectionContractAddress } from '../models/contract';
import ERC721HCollection from '../ERC721HCollection.json';

export interface HNFT {
  address?: string;
  balance?: number;
  description?: string;
  image: string;
  name?: string;
  tokenId?: string;
  level?: string;
  levelName?: string;
  miningPower?: number;
  onWhitelist?: boolean;
}

export const useHNFT = () => {
  const { ethereum, chainId, account, status } = useCustomMetaMask();
  const [hnft, setHNFT] = useState<HNFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === 'connected' &&
        ethereum &&
        (chainId === 1 || chainId === 5)
      ) {
        const hnftContract = new ethers.Contract(
          HNFTCollectionContractAddress[chainId],
          ERC721HCollection.abi,
          new ethers.providers.Web3Provider(ethereum).getSigner()
        );

        const balance = await hnftContract.balanceOf(account);

        const tokenId = await hnftContract.tokenOfOwnerByIndex(
          account,
          balance - 1
        );
        const tokenUri = await hnftContract.tokenURI(tokenId);

        const token = JSON.parse(atob(tokenUri.substring(29)));

        const levelString = token.level?.toString() ?? '0';

        // const price = hnftContract.level2Price(levelString);

        console.log(hnftContract, '---hnftContract---');

        const hnftData: HNFT = {
          ...token,
          // price,
          tokenId: tokenId?.toString(),
          address: HNFTCollectionContractAddress[chainId],
          balance: balance?.toNumber() ?? 0,
          level: levelString,
          levelName: BillboardLevel2Name[levelString],
          miningPower: BillboardLevel2MiningPower[levelString],
        };

        setHNFT(hnftData);
        setLoading(false);
      }
    };

    fetchData();
  }, [ethereum, chainId, account, status]);

  return {
    hnft,
    loading
  }
};
