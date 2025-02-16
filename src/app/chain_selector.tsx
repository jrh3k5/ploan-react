'use client';

import { getConfig, getUserSelectableChains } from "@/wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { switchChain } from '@wagmi/core'

export interface ChainSelectorProps {
    onChainSelection: (chainId: number) => Promise<void>
}

export function ChainSelector(props: ChainSelectorProps) {
    const wagmiConfig = getConfig();
    const currentChainId = wagmiConfig.state.chainId;
    const userSelectableChains = getUserSelectableChains();

    let isSelectableChain = false;
    for (const selectableChain of userSelectableChains) {
        isSelectableChain = isSelectableChain || selectableChain.id === currentChainId;
        if (isSelectableChain) {
            break;
        }
    }

    if (!isSelectableChain) {
        // Switch the user to Base by default
        switchChain(wagmiConfig, { chainId: base.id });
    }

    const changeSelectedChain = async (chainId: number) => {
        switchChain(wagmiConfig, { chainId: chainId as 8453 | 84532 });
        await props.onChainSelection(chainId);
    };
    
    return (
        <select
            id="chain-select"
            onChange={(event) => {
                const selectedChainId = parseInt(event.target.value);
                changeSelectedChain(selectedChainId);
            }}
        >
            {userSelectableChains.map((chain) => (
                <option key={chain.id} value={chain.id} defaultChecked={chain.id === currentChainId}>
                    {chain.name}
                </option>
            ))}
        </select>
    );
}