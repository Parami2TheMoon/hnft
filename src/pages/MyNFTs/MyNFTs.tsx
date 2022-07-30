import { Button, Card, Typography, Image, Spin } from 'antd';
import { ethers } from 'ethers';
import { useMetaMask } from 'metamask-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOpenseaApi } from '../../hooks/useOpenseaApi';
import { HNFTCollectionContractAddress } from '../../models/contract';
import { Hnft } from '../Hnft';
import { Wnft } from '../Wnft';
import ERC721HCollection from '../../ERC721HCollection.json';
import { NFT } from '../../models/wnft';
import { HnftCard } from '../../components/HnftCard';
import './MyNFTs.scss';

const { Title } = Typography;

export interface MyNFTsProps { }

export function MyNFTs({ }: MyNFTsProps) {
    const [selectNFTModal, setSelectNFTModal] = useState<boolean>();
    const [createHNFTModal, setCreateHNFTModal] = useState<boolean>();
    const { ethereum, chainId, status, account } = useMetaMask();
    const { retrieveCollections, retrieveNFTs } = useOpenseaApi();
    const [hnftContract, setHnftContract] = useState<ethers.Contract>();
    const [hnfts, setHnfts] = useState<NFT[]>([]);
    const [loadingNfts, setLoadingNfts] = useState<boolean>(true);

    const chain_id = parseInt(chainId ?? '1', 16);

    useEffect(() => {
        if (ethereum && (chain_id === 1 || chain_id === 4)) {
            setHnftContract(new ethers.Contract(
                HNFTCollectionContractAddress[chain_id],
                ERC721HCollection.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [ethereum, chain_id]);

    useEffect(() => {
        retrieveCollections().then(collections => {
            const hnftCollections = (collections ?? []).filter(collection => {
                return collection?.name?.startsWith('Wrapped') ||
                    collection?.primary_asset_contracts?.find(contract => contract.address === HNFTCollectionContractAddress[parseInt(chainId ?? '1', 16) as 1 | 4])
            });

            const contractAddresses = hnftCollections.map(collection => {
                const contracts = collection.primary_asset_contracts;
                if (contracts?.length) {
                    return contracts[0].address;
                }
                return '';
            }).filter(Boolean);

            return retrieveNFTs({
                contractAddresses
            });
        }).then(nfts => {
            setHnfts([...(nfts ?? [])]);
            setLoadingNfts(false);
        });
    }, [retrieveCollections, chainId]);

    const onCreateNewHNFT = useCallback(async () => {
        setCreateHNFTModal(false);
        if (hnftContract && account) {
            try {
                const balance = await hnftContract.balanceOf(account);
                const tokenId = await hnftContract.tokenOfOwnerByIndex(account, balance - 1);
                const tokenUri = await hnftContract.tokenURI(tokenId);

                const tokenMetadata = JSON.parse(atob(tokenUri.substring(29)));

                const newHNFT = {
                    name: tokenMetadata.name,
                    token_id: tokenId,
                    image_url: tokenMetadata.image,
                    description: tokenMetadata.description,
                    asset_contract: {
                        address: hnftContract.address,
                        name: tokenMetadata.name
                    }
                };

                setHnfts([newHNFT, ...hnfts]);
            } catch (e) {
                console.error('Fetch new HNFT Error', JSON.stringify(e))
            }
        }
    }, [hnftContract, account, hnfts]);

    const onCreateNewWNFT = useCallback((wnft: NFT) => {
        setHnfts([wnft, ...hnfts]);
        setSelectNFTModal(false);
    }, [hnfts])

    const removeNft = (removed: NFT) => {
        setHnfts([...hnfts.filter(nft => !(nft.name === removed.name && nft.token_id === removed.token_id))])
    }

    const buttons = (
        <div className='buttons'>
            {status !== 'connected' && (
                <p>Connect your wallet and start managing your HNFTs!</p>
            )}
            <Button onClick={() => setSelectNFTModal(true)}>Wrap your NFT</Button>
            <Button onClick={() => setCreateHNFTModal(true)}>Create new HNFT</Button>
        </div>
    )

    return (<div className='my-nfts'>
        <div className='title-container'>
            <Title
                level={2}
                className='title'
            >
                <Image
                    className='title-icon'
                    src='/images/icon/vip.svg'
                    preview={false}
                />
                HNFTs
            </Title>

            <div className='sub-title'>
                Unlock the power of hyperlink with HNFT
            </div>

            {/* todo: connect wallet here */}
        </div>

        {loadingNfts && (<div className='loading-container'>
            <Spin tip="Loading..." />
        </div>)}

        {!loadingNfts && !hnfts.length && (
            <div className='no-nfts-container'>
                <Image src='/images/icon/query.svg' style={{ width: '120px' }} preview={false}></Image>
                <div style={{ marginTop: '20px', fontWeight: '600' }}>You do not have any HNFTs</div>
                {buttons}
            </div>
        )}

        {!loadingNfts && hnfts.length > 0 && (
            <div className='nfts-container'>
                {hnfts?.map(hnft => <HnftCard key={`${hnft.name}${hnft.token_id}`} hnft={hnft} unwrapped={() => removeNft(hnft)} />)}
                {buttons}
            </div>
        )}

        <Card style={{ marginTop: '40px' }} title="Parami Extension Download">
            <Link to="/files/parami-extension.zip" target="_blank" download>Click to download Parami Extension</Link>
        </Card>

        {selectNFTModal && <Wnft onCancel={() => setSelectNFTModal(false)} onCreateWNFT={(nft) => onCreateNewWNFT(nft)} />}
        {createHNFTModal && <Hnft onCancel={() => setCreateHNFTModal(false)} onCreate={onCreateNewHNFT} />}
    </div>);
};
