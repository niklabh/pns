import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PNS_ABI } from '../constants/abi';
import { PNS_CONTRACT_ADDRESS } from '../constants/addresses';

const PNSRegistry: React.FC = () => {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [account, setAccount] = useState<string>('');
    const [searchName, setSearchName] = useState<string>('');
    const [nameDetails, setNameDetails] = useState<{
        owner: string;
        resolver: string;
        isExpired: boolean;
    } | null>(null);
    const [newName, setNewName] = useState<string>('');

    // Initialize provider and contract
    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = web3Provider.getSigner();
                const pnsContract = new ethers.Contract(PNS_CONTRACT_ADDRESS, PNS_ABI, signer);
                
                setProvider(web3Provider);
                setContract(contract);

                // Get connected account
                const accounts = await web3Provider.listAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            }
        };

        init();
    }, []);

    // Connect wallet
    const connectWallet = async () => {
        if (provider) {
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);
        }
    };

    // Search for name details
    const searchNameDetails = async () => {
        if (!contract || !searchName) return;

        try {
            const owner = await contract.getOwner(searchName);
            const resolver = await contract.getResolver(searchName);
            const isExpired = await contract.isExpired(searchName);

            setNameDetails({ owner, resolver, isExpired });
        } catch (error) {
            console.error('Error fetching name details:', error);
        }
    };

    // Register new name
    const registerName = async () => {
        if (!contract || !newName) return;

        try {
            const tx = await contract.register(newName);
            await tx.wait();
            alert(`Successfully registered ${newName}`);
            setNewName('');
        } catch (error) {
            console.error('Error registering name:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            {/* Header */}
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h1 className="text-2xl font-bold mb-8">Programmable Name Service</h1>
                                
                                {/* Wallet Connection */}
                                <div className="mb-8">
                                    {!account ? (
                                        <button
                                            onClick={connectWallet}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                        >
                                            Connect Wallet
                                        </button>
                                    ) : (
                                        <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
                                    )}
                                </div>

                                {/* Name Search */}
                                <div className="mb-8">
                                    <input
                                        type="text"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        placeholder="Search name..."
                                        className="border p-2 rounded-md w-full mb-2"
                                    />
                                    <button
                                        onClick={searchNameDetails}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                                    >
                                        Search
                                    </button>

                                    {nameDetails && (
                                        <div className="mt-4">
                                            <p>Owner: {nameDetails.owner}</p>
                                            <p>Resolver: {nameDetails.resolver}</p>
                                            <p>Status: {nameDetails.isExpired ? 'Expired' : 'Active'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Name Registration */}
                                <div className="mb-8">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Enter name to register..."
                                        className="border p-2 rounded-md w-full mb-2"
                                    />
                                    <button
                                        onClick={registerName}
                                        className="bg-purple-500 text-white px-4 py-2 rounded-md"
                                    >
                                        Register Name
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PNSRegistry;
