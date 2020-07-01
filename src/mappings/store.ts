import {
  NewFinalFee,
  SetFinalFeeCall,
  NewFixedOracleFeePerSecondPerPfc,
  NewWeeklyDelayFeePerSecondPerPfc
} from "../../generated/Store/Store";
import { getOrCreateStore, getOrCreateFinalFeePair, getOrCreateToken } from "../utils/helpers";
import { toDecimal } from "../utils/decimals";

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
