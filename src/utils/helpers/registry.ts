import {
  Party,
  FinancialContract,
  ContractCreator
} from "../../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";
import { ExpiringMultiParty, ExpiringMultiPartyCreator } from "../../../generated/templates";

export function getOrCreateFinancialContract(
  id: String,
  createIfNotFound: boolean = true
): FinancialContract {
  let contract = FinancialContract.load(id);

  if (contract == null && createIfNotFound) {
    contract = new FinancialContract(id);

    ExpiringMultiParty.create(Address.fromString(id));
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

export function getOrCreateContractCreator(
  id: String,
  createIfNotFound: boolean = true
): ContractCreator {
  let contractCreator = ContractCreator.load(id);

  if (contractCreator == null && createIfNotFound) {
    contractCreator = new ContractCreator(id);
    contractCreator.isRemoved = false;

    ExpiringMultiPartyCreator.create(Address.fromString(id));
  }

  return contractCreator as ContractCreator;
}
