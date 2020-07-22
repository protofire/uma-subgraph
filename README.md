## UMA Protocol Subgraph

The subgraph, as well as the protocol itself, consist in two distinct but cooperating parts. The DVM/Oracle part, which handles the price verification mechanism of the protocol, and the Synthetic Token "tools", which allow users to create synthetic tokens to create all kinds of Financial Contracts.

### DVM/Oracle

The DVM basically allows "Voting TokenHolders" to vote whenever needed to decide what the price of a given PriceIdentifier is. This is represented by the PriceRequest entity, which keeps track of the request for a price definition of a given PriceIdentifier, all its stages/rounds and the data from each stage/round that needs to be tracked, such as votes casted and so on.

The most important entities we track related to the DVM are the following:

#### PriceIdentifier

This entity represent a single identifier that is or was registered at some point in the system. If it's still available and supported on the whitelist, it will have the `isSupported` field as `true`. Apart from that, each PriceIdentifier entity tracks a list of all the PriceRequest that were ever generated for it.

```graphql
type PriceIdentifier @entity {
  id: ID!

  "Depicts whether this PriceIdentifier is currently among the identifiers supported on the whitelist. Will only be false if it was removed from the whitelist."
  isSupported: Boolean!

  "List of all the PriceRequest entities related to this particular PriceIdentifier."
  priceRequests: [PriceRequest!]! @derivedFrom(field: "identifier")
}
```

#### PriceRequest

This entity tracks the latest state of a specific price request for a given PriceIdentifier. It will have information regarding the status of the request (whether it has been resolved or not), the price it has resolved if it did, the latest round available for the request, metadata for the resolution and more. It will also track the events related to any of the rounds within it, like votes committed, votes revealed and rewards claimed.

```graphql
type PriceRequest @entity {
  "ID is the PriceIdentifier ID + the timestamp"
  id: ID!

  "Depicts whether the request has been resolved"
  isResolved: Boolean!

  "Price resolved for this request"
  price: BigInt

  "PriceRequestRound entity corresponding to the last round of voting"
  latestRound: PriceRequestRound!

  "Timestamp when the PriceRequest was requested"
  time: BigInt!

  "PriceIdentifier for the request"
  identifier: PriceIdentifier!

  "Transaction where the resolution of the request took place"
  resolutionTransaction: Bytes

  "Timestamp when the resolution of the request took place"
  resolutionTimestamp: BigInt

  "Block number when the resolution of the request took place"
  resolutionBlock: BigInt

  "List of all the rounds involved in this PriceRequest"
  rounds: [PriceRequestRound!]! @derivedFrom(field: "request")

  "List of all the votes committed on this request"
  committedVotes: [CommittedVote!]! @derivedFrom(field: "request")

  "List of all the votes revealed on this request"
  revealedVotes: [RevealedVote!]! @derivedFrom(field: "request")

  "List of all the rewards claimed events for this request"
  rewardsClaimed: [RewardsClaimed!]! @derivedFrom(field: "request")
}
```

#### PriceRequestRound

This entity tracks the data for a specific round within a PriceRequest. PriceRequest may need multiple rounds to be able to get a final price result, and for each of those rounds, a new PriceRequestRound will be created, so that the important information of each round can be tracked separately.

This entity in particular will have some particular aggregated data if the round turns to be where the request is resolved, such as the tokenVoteParticipationRatio and Percentage, which will show how many voting tokens were weighted in this vote in relation to the total supply of the voting token, votersEligibleForRewardsRatio and Percentage, which will display the amount of voters that can claim rewards, as well as the votersClaimedRatio and Percentage, which will display the amount of correct voters that already claimed the rewards.

It will also track useful information, such as the snapshotId for this round, statistics for the winner "group", the amount of users that voted, the amount of users that claimed rewards, the amount of voting tokens weighted on this round (totalVotesRevealed) and the amount of tokens claimed as rewards.

