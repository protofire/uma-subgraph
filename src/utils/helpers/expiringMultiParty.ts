import { RegularFeePaidEvent, FinalFeePaidEvent } from "../../../generated/schema";

export function getOrCreateRegularFeePaidEvent(
  id: String,
  createIfNotFound: boolean = true
): RegularFeePaidEvent {
  let event = RegularFeePaidEvent.load(id);

  if (event == null && createIfNotFound) {
    event = new RegularFeePaidEvent(id);
  }

  return event as RegularFeePaidEvent;
}

export function getOrCreateFinalFeePaidEvent(
  id: String,
  createIfNotFound: boolean = true
): FinalFeePaidEvent {
  let event = FinalFeePaidEvent.load(id);

  if (event == null && createIfNotFound) {
    event = new FinalFeePaidEvent(id);
  }

  return event as FinalFeePaidEvent;
}
