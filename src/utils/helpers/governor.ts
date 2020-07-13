import { Proposal, ProposalTransaction } from "../../../generated/schema";

export function getOrCreateProposal(
  id: String,
  createIfNotFound: boolean = true
): Proposal {
  let proposal = Proposal.load(id);

  if (proposal == null && createIfNotFound) {
    proposal = new Proposal(id);
  }

  return proposal as Proposal;
}

export function getOrCreateProposalTransaction(
  id: String,
  createIfNotFound: boolean = true
): ProposalTransaction {
  let tx = ProposalTransaction.load(id);

  if (tx == null && createIfNotFound) {
    tx = new ProposalTransaction(id);
    tx.isExecuted = false;
  }

  return tx as ProposalTransaction;
}
