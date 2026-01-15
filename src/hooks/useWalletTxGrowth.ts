import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PetState } from "@/types/pet";

const TXS_PER_GROWTH_UNIT = 10;
const MAX_PAGES = 10;
const PAGE_SIZE = 100;

export function useWalletTxGrowth(
  petState: PetState,
  setPetState: React.Dispatch<React.SetStateAction<PetState>>
) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isSyncing, setIsSyncing] = useState(false);

  const debug = (import.meta.env.VITE_DEBUG_WALLET_TX as string | undefined) === "true";

  const walletAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  useEffect(() => {
    if (!walletAddress) return;

    setPetState((prev) => {
      if (prev.walletTrackingStartedAt && prev.walletAddress === walletAddress) return prev;
      if (debug) console.log("wallet-tx: start-tracking", walletAddress);
      return {
        ...prev,
        walletAddress,
        walletTrackingStartedAt: Date.now(),
        walletTxBaselineInitialized: false,
        walletTxCountBaseline: 0,
        walletTxCountCurrent: 0,
        walletTxCountSinceStart: 0,
        walletLastSeenSignature: null,
        walletGrowthUnitsApplied: 0,
      };
    });
  }, [setPetState, walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;
    if (petState.walletAddress !== walletAddress) return;
    if (!petState.walletTrackingStartedAt) return;
    if (isSyncing) return;

    let cancelled = false;

    const sync = async () => {
      setIsSyncing(true);
      try {
        if (cancelled) return;

        const address = publicKey;
        if (!address) return;

        if (debug) {
          console.log(
            "wallet-tx: sync-begin",
            "endpoint",
            (connection as unknown as { rpcEndpoint?: string }).rpcEndpoint ?? "",
            "address",
            address.toBase58(),
            "baselineInit",
            petState.walletTxBaselineInitialized,
            "baseline",
            petState.walletTxCountBaseline,
            "current",
            petState.walletTxCountCurrent,
            "sinceStart",
            petState.walletTxCountSinceStart
          );
        }

        let before: string | undefined;
        let totalSignaturesCount = 0;
        let newestSignature: string | null = null;

        for (let page = 0; page < MAX_PAGES; page++) {
          const sigInfos = await connection.getSignaturesForAddress(
            address,
            { limit: PAGE_SIZE, before },
            "finalized"
          );

          console.log(sigInfos.length);

          if (cancelled) return;
          if (sigInfos.length === 0) break;

          if (!newestSignature) newestSignature = sigInfos[0]?.signature ?? null;

          totalSignaturesCount += sigInfos.length;
          before = sigInfos[sigInfos.length - 1]?.signature;
          if (!before) break;
        }

        if (debug) {
          console.log(
            "wallet-tx: fetched",
            "total",
            totalSignaturesCount,
            "newest",
            newestSignature
          );
        }

        if (debug) {
          console.log("wallet-tx: about-to-setPetState", "total", totalSignaturesCount);
        }

        setPetState((prev) => {
          if (prev.walletAddress !== walletAddress) return prev;
          if (!prev.walletTrackingStartedAt) return prev;

          const baseline = prev.walletTxBaselineInitialized
            ? prev.walletTxCountBaseline
            : totalSignaturesCount;

          const sinceStart = Math.max(0, totalSignaturesCount - baseline);
          const growthUnits = Math.floor(sinceStart / TXS_PER_GROWTH_UNIT);
          const deltaUnits = Math.max(0, growthUnits - prev.walletGrowthUnitsApplied);

          if (debug) {
            console.log(
              "wallet-tx: apply",
              "baseline",
              baseline,
              "current",
              totalSignaturesCount,
              "sinceStart",
              sinceStart,
              "deltaUnits",
              deltaUnits
            );
          }

          return {
            ...prev,
            walletTxBaselineInitialized: true,
            walletTxCountBaseline: baseline,
            walletTxCountCurrent: totalSignaturesCount,
            walletTxCountSinceStart: sinceStart,
            walletLastSeenSignature: newestSignature ?? prev.walletLastSeenSignature,
            walletGrowthUnitsApplied: prev.walletGrowthUnitsApplied + deltaUnits,
          };
        });
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [
    connection,
    publicKey,
    setPetState,
    walletAddress,
    debug,
  ]);

  const txProgress = petState.walletTxCountSinceStart % TXS_PER_GROWTH_UNIT;

  return {
    isSyncing,
    txProgress,
    txCountSinceStart: petState.walletTxCountSinceStart,
    growthUnitsApplied: petState.walletGrowthUnitsApplied,
    txsPerGrowthUnit: TXS_PER_GROWTH_UNIT,
  };
}
