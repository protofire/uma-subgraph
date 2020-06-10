import {
  EncryptedVote,
  PriceRequestAdded,
  PriceResolved,
  VoteCommitted,
  VoteRevealed,
  RewardsRetrieved
} from "../../generated/Voting/Voting";

import {
  getOrCreateUser,
  getOrCreateCommitedVote,
  getOrCreatePriceRequest,
  getOrCreateRevealedVote
} from "../utils/helpers";

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
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());
  let request = getOrCreatePriceRequest(requestId);

  request.identifier = event.params.identifier.toString();
  request.latestRoundId = event.params.roundId;
  request.time = event.params.time;

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

  request.latestRoundId = event.params.roundId;
  request.price = event.params.price;

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
  // to do
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
  let voter = getOrCreateUser(event.params.voter.toHexString());
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());

  vote.voter = voter.id;
  vote.request = requestId;
  vote.identifier = event.params.identifier.toString();
  vote.time = event.params.time;
  vote.roundId = event.params.roundId;

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
  let voter = getOrCreateUser(event.params.voter.toHexString());
  let requestId = event.params.identifier
    .toString()
    .concat("-")
    .concat(event.params.time.toString());

  vote.voter = voter.id;
  vote.request = requestId;
  vote.identifier = event.params.identifier.toString();
  vote.time = event.params.time;
  vote.price = event.params.price;
  vote.roundId = event.params.roundId;

  vote.save();
  voter.save();
}
