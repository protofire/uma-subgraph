import {
  FinalFeesPaid,
  RegularFeesPaid,
  Withdrawal,
  Deposit,
  Redeem,
  PositionCreated,
  SettleExpiredPosition,
  NewSponsor,
  EndedSponsorPosition,
  ExpiringMultiParty
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
  getOrCreateWithdrawalEvent,
  getOrCreateSponsor,
  getOrCreateSponsorPosition,
  calculateGCR
} from "../utils/helpers";

// - event: FinalFeesPaid(indexed uint256)
//   handler: handleFinalFeesPaid

export function handleFinalFeesPaid(event: FinalFeesPaid): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let store = getOrCreateStore();
  let feePaidEvent = getOrCreateFinalFeePaidEvent(event);
  let empContract = ExpiringMultiParty.bind(event.address);
  let feeMultiplier = empContract.try_cumulativeFeeMultiplier();

  emp.cumulativeFeeMultiplier = feeMultiplier.reverted
    ? emp.cumulativeFeeMultiplier
    : feeMultiplier.value;

  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

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
  let empContract = ExpiringMultiParty.bind(event.address);
  let feeMultiplier = empContract.try_cumulativeFeeMultiplier();

  emp.cumulativeFeeMultiplier = feeMultiplier.reverted
    ? emp.cumulativeFeeMultiplier
    : feeMultiplier.value;

  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

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
  let empContract = ExpiringMultiParty.bind(event.address);
  let outstanding = empContract.try_totalTokensOutstanding();
  let rawCollateral = empContract.try_rawTotalPositionCollateral();
  let positionId = event.params.sponsor
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let sponsorPosition = getOrCreateSponsorPosition(positionId);

  emp.totalSyntheticTokensCreated =
    emp.totalSyntheticTokensCreated + event.params.tokenAmount;
  emp.totalTokensOutstanding = outstanding.reverted
    ? emp.totalTokensOutstanding
    : outstanding.value;
  emp.rawTotalPositionCollateral = rawCollateral.reverted
    ? emp.rawTotalPositionCollateral
    : rawCollateral.value;

  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );
  positionEvent.contract = emp.id;
  positionEvent.sponsor = event.params.sponsor.toHexString();
  positionEvent.collateralAmount = event.params.collateralAmount;
  positionEvent.tokenAmount = event.params.tokenAmount;

  sponsorPosition.rawCollateral =
    sponsorPosition.rawCollateral + event.params.collateralAmount;
  sponsorPosition.tokensOutstanding =
    sponsorPosition.tokensOutstanding + event.params.tokenAmount;

  sponsorPosition.save();
  positionEvent.save();
  emp.save();
}

// - event: SettleExpiredPosition(indexed address,indexed uint256,indexed uint256)
//   handler: handleSettleExpiredPosition
// event SettleExpiredPosition(
//       address indexed caller,
//       uint256 indexed collateralReturned,
//       uint256 indexed tokensBurned
//   );

export function handleSettleExpiredPosition(
  event: SettleExpiredPosition
): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateSettleExpiredPositionEvent(event);
  let empContract = ExpiringMultiParty.bind(event.address);
  let outstanding = empContract.try_totalTokensOutstanding();
  let rawCollateral = empContract.try_rawTotalPositionCollateral();

  emp.totalSyntheticTokensBurned =
    emp.totalSyntheticTokensBurned + event.params.tokensBurned;
  emp.totalTokensOutstanding = outstanding.reverted
    ? emp.totalTokensOutstanding
    : outstanding.value;
  emp.rawTotalPositionCollateral = rawCollateral.reverted
    ? emp.rawTotalPositionCollateral
    : rawCollateral.value;
  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

  positionEvent.contract = emp.id;
  positionEvent.caller = event.params.caller;
  positionEvent.collateralReturned = event.params.collateralReturned;
  positionEvent.tokensBurned = event.params.tokensBurned;

  positionEvent.save();
  emp.save();
}

// - event: Redeem(indexed address,indexed uint256,indexed uint256)
//   handler: handleRedeem
// event Redeem(address indexed sponsor, uint256 indexed collateralAmount, uint256 indexed tokenAmount);

export function handleRedeem(event: Redeem): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateRedeemEvent(event);
  let empContract = ExpiringMultiParty.bind(event.address);
  let outstanding = empContract.try_totalTokensOutstanding();
  let rawCollateral = empContract.try_rawTotalPositionCollateral();
  let positionId = event.params.sponsor
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let sponsorPosition = getOrCreateSponsorPosition(positionId);

  emp.totalSyntheticTokensBurned =
    emp.totalSyntheticTokensBurned + event.params.tokenAmount;
  emp.totalTokensOutstanding = outstanding.reverted
    ? emp.totalTokensOutstanding
    : outstanding.value;
  emp.rawTotalPositionCollateral = rawCollateral.reverted
    ? emp.rawTotalPositionCollateral
    : rawCollateral.value;
  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

  positionEvent.contract = emp.id;
  positionEvent.sponsor = event.params.sponsor.toHexString();
  positionEvent.collateralAmount = event.params.collateralAmount;
  positionEvent.tokenAmount = event.params.tokenAmount;

  if (!sponsorPosition.isEnded) {
    sponsorPosition.rawCollateral =
      sponsorPosition.rawCollateral - event.params.collateralAmount;
    sponsorPosition.tokensOutstanding =
      sponsorPosition.tokensOutstanding - event.params.tokenAmount;
  }

  sponsorPosition.save();
  positionEvent.save();
  emp.save();
}

