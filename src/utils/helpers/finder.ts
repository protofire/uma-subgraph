import { InterfaceImplementation } from "../../../generated/schema";

export function getOrCreateInterfaceImplementation(
  id: String,
  createIfNotFound: boolean = true
): InterfaceImplementation {
  let implementation = InterfaceImplementation.load(id);

  if (implementation == null && createIfNotFound) {
    implementation = new InterfaceImplementation(id);
  }

  return implementation as InterfaceImplementation;
}
