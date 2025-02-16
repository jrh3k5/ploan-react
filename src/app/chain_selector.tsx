"use client";

import { getUserSelectableChains } from "@/wagmi";
import { base } from "wagmi/chains";
import { switchChain } from "@wagmi/core";
import { useConfig } from "wagmi";

export interface ChainSelectorProps {
  onChainSelection: (chainId: number) => Promise<void>;
}

export function ChainSelector(props: ChainSelectorProps) {
  const wagmiConfig = useConfig();
  const currentChainId = wagmiConfig.state.chainId;
  const userSelectableChains = getUserSelectableChains();

  let isSelectableChain = false;
  for (const selectableChain of userSelectableChains) {
    isSelectableChain =
      isSelectableChain ||
      selectableChain.id.toString() === currentChainId.toString();
    if (isSelectableChain) {
      break;
    }
  }

  console.log(
    "isSelectableChain",
    wagmiConfig.state.chainId,
    isSelectableChain,
  );
  if (!isSelectableChain) {
    // Switch the user to Base by default
    switchChain(wagmiConfig, { chainId: base.id })
      .then(() => {
        props.onChainSelection(base.id).catch((e) => {
          console.warn(
            "Failed to invoke onChainSelection on initialization to switch to Base",
            e,
          );
        });
      })
      .catch((e) => {
        console.warn("Failed to switch chain to Base on initialization", e);
      });
  }

  const changeSelectedChain = async (chainId: number) => {
    await switchChain(wagmiConfig, { chainId: chainId as 8453 | 84532 });
    await props.onChainSelection(chainId);
  };

  return (
    <select
      id="chain-select"
      onChange={(event) => {
        const selectedChainId = parseInt(event.target.value);
        changeSelectedChain(selectedChainId);
      }}
      value={currentChainId.toString()}
    >
      {userSelectableChains.map((chain) => (
        <option key={chain.id} value={chain.id.toString()}>
          {chain.name}
        </option>
      ))}
    </select>
  );
}
