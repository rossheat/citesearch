export default interface Citation {
    reference_list_citation: string;
    in_text_citation: string;
    supporting_passage: string;
    reasoning: string;
    pmc_id: string;
    title: string;
    doi: string | null;
    pmc_link: string;
    publication_date: string;
  }