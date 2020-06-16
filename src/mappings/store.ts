import {
  NewFinalFee,
  NewFixedOracleFeePerSecondPerPfc,
  NewWeeklyDelayFeePerSecondPerPfc
} from "../../generated/Store/Store";
import { getOrCreateStore } from "../utils/helpers";

// - event: NewFinalFee((uint256))
//   handler: handleNewFinalFee

export function handleNewFinalFee(event: NewFinalFee): void {
  let store = getOrCreateStore();

  store.finalFee = event.params.newFinalFee.rawValue;

  store.save();
}

// - event: NewFixedOracleFeePerSecondPerPfc((uint256))
//   handler: handleNewFixedOracleFeePerSecondPerPfc

export function handleNewFixedOracleFeePerSecondPerPfc(
  event: NewFixedOracleFeePerSecondPerPfc
): void {
  let store = getOrCreateStore();

  store.regularFee = event.params.newOracleFee.rawValue;

  store.save();
}

// - event: NewWeeklyDelayFeePerSecondPerPfc((uint256))
//   handler: handleNewWeeklyDelayFeePerSecondPerPfc

export function handleNewWeeklyDelayFeePerSecondPerPfc(
  event: NewWeeklyDelayFeePerSecondPerPfc
): void {
  let store = getOrCreateStore();

  store.weeklyDelayFee = event.params.newWeeklyDelayFeePerSecondPerPfc.rawValue;

  store.save();
}
