import { Transfer } from "../../generated/VotingToken/VotingToken";
import { getOrCreateUser } from "../utils/helpers";
import { toDecimal } from "../utils/decimals";

// - event: Transfer(indexed address,indexed address,uint256)
//   handler: handleTransferVotingToken

export function handleTransferVotingToken(event: Transfer): void {
  let fromUser = getOrCreateUser(event.params.from.toHexString());
  let toUser = getOrCreateUser(event.params.to.toHexString());

  fromUser.votingTokenBalanceRaw =
    fromUser.votingTokenBalanceRaw - event.params.value;
  toUser.votingTokenBalanceRaw =
    toUser.votingTokenBalanceRaw + event.params.value;

  fromUser.votingTokenBalance = toDecimal(fromUser.votingTokenBalanceRaw);
  toUser.votingTokenBalance = toDecimal(toUser.votingTokenBalanceRaw);

  fromUser.save();
  toUser.save();
}
