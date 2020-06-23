import {
  PriceRequest,
  PriceRequestRound,
  CommitedVote,
  RevealedVote,
  RewardsClaimed
} from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";

export function getOrCreatePriceRequest(
  id: String,
  createIfNotFound: boolean = true
): PriceRequest {
  let request = PriceRequest.load(id);

  if (request == null && createIfNotFound) {
    request = new PriceRequest(id);
    request.isResolved = false;
  }

  return request as PriceRequest;
}

export function getOrCreatePriceRequestRound(
  id: String,
  createIfNotFound: boolean = true
): PriceRequestRound {
  let requestRound = PriceRequestRound.load(id);

  if (requestRound == null && createIfNotFound) {
    requestRound = new PriceRequestRound(id);

    requestRound.totalVotesRevealed = BIGINT_ZERO;
    requestRound.totalRewardsClaimed = BIGINT_ZERO;
  }

  return requestRound as PriceRequestRound;
}

export function getOrCreateCommitedVote(
  id: String,
  createIfNotFound: boolean = true
): CommitedVote {
  let vote = CommitedVote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new CommitedVote(id);
  }

  return vote as CommitedVote;
}

export function getOrCreateRevealedVote(
  id: String,
  createIfNotFound: boolean = true
): RevealedVote {
  let vote = RevealedVote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new RevealedVote(id);
  }

  return vote as RevealedVote;
}

export function getOrCreateRewardsClaimed(
  id: String,
  createIfNotFound: boolean = true
): RewardsClaimed {
  let rewards = RewardsClaimed.load(id);

  if (rewards == null && createIfNotFound) {
    rewards = new RewardsClaimed(id);
  }

  return rewards as RewardsClaimed;
}
