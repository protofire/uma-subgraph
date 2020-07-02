import { User } from "../../../generated/schema";
import { VotingToken } from "../../../generated/VotingToken/VotingToken";
import {
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  VOTING_TOKEN_ADDRESS
} from "../constants";

export function getOrCreateUser(
  id: String,
  createIfNotFound: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);
    user.votingTokenBalanceRaw = BIGINT_ZERO;
    user.votingTokenBalance = BIGDECIMAL_ZERO;

    user.save();
  }

  return user as User;
}

export function getTokenContract(): VotingToken {
  return VotingToken.bind(VOTING_TOKEN_ADDRESS);
}