// - event: Deposit(indexed address,indexed uint256)
//   handler: handleDeposit
// event Deposit(address indexed sponsor, uint256 indexed collateralAmount);

export function handleDeposit(event: Deposit): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateDepositEvent(event);
  let empContract = ExpiringMultiParty.bind(event.address);
  let outstanding = empContract.try_totalTokensOutstanding();
  let rawCollateral = empContract.try_rawTotalPositionCollateral();
  let positionId = event.params.sponsor
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let sponsorPosition = getOrCreateSponsorPosition(positionId);

  emp.totalTokensOutstanding = outstanding.reverted
    ? emp.totalTokensOutstanding
    : outstanding.value;
  emp.rawTotalPositionCollateral = rawCollateral.reverted
    ? emp.rawTotalPositionCollateral
    : rawCollateral.value;
  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

  positionEvent.contract = emp.id;
  positionEvent.sponsor = event.params.sponsor.toHexString();
  positionEvent.collateralAmount = event.params.collateralAmount;

  sponsorPosition.rawCollateral =
    sponsorPosition.rawCollateral + event.params.collateralAmount;

  sponsorPosition.save();
  positionEvent.save();
  emp.save();
}

// - event: Withdrawal(indexed address,indexed uint256)
//   handler: handleWithdrawal
// event Withdrawal(address indexed sponsor, uint256 indexed collateralAmount);

export function handleWithdrawal(event: Withdrawal): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let positionEvent = getOrCreateWithdrawalEvent(event);
  let empContract = ExpiringMultiParty.bind(event.address);
  let outstanding = empContract.try_totalTokensOutstanding();
  let rawCollateral = empContract.try_rawTotalPositionCollateral();
  let positionId = event.params.sponsor
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let sponsorPosition = getOrCreateSponsorPosition(positionId);

  emp.totalTokensOutstanding = outstanding.reverted
    ? emp.totalTokensOutstanding
    : outstanding.value;
  emp.rawTotalPositionCollateral = rawCollateral.reverted
    ? emp.rawTotalPositionCollateral
    : rawCollateral.value;
  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

  positionEvent.contract = emp.id;
  positionEvent.sponsor = event.params.sponsor.toHexString();
  positionEvent.collateralAmount = event.params.collateralAmount;

  sponsorPosition.rawCollateral =
    sponsorPosition.rawCollateral - event.params.collateralAmount;

  sponsorPosition.save();
  positionEvent.save();
  emp.save();
}

// - event: NewSponsor(indexed address)
//   handler: handleNewSponsor

export function handleNewSponsor(event: NewSponsor): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let sponsor = getOrCreateSponsor(event.params.sponsor.toHexString());
  let positionId = event.params.sponsor
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let sponsorPosition = getOrCreateSponsorPosition(positionId);

  sponsorPosition.sponsor = sponsor.id;
  sponsorPosition.contract = emp.id;

  sponsor.save();
  sponsorPosition.save();
}

// - event: EndedSponsorPosition(indexed address)
//   handler: handleEndedSponsorPosition

export function handleEndedSponsorPosition(event: EndedSponsorPosition): void {
  let emp = getOrCreateFinancialContract(event.address.toHexString());
  let empContract = ExpiringMultiParty.bind(event.address);
  let outstanding = empContract.try_totalTokensOutstanding();
  let rawCollateral = empContract.try_rawTotalPositionCollateral();
  let position = empContract.try_positions(event.params.sponsor);

  let positionId = event.params.sponsor
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let sponsorPosition = getOrCreateSponsorPosition(positionId);

  emp.totalTokensOutstanding = outstanding.reverted
    ? emp.totalTokensOutstanding
    : outstanding.value;
  emp.rawTotalPositionCollateral = rawCollateral.reverted
    ? emp.rawTotalPositionCollateral
    : rawCollateral.value;
  emp.globalCollateralizationRatio = calculateGCR(
    emp.rawTotalPositionCollateral,
    emp.cumulativeFeeMultiplier,
    emp.totalTokensOutstanding
  );

  sponsorPosition.isEnded = true;
  sponsorPosition.rawCollateral = position.reverted
    ? sponsorPosition.rawCollateral
    : position.value.value3.rawValue;
  sponsorPosition.tokensOutstanding = position.reverted
    ? sponsorPosition.tokensOutstanding
    : position.value.value0.rawValue;

  emp.save();
  sponsorPosition.save();
}
