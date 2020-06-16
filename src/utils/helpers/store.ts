import { Store } from "../../../generated/schema";
import { STORE_ID, BIGINT_ZERO } from '../constants'

export function getOrCreateStore(): Store {
  let store = Store.load(STORE_ID);

  if (store == null) {
    store = new Store(STORE_ID);
    store.finalFee = BIGINT_ZERO;
    store.regularFee = BIGINT_ZERO;
    store.weeklyDelayFee = BIGINT_ZERO;
    store.gatPercentage = BIGINT_ZERO;
    store.inflationPercentage = BIGINT_ZERO;
  }

  return store as Store;
}
