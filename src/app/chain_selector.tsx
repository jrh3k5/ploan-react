"use client";

import { getUserSelectableChains } from "@/wagmi";
import { switchChain } from "@wagmi/core";
import { useConfig } from "wagmi";
import { defaultChain } from "@/models/chain";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { useContext } from "react";
import { ProcessingAwareProps } from "./processing_aware_props";
import { Chain } from "viem";

// ChainSelectorProps defines the properties needed by the ChainSelector component.
export interface ChainSelectorProps extends ProcessingAwareProps {
  // onChainSelection is invoked whenever a user selects a chain
  onChainSelection: (chain: Chain) => Promise<void>;
}

// ChainSelector is a component allowing a user to select the active chain.
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

  const changeSelectedChain = async (chain: Chain) => {
    try {
      await switchChain(wagmiConfig, { chainId: chain.id as 8453 | 84532 });
      await props.onChainSelection(chain);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  };

  if (!isSelectableChain) {
    // Switch the user to Base by default
    changeSelectedChain(defaultChain).catch((error) => {
      errorReporter.reportAny(error);
    });
  }

  return (
    <select
      id="chain-select"
      disabled={props.isProcessing}
      onChange={async (event) => {
        const selectedChainId = parseInt(event.target.value);
        const selectedChain = userSelectableChains.find(
          (chain) => chain.id === selectedChainId,
        );
        if (!selectedChain) {
          return;
        }

        await changeSelectedChain(selectedChain);
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
