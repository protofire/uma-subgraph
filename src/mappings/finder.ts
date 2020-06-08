import {
  InterfaceImplementationChanged,
  OwnershipTransferred
} from "../../generated/Finder/Finder";
import { getOrCreateInterfaceImplementation } from "../utils/helpers";

// - event: InterfaceImplementationChanged(indexed bytes32,indexed address)
//   handler: handleInterfaceImplementationChanged

export function handleInterfaceImplementationChanged(
  event: InterfaceImplementationChanged
): void {
  let implementation = getOrCreateInterfaceImplementation(
    event.params.interfaceName.toString()
  );

  implementation.address = event.params.newImplementationAddress;

  implementation.save();
}

// - event: OwnershipTransferred(indexed address,indexed address)
//   handler: handleFinderOwnershipTransferred

export function handleFinderOwnershipTransferred(
  event: OwnershipTransferred
): void {
  // to do
}
