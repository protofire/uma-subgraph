## UMA Protocol Subgraph

The subgraph, as well as the protocol itself, consist in two distinct but cooperating parts. The DVM/Oracle part, which handles the price verification mechanism of the protocol, and the Synthetic Token "tools", which allow users to create synthetic tokens to create all kinds of Financial Contracts.

### DVM/Oracle

The DVM basically allows "Voting TokenHolders" to vote whenever needed to decide on what the price of a given PriceIdentifier is. This is represented by the PriceRequest entity, which keeps track of the request for a price definition of a given PriceIdentifier, all its stages/rounds and the data from each stage/round that needs to be tracked, such as votes casted and so on.
