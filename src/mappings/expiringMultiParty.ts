import {
  FinalFeesPaid,
  RegularFeesPaid,
  Withdrawal,
  Deposit,
  Redeem,
  PositionCreated,
  SettleExpiredPosition
} from "../../generated/templates/ExpiringMultiParty/ExpiringMultiParty";
import {
  getOrCreateStore,
  getOrCreateFinancialContract,
  getOrCreateRegularFeePaidEvent,
  getOrCreateFinalFeePaidEvent
} from "../utils/helpers";

// - event: FinalFeesPaid(indexed uint256)
//   handler: handleFinalFeesPaid

export function handleFinalFeesPaid(event: FinalFeesPaid): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let store = getOrCreateStore();
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString());
  let feePaidEvent = getOrCreateFinalFeePaidEvent(eventId);

  feePaidEvent.totalPaid = event.params.amount;
  feePaidEvent.tx_hash = event.transaction.hash.toHexString();
  feePaidEvent.block = event.block.number;
  feePaidEvent.timestamp = event.block.timestamp;
  feePaidEvent.store = store.id;
  feePaidEvent.contract = emp.id;

  store.finalFeesPaid = store.finalFeesPaid + feePaidEvent.totalPaid;
  store.totalFeesPaid = store.regularFeesPaid + store.finalFeesPaid;

  feePaidEvent.save();
}

// - event: RegularFeesPaid(indexed uint256,indexed uint256)
//   handler: handleRegularFeesPaid

export function handleRegularFeesPaid(event: RegularFeesPaid): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let store = getOrCreateStore();
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString());
  let feePaidEvent = getOrCreateRegularFeePaidEvent(eventId);

  feePaidEvent.regularFee = event.params.regularFee;
  feePaidEvent.lateFee = event.params.lateFee;
  feePaidEvent.totalPaid = feePaidEvent.regularFee + feePaidEvent.lateFee;
  feePaidEvent.tx_hash = event.transaction.hash.toHexString();
  feePaidEvent.block = event.block.number;
  feePaidEvent.timestamp = event.block.timestamp;
  feePaidEvent.store = store.id;
  feePaidEvent.contract = emp.id;

  store.regularFeesPaid = store.regularFeesPaid + feePaidEvent.totalPaid;
  store.totalFeesPaid = store.regularFeesPaid + store.finalFeesPaid;

  feePaidEvent.save();
  store.save();
}

// - event: PositionCreated(indexed address,indexed uint256,indexed uint256)
//   handler: handlePositionCreated

export function handlePositionCreated(event: PositionCreated): void {
  // TODO: Add implementation
}

// - event: SettleExpiredPosition(indexed address,indexed uint256,indexed uint256)
//   handler: handleSettleExpiredPosition

export function handleSettleExpiredPosition(event: SettleExpiredPosition): void {
  // TODO: Add implementation
}

// - event: Redeem(indexed address,indexed uint256,indexed uint256)
//   handler: handleRedeem

export function handleRedeem(event: Redeem): void {
  // TODO: Add implementation
}

// - event: Deposit(indexed address,indexed uint256)
//   handler: handleDeposit

export function handleDeposit(event: Deposit): void {
  // TODO: Add implementation
}

// - event: Withdrawal(indexed address,indexed uint256)
//   handler: handleWithdrawal

export function handleWithdrawal(event: Withdrawal): void {
  // TODO: Add implementation
}