```graphql
type PriceRequestRound @entity {
  "ID is the PriceIdentifier ID + the timestamp + the roundId"
  id: ID!

  request: PriceRequest!

  identifier: PriceIdentifier!

  time: BigInt!

  roundId: BigInt!

  snapshotId: BigInt

  "Total amount of users who voted on this round"
  votersAmount: BigDecimal!

  "Total amount of users who claimed rewards on this round"
  votersClaimedAmount: BigDecimal!

  totalVotesRevealed: BigDecimal!

  totalRewardsClaimed: BigDecimal!

  totalSupplyAtSnapshot: BigDecimal

  "Ratio of the total supply of tokens that were weighted on this vote"
  tokenVoteParticipationRatio: BigDecimal

  "Percentage of the total supply of tokens that were weighted on this vote"
  tokenVoteParticipationPercentage: BigDecimal

  "Ratio of correct voters over total voters on this price request"
  votersEligibleForRewardsRatio: BigDecimal

  "Percentage of correct voters over total voters on this price request"
  votersEligibleForRewardsPercentage: BigDecimal

  "Ratio of correct voters who claimed their rewards"
  votersClaimedRatio: BigDecimal

  "Percentage of correct voters who claimed their rewards"
  votersClaimedPercentage: BigDecimal

  winnerGroup: VoterGroup

  committedVotes: [CommittedVote!]! @derivedFrom(field: "round")

  revealedVotes: [RevealedVote!]! @derivedFrom(field: "round")

  groups: [VoterGroup!]! @derivedFrom(field: "round")

  rewardsClaimed: [RewardsClaimed!]! @derivedFrom(field: "round")
}
```

Apart from this entities, the DVM side of the subgraph also includes entities such as `VotingTokenHolder`, that tracks the votingToken balance of users, `VoterGroup` which tracks stats for users that voted the same price on a given `PriceRequest`, and the entities that track specific events within the DVM, with raw data from the DVM events (`CommittedVote`, `RevealedVote` and `RewardsClaimed`).

### FinancialContracts and Synthetic Tokens

The other part of the UMA protocol is related to tracking the contracts and synthetic tokens created with the UMA protocol.

The most important entity here is the `FinancialContract` since it's the main attraction of this side of UMA, but there a lots of important entities that relate to the `FinancialContract` which will track a lot of important data.

#### FinancialContract

This entity will keep track of the state, as well as all the relevant information that relates to a single contract created with the UMA protocol.

FinancialContracts have a lot of information, such as their metadata (address, deployer, creator), which token does this contract use as collateral and which synthetic token can this contract be used to mint, expiration date of the contract, minimum collateral requirement for a position to not be liquidated, how many synthetic tokens were created and burned, and how many of them are available (total outstanding), how much collateral does this contract hold within the positions created, global collateralization ratio, as well as many events that happen within the contracts' scope.

The FinancialContract entity also has links to all the SponsorPositions that have ever been created for this contract, which we will talk about later.

```graphql
type FinancialContract @entity {
  "Blockchain address of the contract"
  id: ID!

  "ExternalMultiPartyCreator contract used to create this contract"
  creator: ContractCreator

  "User that deployed the contract"
  deployer: User

  "Address of the contract"
  address: Bytes!

  "Token used as collateral for this contract"
  collateralToken: Token

  "Synthetic token for this contract"
  syntheticToken: Token

  "Minimum required collateral for proper collateralization"
  collateralRequirement: BigDecimal

  "Expiration timestamp of the financial contract."
  expirationTimestamp: BigInt

  totalTokensOutstanding: BigDecimal

  rawTotalPositionCollateral: BigDecimal

  totalPositionCollateral: BigDecimal

  rawLiquidationCollateral: BigDecimal

  cumulativeFeeMultiplier: BigDecimal

  globalCollateralizationRatio: BigDecimal

  totalSyntheticTokensCreated: BigDecimal!

  totalSyntheticTokensBurned: BigDecimal!

  totalCollateralDeposited: BigDecimal!

  totalCollateralWithdrawn: BigDecimal!

  positionManagerEvents: [PositionManagerEvent!]! @derivedFrom(field: "contract")

  positions: [SponsorPosition!]! @derivedFrom(field: "contract")

  liquidations: [Liquidation!]! @derivedFrom(field: "contract")
}
```

#### ContractCreator

This is a simple entity that tracks the different whitelisted SmartContracts that can be used to create FinancialContracts.

