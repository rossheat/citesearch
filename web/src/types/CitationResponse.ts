import Citation  from "./Citation";

export default interface CitationResponse {
    search_text: string;
    citations: Citation[];
  }