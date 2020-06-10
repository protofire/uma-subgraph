import {
  PriceRequest,
  CommitedVote,
  RevealedVote
} from "../../../generated/schema";

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
