import {
  RegularFeePaidEvent,
  FinalFeePaidEvent,
  PositionCreatedEvent,
  SettleExpiredPositionEvent,
  RedeemEvent,
  DepositEvent,
  WithdrawalEvent,
  Sponsor,
  SponsorPosition
} from "../../../generated/schema";
import { BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { BIGDECIMAL_ZERO } from "../constants";

export function getOrCreateRegularFeePaidEvent(
  ethereumEvent: ethereum.Event
): RegularFeePaidEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());

  let event = new RegularFeePaidEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as RegularFeePaidEvent;
}

export function getOrCreateFinalFeePaidEvent(
  ethereumEvent: ethereum.Event
): FinalFeePaidEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());

  let event = new FinalFeePaidEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as FinalFeePaidEvent;
}

export function getOrCreatePositionCreatedEvent(
  ethereumEvent: ethereum.Event
): PositionCreatedEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());

  let event = new PositionCreatedEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as PositionCreatedEvent;
}

export function getOrCreateSettleExpiredPositionEvent(
  ethereumEvent: ethereum.Event
): SettleExpiredPositionEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());

  let event = new SettleExpiredPositionEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as SettleExpiredPositionEvent;
}

export function getOrCreateRedeemEvent(
  ethereumEvent: ethereum.Event
): RedeemEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());

  let event = new RedeemEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as RedeemEvent;
}

export function getOrCreateDepositEvent(
  ethereumEvent: ethereum.Event
): DepositEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());
  let event = new DepositEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as DepositEvent;
}

export function getOrCreateWithdrawalEvent(
  ethereumEvent: ethereum.Event
): WithdrawalEvent {
  let id = ethereumEvent.transaction.hash
    .toHexString()
    .concat("-")
    .concat(ethereumEvent.logIndex.toString());

  let event = new WithdrawalEvent(id);
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.block = ethereumEvent.block.number;
  event.timestamp = ethereumEvent.block.timestamp;

  return event as WithdrawalEvent;
}

export function getOrCreateSponsor(
  id: String,
  createIfNotFound: boolean = true
): Sponsor {
  let sponsor = Sponsor.load(id);

  if (sponsor == null && createIfNotFound) {
    sponsor = new Sponsor(id);
  }

  return sponsor as Sponsor;
}

export function getOrCreateSponsorPosition(
  id: String,
  createIfNotFound: boolean = true
): SponsorPosition {
  let position = SponsorPosition.load(id);

  if (position == null && createIfNotFound) {
    position = new SponsorPosition(id);

    position.rawCollateral = BIGDECIMAL_ZERO;
    position.tokensOutstanding = BIGDECIMAL_ZERO;
    position.isEnded = false;
  }

  return position as SponsorPosition;
}

export function calculateGCR(
  feeMultiplier: BigDecimal | null,
  rawCollateral: BigDecimal | null,
  outstanding: BigDecimal | null
): BigDecimal | null {
  let gcr: BigDecimal = null;
  if (
    outstanding != null &&
    feeMultiplier != null &&
    rawCollateral != null &&
    outstanding != BIGDECIMAL_ZERO
  ) {
    gcr =
      (<BigDecimal>rawCollateral * <BigDecimal>feeMultiplier) /
      <BigDecimal>outstanding;
  }
  return gcr;
}
