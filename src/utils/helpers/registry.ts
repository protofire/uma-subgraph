import {
  Party,
  FinancialContract,
  ContractCreator,
  CollateralToken
} from "../../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";
import { ExpiringMultiParty, ExpiringMultiPartyCreator } from "../../../generated/templates";
import { ERC20 } from "../../../generated/templates/ExpiringMultiPartyCreator/ERC20";
import { Address } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../decimals";

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

export function getOrCreateToken(
  tokenAddress: Address,
  persist: boolean = true
): CollateralToken {
  let addressString = tokenAddress.toHexString();

  let token = CollateralToken.load(addressString);

  if (token == null) {
    token = new CollateralToken(addressString);
    token.address = tokenAddress;

    let erc20Token = ERC20.bind(tokenAddress);

    let tokenDecimals = erc20Token.try_decimals();
    let tokenName = erc20Token.try_name();
    let tokenSymbol = erc20Token.try_symbol();

    token.decimals = !tokenDecimals.reverted
      ? tokenDecimals.value
      : DEFAULT_DECIMALS;
    token.name = !tokenName.reverted ? tokenName.value : "";
    token.symbol = !tokenSymbol.reverted ? tokenSymbol.value : "";

    if (persist) {
      token.save();
    }
  }

  return token as CollateralToken;
}
