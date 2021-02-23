import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { toDecimal } from "./decimals";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const STORE_ID = "0x54f44ea3d2e7aa0ac089c4d8f7c93c27844057bf";
export const GOVERNOR_ADDRESS_STRING = "0x592349f7dedb2b75f9d4f194d4b7c16d82e507dc";
export let VOTING_TOKEN_ADDRESS = Address.fromString("0x04fa0d235c4abf4bcf4787af4cf447de572ef828");
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let BIGDECIMAL_ONE = toDecimal(BigInt.fromI32(10).pow(18));
export let BIGDECIMAL_HUNDRED = toDecimal(BigInt.fromI32(10).pow(20));
export const LIQUIDATION_PRE_DISPUTE = "PreDispute"
export const LIQUIDATION_PENDING_DISPUTE = "PendingDispute"
export const LIQUIDATION_DISPUTE_SUCCEEDED = "DisputeSucceeded"
export const LIQUIDATION_DISPUTE_FAILED = "DisputeFailed"
export const ADMIN_PROPOSAL_PREFIX = "Admin "
// List of contract creators that we want to ignore because they do not conform to the
// FinancialContract Schema. Temporary fix until we develop more robust way to handle
// multiple types of FinancialContracts.
export let BLACKLISTED_CREATORS = new Array<String>();
BLACKLISTED_CREATORS.push("0x98c1f29a478fb4e5da14c2bca0380e67ac2a964a")