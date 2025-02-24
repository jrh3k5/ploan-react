import { useState, useEffect } from "react";
import { Identity } from "@/models/identity";
import { getEnsName } from "@wagmi/core";
import { mainnet } from "wagmi/chains";
import { getConfig } from "@/wagmi";

const ensCache = new Map<string, string>();

export function UserIdentity(props: { identity: Identity }) {
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    const chainId = mainnet.id;
    const cacheKey = `${chainId}:${props.identity.address.toLowerCase()}`;

    if (ensCache.has(cacheKey)) {
      setEnsName(ensCache.get(cacheKey) as string);

      return;
    } else if (props.identity?.address) {
      getEnsName(getConfig(), {
        chainId: mainnet.id, // always resolve from mainnet ENS
        address: props.identity.address as `0x${string}`,
      })
        .then((name) => {
          ensCache.set(cacheKey, name as string);
          setEnsName(name);
        })
        .catch((e) => {
          console.warn(
            "Failed to resolve ENS name; caching as a blank ENS name",
            e,
          );
          ensCache.set(cacheKey, "");
        });
    }
  }, [props.identity.address]);

  return <span>{ensName ?? props.identity.address}</span>;
}
