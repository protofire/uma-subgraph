import {
  NewFinalFee,
  SetFinalFeeCall,
  NewFixedOracleFeePerSecondPerPfc,
  NewWeeklyDelayFeePerSecondPerPfc
} from "../../generated/Store/Store";
import {
  RemovedFromWhitelist,
  AddedToWhitelist
} from "../../generated/AddressWhitelist/AddressWhitelist";
import {
  getOrCreateStore,
  getOrCreateFinalFeePair,
  getOrCreateToken
} from "../utils/helpers";
import { toDecimal } from "../utils/decimals";
import { log } from "@graphprotocol/graph-ts";

// // - event: NewFinalFee((uint256))
// //   handler: handleNewFinalFee
//
// export function handleNewFinalFee(event: NewFinalFee): void {
//   let store = getOrCreateStore();
//
//   store.finalFee = toDecimal(event.params.newFinalFee.rawValue);
//
//   store.save();
// }

// - function: setFinalFee(address,tuple)
//   handler: handleSetFinalFee

export function handleSetFinalFee(call: SetFinalFeeCall): void {
  log.warning("setFinalFee called at block: {} tx_hash: {}", [
    call.block.number.toString(),
    call.transaction.hash.toHexString()
  ]);
  let store = getOrCreateStore();
  let currency = getOrCreateToken(call.inputs.currency);
  let finalFeePair = getOrCreateFinalFeePair(currency.id);

  finalFeePair.store = store.id;
  finalFeePair.currency = currency.id;
  finalFeePair.fee = toDecimal(call.inputs.newFinalFee.rawValue);

  finalFeePair.save();
  currency.save();
  store.save();
}

// - event: NewFixedOracleFeePerSecondPerPfc((uint256))
//   handler: handleNewFixedOracleFeePerSecondPerPfc

export function handleNewFixedOracleFeePerSecondPerPfc(
  event: NewFixedOracleFeePerSecondPerPfc
): void {
  let store = getOrCreateStore();

  store.regularFee = toDecimal(event.params.newOracleFee.rawValue);

  store.save();
}

// - event: NewWeeklyDelayFeePerSecondPerPfc((uint256))
//   handler: handleNewWeeklyDelayFeePerSecondPerPfc

export function handleNewWeeklyDelayFeePerSecondPerPfc(
  event: NewWeeklyDelayFeePerSecondPerPfc
): void {
  let store = getOrCreateStore();

  store.weeklyDelayFee = toDecimal(
    event.params.newWeeklyDelayFeePerSecondPerPfc.rawValue
  );

  store.save();
}

// - event: AddedToWhitelist(indexed addedAddress)
//   handler: handleAddedToWhitelist

export function handleAddedToWhitelist(event: AddedToWhitelist): void {
  let token = getOrCreateToken(event.params.addedAddress, true, false, true);

  token.isOnWhitelist = true;

  token.save();
}

// - event: RemovedFromWhitelist(indexed removedAddress)
//   handler: handleRemovedFromWhitelist

export function handleRemovedFromWhitelist(event: RemovedFromWhitelist): void {
  let token = getOrCreateToken(event.params.removedAddress);

  token.isOnWhitelist = false;

  token.save();
}
