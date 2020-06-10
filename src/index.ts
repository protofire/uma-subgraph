export {
  handleFinderOwnershipTransferred,
  handleInterfaceImplementationChanged
} from "./mappings/finder";

export { handleTransferVotingToken } from "./mappings/votingToken";

export {
  handleEncryptedVote,
  handleVoteRevealed,
  handleVoteCommitted,
  handlePriceRequestAdded,
  handlePriceResolved,
  handleRewardsRetrieved
} from "./mappings/voting";

export {
  handleSupportedIdentifierAdded,
  handleSupportedIdentifierRemoved
} from "./mappings/identifierWhitelist";
