export enum UserPhase {
  ONBOARDING = "ONBOARDING",
  SWIPE = "SWIPE",
  KNOW = "KNOW",
  MATCHING = "MATCHING",
  MATCHED = "MATCHED",
  WINGMAN = "WINGMAN",
  COMPLETE = "COMPLETE",
}

export interface AvailabilitySlot {
  day: string;
  start: string;
  end: string;
  timezone?: string;
}

export interface StructuredSummary {
  interests: string[];
  communication_style: string;
  humour: string;
  energy_level: string;
  availability: AvailabilitySlot[];
  notes?: string;
}

export interface ConnectionCardPayload {
  card_text: string;
  shared_topics: string[];
}
