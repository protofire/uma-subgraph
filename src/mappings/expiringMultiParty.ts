import {
  FinalFeesPaid,
  RegularFeesPaid,
  Withdrawal,
  Deposit,
  Redeem,
  PositionCreated,
  SettleExpiredPosition,
} from "../../generated/templates/ExpiringMultiParty/ExpiringMultiParty";
import {
  getOrCreateStore,
  getOrCreateFinancialContract,
  getOrCreateRegularFeePaidEvent,
  getOrCreateFinalFeePaidEvent,
  getOrCreatePositionCreatedEvent,
  getOrCreateSettleExpiredPositionEvent,
  getOrCreateRedeemEvent,
  getOrCreateDepositEvent,
  getOrCreateWithdrawalEvent
} from "../utils/helpers";

// - event: FinalFeesPaid(indexed uint256)
//   handler: handleFinalFeesPaid

export function handleFinalFeesPaid(event: FinalFeesPaid): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let store = getOrCreateStore();
  let feePaidEvent = getOrCreateFinalFeePaidEvent(event);

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
  let feePaidEvent = getOrCreateRegularFeePaidEvent(event);

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
// event PositionCreated(address indexed sponsor, uint256 indexed collateralAmount, uint256 indexed tokenAmount);

export function handlePositionCreated(event: PositionCreated): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreatePositionCreatedEvent(event);
  emp.totalTokensCreated = emp.totalTokensCreated + event.params.tokenAmount;

  positionEvent.contract = emp.id;

  positionEvent.save();
  emp.save();
}

// - event: SettleExpiredPosition(indexed address,indexed uint256,indexed uint256)
//   handler: handleSettleExpiredPosition

export function handleSettleExpiredPosition(
  event: SettleExpiredPosition
): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateSettleExpiredPositionEvent(event);

  positionEvent.contract = emp.id;

  positionEvent.save();
}

// - event: Redeem(indexed address,indexed uint256,indexed uint256)
//   handler: handleRedeem

export function handleRedeem(event: Redeem): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateRedeemEvent(event);

  positionEvent.contract = emp.id;

  positionEvent.save();
}

// - event: Deposit(indexed address,indexed uint256)
//   handler: handleDeposit

export function handleDeposit(event: Deposit): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateDepositEvent(event);

  positionEvent.contract = emp.id;

  positionEvent.save();
}

// - event: Withdrawal(indexed address,indexed uint256)
//   handler: handleWithdrawal

export function handleWithdrawal(event: Withdrawal): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateWithdrawalEvent(event);

  positionEvent.contract = emp.id;

  positionEvent.save();
}
