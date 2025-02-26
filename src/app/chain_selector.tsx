"use client";

import { getUserSelectableChains } from "@/wagmi";
import { switchChain } from "@wagmi/core";
import { useConfig } from "wagmi";
import { defaultChain } from "@/models/chain";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { useContext } from "react";

export interface ChainSelectorProps {
  // onChainSelection is invoked whenever a user selects a chain
  onChainSelection: (chainId: number) => Promise<void>;
}

export function ChainSelector(props: ChainSelectorProps) {
  const wagmiConfig = useConfig();
  const currentChainId = wagmiConfig.state.chainId;
  const userSelectableChains = getUserSelectableChains();
  const errorReporter = useContext(ErrorReporterContext);

  let isSelectableChain = false;
  for (const selectableChain of userSelectableChains) {
    isSelectableChain =
      isSelectableChain ||
      selectableChain.id.toString() === currentChainId.toString();
    if (isSelectableChain) {
      break;
    }
  }

  if (!isSelectableChain) {
    // Switch the user to Base by default
    switchChain(wagmiConfig, { chainId: defaultChain.id })
      .then(() => {
        props.onChainSelection(defaultChain.id).catch((e) => {
          console.warn(
            "Failed to invoke onChainSelection on initialization to switch to default chain",
            e,
          );
        });
      })
      .catch(errorReporter.reportError);
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
