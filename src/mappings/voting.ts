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
import { VoterGroup } from "../../generated/schema";
import {
  getOrCreateUser,
  getOrCreateCommittedVote,
  getOrCreatePriceRequest,
  getOrCreateRevealedVote,
  getOrCreateRewardsClaimed,
  getOrCreatePriceRequestRound,
  getOrCreateStore,
  getTokenContract,
  getOrCreateVoterGroup
} from "../utils/helpers";
import { toDecimal } from "../utils/decimals";
import { BIGDECIMAL_HUNDRED, BIGDECIMAL_ONE, BIGINT_ZERO } from "../utils/constants";

import { log, BigInt, BigDecimal } from "@graphprotocol/graph-ts";

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
  let vote = getOrCreateCommittedVote(voteId);

  vote.encryptedVoteData = event.params.encryptedVote;

  vote.save();
}

// - event: PriceRequestAdded(indexed uint256,indexed bytes32,uint256)
//   handler: handlePriceRequestAdded
//  event PriceRequestAdded(uint256 indexed roundId, bytes32 indexed identifier, uint256 time);

export function handlePriceRequestAdded(event: PriceRequestAdded): void {
  // Workaround needed to get the gatPercentage and inflationRate ASAP.
  let store = getOrCreateStore();
  let votingContract = Voting.bind(event.address);
  let gat = votingContract.try_gatPercentage();
  let inflation = votingContract.try_inflationRate();

  store.gatPercentage = gat.reverted ? store.gatPercentage : toDecimal(gat.value);
  store.inflationPercentage = inflation.reverted
    ? store.inflationPercentage
    : toDecimal(inflation.value);
  store.save();

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
  let groupId = requestRound.id
    .concat("-")
    .concat(event.params.price.toString());
  let voterGroup = getOrCreateVoterGroup(groupId);

  request.latestRound = requestRound.id;
  request.price = event.params.price;
  request.resolutionTransaction = event.transaction.hash;
  request.resolutionTimestamp = event.block.timestamp;
  request.resolutionBlock = event.block.number;
  request.isResolved = true;

  voterGroup.won = true;

  requestRound.request = request.id;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;
  requestRound.eligibleForRewardsRatio =
    voterGroup.votersAmount / requestRound.votersAmount;
  requestRound.eligibleForRewardsPercentage =
    requestRound.eligibleForRewardsRatio * BIGDECIMAL_HUNDRED;
  requestRound.winnerGroup = voterGroup.id;

  requestRound.save();
  request.save();
  voterGroup.save();
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
  let winnerGroup: VoterGroup | null =
    requestRound.winnerGroup != null
      ? getOrCreateVoterGroup(requestRound.winnerGroup)
      : null;

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
    requestRound.totalRewardsClaimed + toDecimal(rewardClaimed.numTokens);
  if (rewardClaimed.numTokens > BIGINT_ZERO) {
    requestRound.claimedAmount = requestRound.claimedAmount + BIGDECIMAL_ONE;
    requestRound.claimedRatio =
      winnerGroup != null
        ? requestRound.claimedAmount / winnerGroup.votersAmount
        : requestRound.claimedRatio;
    requestRound.claimedPercentage =
      requestRound.claimedRatio * BIGDECIMAL_HUNDRED;
  }

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
  let vote = getOrCreateCommittedVote(voteId);
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
  let groupId = requestRound.id
    .concat("-")
    .concat(event.params.price.toString());
  let voterGroup = getOrCreateVoterGroup(groupId);
  let votingContract = Voting.bind(event.address);
  let roundInfo = votingContract.try_rounds(event.params.roundId);

  vote.voter = voter.id;
  vote.round = requestRound.id;
  vote.request = requestId;
  vote.identifier = event.params.identifier.toString();
  vote.time = event.params.time;
  vote.price = event.params.price;
  vote.numTokens = event.params.numTokens;
  vote.group = voterGroup.id;

  voterGroup.price = event.params.price;
  voterGroup.round = requestRound.id;
  voterGroup.totalVoteAmount =
    voterGroup.totalVoteAmount + toDecimal(vote.numTokens);
  voterGroup.votersAmount = voterGroup.votersAmount + BIGDECIMAL_ONE;

  requestRound.request = requestId;
  requestRound.identifier = event.params.identifier.toString();
  requestRound.time = event.params.time;
  requestRound.roundId = event.params.roundId;
  requestRound.totalVotesRevealed =
    requestRound.totalVotesRevealed + toDecimal(vote.numTokens);
  requestRound.votersAmount = requestRound.votersAmount + BIGDECIMAL_ONE;
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
      : toDecimal(supply.value as BigInt);
  }
  requestRound.tokenVoteParticipationRatio =
    requestRound.totalSupplyAtSnapshot != null
      ? requestRound.totalVotesRevealed /
        <BigDecimal>requestRound.totalSupplyAtSnapshot
      : null;
  requestRound.tokenVoteParticipationPercentage =
    requestRound.tokenVoteParticipationRatio * BIGDECIMAL_HUNDRED;

  requestRound.save();
  vote.save();
  voter.save();
  voterGroup.save();
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
