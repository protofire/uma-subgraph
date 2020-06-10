import {
  NewContractRegistered,
  PartyAdded,
  PartyRemoved
} from "../../generated/Registry/Registry";
import { log } from '@graphprotocol/graph-ts'
import {
  getOrCreateFinancialContract,
  getOrCreateParty,
  getOrCreateUser
} from "../utils/helpers";

// - event: NewContractRegistered(indexed address,indexed address,address[])
//   handler: handleNewContractRegistered

export function handleNewContractRegistered(
  event: NewContractRegistered
): void {
  let contract = getOrCreateFinancialContract(
    event.params.contractAddress.toHexString()
  );
  let creator = getOrCreateUser(event.params.creator.toHexString());

  contract.address = event.params.contractAddress;
  contract.creator = creator.id;

  contract.save();
  creator.save();
}

// - event: PartyAdded(indexed address,indexed address)
//   handler: handlePartyAdded

export function handlePartyAdded(event: PartyAdded): void {
  let contract = getOrCreateFinancialContract(
    event.params.contractAddress.toHexString()
  );
  let party = getOrCreateParty(event.params.party.toHexString());

  party.isRemoved = false;
  party.contract = contract.id;

  party.save();
}

// - event: PartyRemoved(indexed address,indexed address)
//   handler: handlePartyRemoved

export function handlePartyRemoved(event: PartyRemoved): void {
  let party = getOrCreateParty(event.params.party.toHexString());

  party.isRemoved = true;
  party.save();
}
