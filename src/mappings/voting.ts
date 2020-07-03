import {
  EncryptedVote,
  PriceRequestAdded,
  PriceResolved,
  VoteCommitted,
  VoteRevealed,
  RewardsRetrieved,
  SetGatPercentageCall,
  SetInflationRateCall,
  Voting
} from "../../generated/Voting/Voting";
import {
  getOrCreateUser,
  getOrCreateCommitedVote,
  getOrCreatePriceRequest,
  getOrCreateRevealedVote,
  getOrCreateRewardsClaimed,
  getOrCreatePriceRequestRound,
  getOrCreateStore,
  getTokenContract
} from "../utils/helpers";
import { toDecimal } from "../utils/decimals";

import { log, BigInt } from "@graphprotocol/graph-ts";

// - event: EncryptedVote(indexed address,indexed uint256,indexed bytes32,uint256,bytes)
//   handler: handleEncryptedVote
//  event EncryptedVote(
//      address indexed voter,
//      uint256 indexed roundId,
//      bytes32 indexed identifier,
//      uint256 time,
//      bytes encryptedVote
//  );

export function handleEncryptedVote(event: EncryptedVote): void {
  let voteId = event.params.voter
    .toHexString()
    .concat("-")
    .concat(event.params.identifier.toString())
    .concat("-")
    .concat(event.params.time.toString())
    .concat("-")
    .concat(event.params.roundId.toString());
  let vote = getOrCreateCommitedVote(voteId);

  vote.encryptedVoteData = event.params.encryptedVote;

  vote.save();
}

// - event: PriceRequestAdded(indexed uint256,indexed bytes32,uint256)
//   handler: handlePriceRequestAdded
//  event PriceRequestAdded(uint256 indexed roundId, bytes32 indexed identifier, uint256 time);

export function handlePriceRequestAdded(event: PriceRequestAdded): void {
  // Workaround needed to get the gatPercentage and inflationRate ASAP.
  let store = getOrCreateStore();
  if (store.gatPercentage == null || store.inflationPercentage == null) {
    let votingContract = Voting.bind(event.address);
    let gat = votingContract.try_gatPercentage();
    let inflation = votingContract.try_inflationRate();

    store.gatPercentage = gat.reverted ? null : toDecimal(gat.value);
    store.inflationPercentage = inflation.reverted
      ? null
      : toDecimal(inflation.value);
  }

  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());
  let request = getOrCreatePriceRequest(requestId);
  let requestRound = getOrCreatePriceRequestRound(
    requestId.concat("-").concat(event.params.roundId.toString())
  );

  request.identifier = event.params.identifier.toString();
  request.latestRound = requestRound.id;
  request.time = event.params.time;

  requestRound.request = request.id;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;

  requestRound.save();
  request.save();
}

// - event: PriceResolved(indexed uint256,indexed bytes32,uint256,int256)
//   handler: handlePriceResolved
//  event PriceResolved(uint256 indexed roundId, bytes32 indexed identifier, uint256 time, int256 price);

export function handlePriceResolved(event: PriceResolved): void {
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());
  let request = getOrCreatePriceRequest(requestId);
  let requestRound = getOrCreatePriceRequestRound(
    requestId.concat("-").concat(event.params.roundId.toString())
  );

  request.latestRound = requestRound.id;
  request.price = event.params.price;
  request.resolutionTransaction = event.transaction.hash;
  request.resolutionTimestamp = event.block.timestamp;
  request.resolutionBlock = event.block.number;

  requestRound.request = request.id;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;

  requestRound.save();
  request.save();
}

// - event: RewardsRetrieved(indexed address,indexed uint256,indexed bytes32,uint256,uint256)
//   handler: handleRewardsRetrieved
//  event RewardsRetrieved(
//      address indexed voter,
//      uint256 indexed roundId,
//      bytes32 indexed identifier,
//      uint256 time,
//      uint256 numTokens
//  );

export function handleRewardsRetrieved(event: RewardsRetrieved): void {
  let rewardClaimedId = event.params.voter
    .toHexString()
    .concat("-")
    .concat(event.params.identifier.toString())
    .concat("-")
    .concat(event.params.time.toString())
    .concat("-")
    .concat(event.params.roundId.toString());
  let rewardClaimed = getOrCreateRewardsClaimed(rewardClaimedId);
  let claimer = getOrCreateUser(event.params.voter);
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());
  let requestRound = getOrCreatePriceRequestRound(
    requestId.concat("-").concat(event.params.roundId.toString())
  );

  rewardClaimed.claimer = claimer.id;
  rewardClaimed.round = requestRound.id;
  rewardClaimed.request = requestId;
  rewardClaimed.identifier = event.params.identifier.toString();
  rewardClaimed.time = event.params.time;
  rewardClaimed.numTokens = event.params.numTokens;

  requestRound.request = requestId;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;
  requestRound.totalRewardsClaimed =
    requestRound.totalRewardsClaimed + rewardClaimed.numTokens;

  requestRound.save();
  rewardClaimed.save();
  claimer.save();
}

