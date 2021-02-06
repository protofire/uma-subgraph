import {
  NewContractRegistered,
  AddedSharedMember,
  RemovedSharedMember
} from "../../generated/Registry/Registry";
import { CreatedExpiringMultiParty } from "../../generated/templates/ExpiringMultiPartyCreator/ExpiringMultiPartyCreator";
import { ExpiringMultiParty } from "../../generated/templates/ExpiringMultiParty/ExpiringMultiParty";
import {
  getOrCreateFinancialContract,
  getOrCreateUser,
  getOrCreateContractCreator,
  getOrCreateToken,
  calculateGCR
} from "../utils/helpers";
import { BIGINT_ONE, GOVERNOR_ADDRESS_STRING, BLACKLISTED_CREATORS } from "../utils/constants";
import { toDecimal } from "../utils/decimals";

// - event: NewContractRegistered(indexed address,indexed address,address[])
//   handler: handleNewContractRegistered
export function handleNewContractRegistered(
  event: NewContractRegistered
): void {
  if (
    event.params.contractAddress.toHexString() != GOVERNOR_ADDRESS_STRING &&
    !BLACKLISTED_CREATORS.includes(event.params.creator.toHexString())
  ) {
    let contract = getOrCreateFinancialContract(
      event.params.contractAddress.toHexString()
    );
    let creator = getOrCreateContractCreator(
      event.params.creator.toHexString()
    );

    contract.address = event.params.contractAddress;
    contract.creator = creator.id;

    contract.save();
    creator.save();
  }
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
  if (
    event.params.expiringMultiPartyAddress.toHexString() !=
    GOVERNOR_ADDRESS_STRING
  ) {
    let contract = getOrCreateFinancialContract(
      event.params.expiringMultiPartyAddress.toHexString()
    );
    let deployer = getOrCreateUser(event.params.deployerAddress);
    let empContract = ExpiringMultiParty.bind(
      event.params.expiringMultiPartyAddress
    );

    let collateral = empContract.try_collateralCurrency();
    let synthetic = empContract.try_tokenCurrency();
    let requirement = empContract.try_collateralRequirement();
    let expiration = empContract.try_expirationTimestamp();
    let totalOutstanding = empContract.try_totalTokensOutstanding();
    let feeMultiplier = empContract.try_cumulativeFeeMultiplier();
    let rawCollateral = empContract.try_rawTotalPositionCollateral();

    if (!collateral.reverted) {
      let collateralToken = getOrCreateToken(
        collateral.value,
        true,
        true,
        false
      );
      contract.collateralToken = collateralToken.id;
    }

    if (!synthetic.reverted) {
      let syntheticToken = getOrCreateToken(synthetic.value, true, false, true);
      contract.syntheticToken = syntheticToken.id;
    }

    contract.deployer = deployer.id;
    contract.address = event.params.expiringMultiPartyAddress;
    contract.collateralRequirement = requirement.reverted
      ? null
      : toDecimal(requirement.value);
    contract.expirationTimestamp = expiration.reverted
      ? null
      : expiration.value;
    contract.totalTokensOutstanding = totalOutstanding.reverted
      ? null
      : toDecimal(totalOutstanding.value);
    contract.cumulativeFeeMultiplier = feeMultiplier.reverted
      ? null
      : toDecimal(feeMultiplier.value);
    contract.rawTotalPositionCollateral = rawCollateral.reverted
      ? null
      : toDecimal(rawCollateral.value);

    contract.globalCollateralizationRatio = calculateGCR(
      contract.rawTotalPositionCollateral,
      contract.cumulativeFeeMultiplier,
      contract.totalTokensOutstanding
    );

    contract.save();
    deployer.save();
  }
}
