import {
  NewProposal,
  ProposalExecuted
} from "../../generated/Governor/Governor";
import {
  getOrCreateProposal,
  getOrCreateProposalTransaction
} from "../utils/helpers";
import { ADMIN_PROPOSAL_PREFIX } from "../utils/constants";

// - event: NewProposal(indexed uint256,tuple[])
//   handler: handleNewProposal

export function handleNewProposal(event: NewProposal): void {
  let proposal = getOrCreateProposal(event.params.id.toString());

  proposal.request = ADMIN_PROPOSAL_PREFIX.concat(proposal.id);
  proposal.transactionAmount = event.params.transactions.length;
  proposal.save();

  let transactions = event.params.transactions;

  for (let i = 0; i < transactions.length; i++) {
    let tx_id = proposal.id.concat("-").concat(i.toString());
    let transaction = getOrCreateProposalTransaction(tx_id);

    transaction.proposal = proposal.id;
    transaction.to = transactions[i].to;
    transaction.value = transactions[i].value;
    transaction.data = transactions[i].data;

    transaction.save();
  }
}

// - event: ProposalExecuted(indexed uint256,uint256)
//   handler: handleProposalExecuted

export function handleProposalExecuted(event: ProposalExecuted): void {
  let tx_id = event.params.id
    .toString()
    .concat("-")
    .concat(event.params.transactionIndex.toString());
  let executedTransaction = getOrCreateProposalTransaction(tx_id);

  executedTransaction.isExecuted = true;

  executedTransaction.save();
}
