import {
  FinancialContract,
  ContractCreator,
  Token
} from "../../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";
import { ExpiringMultiParty, ExpiringMultiPartyCreator } from "../../../generated/templates";
import { ERC20 } from "../../../generated/templates/ExpiringMultiPartyCreator/ERC20";
import { Address } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../decimals";
import { BIGDECIMAL_ZERO, BIGDECIMAL_ONE } from "../constants";

export function getOrCreateFinancialContract(
  id: String,
  createIfNotFound: boolean = true
): FinancialContract {
  let contract = FinancialContract.load(id);

  if (contract == null && createIfNotFound) {
    contract = new FinancialContract(id);
    contract.totalSyntheticTokensCreated = BIGDECIMAL_ZERO;
    contract.totalSyntheticTokensBurned = BIGDECIMAL_ZERO;
    contract.cumulativeFeeMultiplier = BIGDECIMAL_ONE; // Hardcoded in the contract

    ExpiringMultiParty.create(Address.fromString(id));
  }

  return contract as FinancialContract;
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
): Token {
  let addressString = tokenAddress.toHexString();

  let token = Token.load(addressString);

  if (token == null) {
    token = new Token(addressString);
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

  return token as Token;
}