```graphql
type ContractCreator @entity {
  "This entity represent a single contract creator (EMP Creator). The id is the blockchain address of the EMPCreator"
  id: ID!

  "Whether or not this creator has been removed from the whitelist of creators"
  isRemoved: Boolean!

  "Manager of the contract creator address"
  manager: Bytes

  "List of all the contracts created from this Creator"
  contractsCreated: [FinancialContract!]! @derivedFrom(field: "creator")
}
```

#### Sponsors and SponsorPositions

A Sponsor is a user who provides collateral currency to mint new synthetic tokens (thus, sponsoring the creation of new synthetic currency). Once a Sponsor interacts with the FinancialContract to mint new synthetic tokens, the Sponsor creates a position within the contract, we track all the information regarding that position within the scope of the SponsorPosition entity.

The Sponsor entity is really simple, it's just an entity that keeps track of all the positions and liquidations an address has.

```graphql
type Sponsor @entity {
  "A token sponsor is someone who holds positions on financial contracts."
  id: ID!

  positions: [SponsorPosition!]! @derivedFrom(field: "sponsor")

  liquidations: [Liquidation!]! @derivedFrom(field: "sponsor")
}
```

The SponsorPosition on the other hand, has some useful information, such as the amount of collateral the position has, the amount of synthetic token outstanding, whether or not this position has been ended, withdrawal and transfer requests info, and more.

```graphql
type SponsorPosition @entity {
  "Sponsor ID + FinancialContract ID"
  id: ID!

  "Contract where the sponsor has a position"
  contract: FinancialContract!

  "Sponsor who has the position"
  sponsor: Sponsor!

  "Liquidations for this position"
  liquidations: [Liquidation!]! @derivedFrom(field: "position")

  "Collateral used to back the position"
  rawCollateral: BigDecimal!

  collateral: BigDecimal!

  "Synthetic token outstanding"
  tokensOutstanding: BigDecimal!

  "Depicts whether the position has been ended or not"
  isEnded: Boolean!

  withdrawalRequestPassTimestamp: BigInt

  withdrawalRequestAmount: BigDecimal

  transferPositionRequestPassTimestamp: BigInt
}
```

#### Liquidations

One of the most important aspects of the SponsorPositions within the FinancialContracts are the Liquidations. Liquidations occur when a SponsorPosition is deemed under-collateralized by a token holder, and can be disputed.

All the data that is emitted from liquidation related events is tracked in the Liquidation entity. We also keep a copy of the raw data emitted in the events, which is linked to the Liquidation entity in the `events` field.

```graphql
type Liquidation @entity {
  "Liquidation ID is a combination of the Sponsor ID + the internal liquidation id"
  id: ID!

  "Current status of the liquidation"
  status: LiquidationStatus!

  "Sponsor who is having its position liquidated"
  sponsor: Sponsor!

  "Sponsor who is having its position liquidated"
  position: SponsorPosition!

  "Sponsor who is having its position liquidated"
  contract: FinancialContract!

  "User who is liquidating the position"
  liquidator: User!

  "User who is disputing the liquidation"
  disputer: User

  "Internal ID of the liquidationData"
  liquidationId: BigInt!

  tokensLiquidated: BigDecimal!

  lockedCollateral: BigDecimal!

  liquidatedCollateral: BigDecimal!

  disputeBondAmount: BigDecimal

  disputeSucceeded: Boolean

  amountWithdrawn: BigDecimal

  events: [LiquidationEvent!]! @derivedFrom(field: "liquidation")
}
```

#### Store

This entity keeps track of the fees that the system has in place. It keeps track of the current fee values, and the total fees paid, which are separated between regular fees and final fees. It also keeps track of any withdrawals made from the contract by the registered withdrawer.

```graphql
type Store @entity {
  "Entity that stores the global settings (fees, rates, and more)"
  id: ID!

  gatPercentage: BigDecimal

  inflationPercentage: BigDecimal

  regularFee: BigDecimal!

  "FinalFee values are different for each currency available. We track them separately on the FinalFeePair entity"
  finalFees: [FinalFeePair!]! @derivedFrom(field: "store")

  weeklyDelayFee: BigDecimal!

  totalFeesPaid: BigInt!

  regularFeesPaid: BigInt!

  finalFeesPaid: BigInt!

  "Address of the withdrawer as of the last withdraw"
  withdrawer: Bytes

  totalWithdrawn: BigDecimal!

  events: [StoreEvent!]! @derivedFrom(field: "store")
}
```
