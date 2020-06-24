import {
  NewContractRegistered,
  PartyAdded,
  PartyRemoved,
  AddedSharedMember,
  RemovedSharedMember
} from "../../generated/Registry/Registry";
import { CreatedExpiringMultiParty } from "../../generated/templates/ExpiringMultiPartyCreator/ExpiringMultiPartyCreator";
import { ExpiringMultiParty } from "../../generated/templates/ExpiringMultiParty/ExpiringMultiParty";
import { log, Bytes, Address } from "@graphprotocol/graph-ts";
import {
  getOrCreateFinancialContract,
  getOrCreateParty,
  getOrCreateUser,
  getOrCreateContractCreator,
  getOrCreateToken
} from "../utils/helpers";
import { BIGINT_ONE } from "../utils/constants";

// - event: NewContractRegistered(indexed address,indexed address,address[])
//   handler: handleNewContractRegistered

export function handleNewContractRegistered(
  event: NewContractRegistered
): void {
  let contract = getOrCreateFinancialContract(
    event.params.contractAddress.toHexString()
  );
  let creator = getOrCreateContractCreator(event.params.creator.toHexString());

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

// - event: AddedSharedMember(indexed uint256,indexed address,indexed address)
//   handler: handleAddedSharedMember

export function handleAddedSharedMember(event: AddedSharedMember): void {
  if (event.params.roleId == BIGINT_ONE) {
    let creator = getOrCreateContractCreator(
      event.params.newMember.toHexString()
    );

    creator.manager = event.params.manager;
    creator.isRemoved = false;

    creator.save();
  }
}

// - event: RemovedSharedMember(indexed uint256,indexed address,indexed address)
//   handler: handleRemovedSharedMember

export function handleRemovedSharedMember(event: RemovedSharedMember): void {
  if (event.params.roleId == BIGINT_ONE) {
    let creator = getOrCreateContractCreator(
      event.params.oldMember.toHexString()
    );

    creator.manager = event.params.manager;
    creator.isRemoved = true;

    creator.save();
  }
}

// - event: CreatedExpiringMultiParty(indexed address,indexed address)
//   handler: handleCreatedExpiringMultiParty

export function handleCreatedExpiringMultiParty(
  event: CreatedExpiringMultiParty
): void {
  let contract = getOrCreateFinancialContract(
    event.params.expiringMultiPartyAddress.toHexString()
  );
  let deployer = getOrCreateUser(event.params.deployerAddress.toHexString());
  let empContract = ExpiringMultiParty.bind(event.params.expiringMultiPartyAddress);

  let currency = empContract.try_collateralCurrency();
  let requirement = empContract.try_collateralRequirement();
  let expiration = empContract.try_expirationTimestamp();

  if(!currency.reverted) {
    let token = getOrCreateToken(currency.value);
    contract.collateralToken = token.id;
  }

  contract.deployer = deployer.id;
  contract.address = event.params.expiringMultiPartyAddress;
  contract.collateralRequirement = requirement.reverted ? null : requirement.value;
  contract.expirationTimestamp = expiration.reverted ? null : expiration.value;

  contract.save();
  deployer.save();
}
