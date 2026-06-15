import {
  getListCreatorsQueryKey,
  getListMyCreatorsQueryKey,
  useListCreators,
  useListMyCreators,
  type Creator,
} from "@workspace/api-client-react";

/**
 * Source the dashboard's creator selector from the signed-in user's owned
 * creators (the real account→creator link) instead of the global operator list.
 *
 * Fallback: a user who owns nothing yet sees the full creator list so they can
 * claim their profile on first edit (claim-on-first-edit). Once claimed, only
 * their own creator(s) appear and money endpoints authorize against ownership.
 */
export type DashboardCreators = {
  creators: Creator[];
  isLoading: boolean;
  /** True when the user owns no creators and is picking one to claim. */
  isClaimMode: boolean;
};

export function useDashboardCreators(): DashboardCreators {
  const mine = useListMyCreators({
    query: { queryKey: getListMyCreatorsQueryKey(), retry: false },
  });

  const ownsNone = mine.isSuccess && mine.data.length === 0;

  const all = useListCreators({
    query: {
      enabled: ownsNone,
      queryKey: getListCreatorsQueryKey(),
    },
  });

  if (ownsNone) {
    return {
      creators: all.data ?? [],
      isLoading: all.isLoading,
      isClaimMode: true,
    };
  }

  return {
    creators: mine.data ?? [],
    isLoading: mine.isLoading,
    isClaimMode: false,
  };
}
