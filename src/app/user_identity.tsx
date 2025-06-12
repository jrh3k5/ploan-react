import { useState, useEffect, useContext } from "react";
import { Identity } from "@/models/identity";
import { ErrorReporterContext } from "@/services/error_reporter_provider";
// NOTE: Do NOT import any ESM-only modules here! ENS logic must be injected.

const ensCache = new Map<string, string>();

// UserIdentityProps describes the properties required by a UserIdentity component.
export interface UserIdentityProps {
  identity: Identity;
  // Optionally inject ENS resolver for unit testing
  resolveEnsNameFn?: (address: string) => Promise<string | null>;
  // Optionally inject errorReporter for unit testing
  errorReporter?: { reportAny: (e: unknown) => void };
}

// UserIdentity is a component used to render out information about a user.
export function UserIdentity(props: UserIdentityProps) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const errorReporterContext = useContext(ErrorReporterContext);
  const errorReporter = props.errorReporter ?? errorReporterContext;

  // NOTE: If no resolver is provided, ENS resolution is skipped and only the address is shown.
  useEffect(() => {
    const cacheKey = props.identity.address.toLowerCase();
    if (ensCache.has(cacheKey)) {
      setEnsName(ensCache.get(cacheKey) as string);
      return;
    } else if (props.identity?.address) {
      const ensResolverFn = props.resolveEnsNameFn
        ? props.resolveEnsNameFn
        : async (address: string) => {
            // Dynamically import only when needed (never in tests)
            const { resolveEnsName } = await import("./ens_resolver");
            return resolveEnsName(address);
          };

      ensResolverFn(props.identity.address)
        .then((name: string | null) => {
          if (name) {
            ensCache.set(cacheKey, name);
          }
          setEnsName(name);
        })
        .catch((e: unknown) => {
          errorReporter?.reportAny(e);
        });
    }
  }, [props.identity.address, errorReporter, props.resolveEnsNameFn]);

  return (
    <span className="address-container">
      {ensName || props.identity.address}
    </span>
  );
}
