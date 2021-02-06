import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { toDecimal } from "./decimals";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const STORE_ID = "0x41AF40Eb92Bec4dD8DA77103597838b3dBBD3B6f";
export const GOVERNOR_ADDRESS_STRING = "0xca4575EE197308c9D2aBF813A5f064f44898b7a4";
export let VOTING_TOKEN_ADDRESS = Address.fromString("0x489Bf230d4Ab5c2083556E394a28276C22c3B580");
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
BLACKLISTED_CREATORS.push("0x1d17adfe4ed05411e590646c378c777068250358")
