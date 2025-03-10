"use client";

import { getUserSelectableChains } from "@/wagmi";
import { switchChain } from "@wagmi/core";
import { useConfig } from "wagmi";
import { defaultChain } from "@/models/chain";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
import { useContext } from "react";
import { ProcessingAwareProps } from "./processing_aware_props";

// ChainSelectorProps defines the properties needed by the ChainSelector component.
export interface ChainSelectorProps extends ProcessingAwareProps {
  // onChainSelection is invoked whenever a user selects a chain
  onChainSelection: (chainId: number) => Promise<void>;
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

  const changeSelectedChain = async (chainId: number) => {
    try {
      await switchChain(wagmiConfig, { chainId: chainId as 8453 | 84532 });
      await props.onChainSelection(chainId);
    } catch (error) {
      await errorReporter.reportAny(error);
    }
  };

  if (!isSelectableChain) {
    // Switch the user to Base by default
    changeSelectedChain(defaultChain.id).catch((error) => {
      errorReporter.reportAny(error);
    });
  }

  return (
    <select
      id="chain-select"
      disabled={props.isProcessing}
      onChange={async (event) => {
        const selectedChainId = parseInt(event.target.value);
        await changeSelectedChain(selectedChainId);
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
