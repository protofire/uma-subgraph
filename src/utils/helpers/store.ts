import { Store, FinalFeePair } from "../../../generated/schema";
import { STORE_ID, BIGINT_ZERO, BIGDECIMAL_ZERO } from "../constants";

export function getOrCreateStore(): Store {
  let store = Store.load(STORE_ID);

  if (store == null) {
    store = new Store(STORE_ID);
    store.regularFee = BIGDECIMAL_ZERO;
    store.weeklyDelayFee = BIGDECIMAL_ZERO;
    store.totalFeesPaid = BIGINT_ZERO;
    store.regularFeesPaid = BIGINT_ZERO;
    store.finalFeesPaid = BIGINT_ZERO;
    store.totalWithdrawn = BIGDECIMAL_ZERO;
  }

  return store as Store;
}

export function getOrCreateFinalFeePair(
  id: String,
  createIfNotFound: boolean = true
): FinalFeePair {
  let pair = FinalFeePair.load(id);

  if (pair == null && createIfNotFound) {
    pair = new FinalFeePair(id);
  }

  return pair as FinalFeePair;
}
