import { useState, useEffect, useContext } from 'react';
import { Identity } from "@/models/identity";
import { getEnsName } from "@wagmi/core";
import { getConfig } from '@/wagmi';

export function UserIdentity(props: { identity: Identity }) {
    const [ensName, setEnsName] = useState<string | null>(null);

    useEffect(() => {
        if (props.identity?.address) {
            getEnsName(getConfig(), { address: props.identity.address as `0x${string}`  }).then((name) => {
                setEnsName(name);
            });
        }
    }, [props.identity.address]);

    return (
        <span>{ensName ?? props.identity.address}</span>
    )
}