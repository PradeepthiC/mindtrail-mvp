export type CaptureContext = "work" | "career" | "personal" | "family" | "other";

export type CaptureItem = {
  id?: string;
  text_raw: string;
  tags: string[];
  context: CaptureContext;
  created_at: number;
  source?: "capture" | "home"; // optional metadata if you care
};