// - event: VoteCommitted(indexed address,indexed uint256,indexed bytes32,uint256)
//   handler: handleVoteCommitted
//  event VoteCommitted(address indexed voter, uint256 indexed roundId, bytes32 indexed identifier, uint256 time);

export function handleVoteCommitted(event: VoteCommitted): void {
  let voteId = event.params.voter
    .toHexString()
    .concat("-")
    .concat(event.params.identifier.toString())
    .concat("-")
    .concat(event.params.time.toString())
    .concat("-")
    .concat(event.params.roundId.toString());
  let vote = getOrCreateCommitedVote(voteId);
  let voter = getOrCreateUser(event.params.voter);
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());
  let requestRound = getOrCreatePriceRequestRound(
    requestId.concat("-").concat(event.params.roundId.toString())
  );

  vote.voter = voter.id;
  vote.request = requestId;
  vote.identifier = event.params.identifier.toString();
  vote.time = event.params.time;
  vote.round = requestRound.id;

  requestRound.request = requestId;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;

  requestRound.save();
  vote.save();
  voter.save();
}

// - event: VoteRevealed(indexed address,indexed uint256,indexed bytes32,uint256,int256,uint256)
//   handler: handleVoteRevealed
//  event VoteRevealed(
//      address indexed voter,
//      uint256 indexed roundId,
//      bytes32 indexed identifier,
//      uint256 time,
//      int256 price,
//      uint256 numTokens
//  );

export function handleVoteRevealed(event: VoteRevealed): void {
  let voteId = event.params.voter
    .toHexString()
    .concat("-")
    .concat(event.params.identifier.toString())
    .concat("-")
    .concat(event.params.time.toString())
    .concat("-")
    .concat(event.params.roundId.toString());
  let vote = getOrCreateRevealedVote(voteId);
  let voter = getOrCreateUser(event.params.voter);
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());
  let requestRound = getOrCreatePriceRequestRound(
    requestId.concat("-").concat(event.params.roundId.toString())
  );
  let votingContract = Voting.bind(event.address);
  let roundInfo = votingContract.try_rounds(event.params.roundId);

  vote.voter = voter.id;
  vote.round = requestRound.id;
  vote.request = requestId;
  vote.identifier = event.params.identifier.toString();
  vote.time = event.params.time;
  vote.price = event.params.price;
  vote.numTokens = event.params.numTokens;

  requestRound.request = requestId;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;
  requestRound.totalVotesRevealed =
    requestRound.totalVotesRevealed + vote.numTokens;
  requestRound.snapshotId = roundInfo.reverted ? null : roundInfo.value.value0;
  if (
    requestRound.snapshotId != null &&
    requestRound.totalSupplyAtSnapshot == null
  ) {
    let supply = getTokenContract().try_totalSupplyAt(
      <BigInt>requestRound.snapshotId
    );
    requestRound.totalSupplyAtSnapshot = supply.reverted
      ? null
      : (supply.value as BigInt);
  }
  requestRound.tokensWeightedOverTotalSupplyRaw =
    requestRound.totalSupplyAtSnapshot != null
      ? requestRound.totalVotesRevealed.toBigDecimal() /
        requestRound.totalSupplyAtSnapshot.toBigDecimal()
      : null;
  requestRound.tokensWeightedOverTotalSupply =
    requestRound.tokensWeightedOverTotalSupplyRaw *
    BigInt.fromI32(100).toBigDecimal();

  requestRound.save();
  vote.save();
  voter.save();
}

export function handleSetGatPercentage(call: SetGatPercentageCall): void {
  log.warning("Gat percentage called {}", [
    call.inputs.newGatPercentage.rawValue.toString()
  ]);
  let store = getOrCreateStore();

  store.gatPercentage = toDecimal(call.inputs.newGatPercentage.rawValue);

  store.save();
}

export function handleSetInflationRate(call: SetInflationRateCall): void {
  log.warning("inflation rate called {}", [
    call.inputs.newInflationRate.rawValue.toString()
  ]);
  let store = getOrCreateStore();

  store.inflationPercentage = toDecimal(call.inputs.newInflationRate.rawValue);

  store.save();
}
