import json
import logging
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("citation_app")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def generate_citations(article_metadata: str, guide_content: str, request_id: str) -> dict:
    logger.info("Generating citations using GPT-4o", extra={"request_id": request_id})
    prompt = f"""
    Analyze the provided PubMed journal article metadata and generate citations according to the Open University Harvard Cite Them Right format.
    Use the citation guide provided below for reference.

    Citation Guide:
    {guide_content}

    Article Metadata:
    {article_metadata}

    Generate both a reference list citation and an in-text citation.
    Ensure strict adherence to the specified citation format.
    If you encounter any issues or ambiguities, explain them in the 'reason' field.

    Also extract the following information:
    - Article title
    - DOI (if available)
    - Publication date

    Return your response in the following JSON format:
    {{
        "success": <boolean - indicates whether the citation generation was successful>,
        "reference_list_citation": <string or null - the generated reference list citation>,
        "in_text_citation": <string or null - the generated in-text citation>,
        "title": <string - the article title>,
        "doi": <string - the DOI>,
        "publication_date": <string - the publication date in '%-d{{S}} %B %Y' format>,
        "reason": <string or null - explanation if success is false, otherwise null>
    }}

    Note:
    - The 'success' field must be a boolean (true or false).
    - The 'reference_list_citation' and 'in_text_citation' fields should be strings if successful, or null if not applicable.
    - The 'reason' field should only be filled with a string explanation if 'success' is false, otherwise it should be null.
    - The 'in_text_citation' field should always be in the format: (author(s), year) and should be a single author with et al when there is more than two authors.
    - Ensure all fields are included in the response, even if they are null.
    - Do not include any XML boilerplate in your response when quoting the JSON.
    """

    try:
        chat_completion = await openai_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            response_format={"type": "json_object"},
        )
        result = json.loads(chat_completion.choices[0].message.content)
        logger.debug(f"GPT-4 citation generation result: {result}", extra={"request_id": request_id})
        return result
    except Exception as e:
        logger.error(f"Error in GPT-4 citation generation: {str(e)}", extra={"request_id": request_id})
        return {"success": False, "reason": str(e)}

async def check_relevance(text: str, article_body: str, request_id: str) -> dict:
    logger.info("Checking relevance using GPT-4o", extra={"request_id": request_id})
    prompt = f"""
    Analyze the following text and the provided article body. Determine if there is a section of text in the article body which strongly supports the statement(s) made in the given text. If there is, state which section.

    Text to check:
    {text}

    Article body:
    {article_body}

    Return your response in the following JSON format:
    {{
        "found_relevant_passage": <boolean - indicates whether a highly relevant passage was found>,
        "passage": <string or null - the relevant passage if found, otherwise null>,
        "reasoning": <string - explanation of why the passage is relevant or why no relevant passage was found>
    }}

    Note:
    - The 'found_relevant_passage' field must be a boolean (true or false).
    - The 'passage' field should be a string if a relevant passage is found, or null if not.
    - The 'reasoning' field should always be filled with an explanation.
    - Do not include any XML boilerplate in your response when quoting the JSON.
    """

    try:
        chat_completion = await openai_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            response_format={"type": "json_object"},
        )
        result = json.loads(chat_completion.choices[0].message.content)
        logger.debug(f"GPT-4 relevance check result: {result}", extra={"request_id": request_id})
        return result
    except Exception as e:
        logger.error(f"Error in GPT-4 relevance check: {str(e)}", extra={"request_id": request_id})
        return {"found_relevant_passage": False, "passage": None, "reasoning": str(e)}