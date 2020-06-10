import { Party, FinancialContract } from "../../../generated/schema";

export function getOrCreateFinancialContract(
  id: String,
  createIfNotFound: boolean = true
): FinancialContract {
  let contract = FinancialContract.load(id);

  if (contract == null && createIfNotFound) {
    contract = new FinancialContract(id);
  }

  return contract as FinancialContract;
}

export function getOrCreateParty(
  id: String,
  createIfNotFound: boolean = true
): Party {
  let party = Party.load(id);

  if (party == null && createIfNotFound) {
    party = new Party(id);
  }

  return party as Party;
}
