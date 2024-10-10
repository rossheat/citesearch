import os
import logging
from urllib.parse import urlencode
from bs4 import BeautifulSoup
import aiohttp
from dotenv import load_dotenv
from models import Citation
from utils import extract_pmc_id, append_access_date
from citation_service import generate_citations, check_relevance

load_dotenv()

logger = logging.getLogger("citation_app")

GOOGLE_CUSTOM_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1"
PUBMED_API_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

GOOGLE_API_KEY = os.getenv("GOOGLE_CUSTOM_SEARCH_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CUSTOM_SEARCH_CX")
NCBI_API_KEY = os.getenv("NCBI_API_KEY")

def build_google_search_url(query: str) -> str:
    logger.info("Building Google Custom Search URL", extra={"request_id": "N/A"})
    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "q": query,
    }
    url = f"{GOOGLE_CUSTOM_SEARCH_API_URL}?{urlencode(params)}"
    logger.debug(f"Google Custom Search URL: {url}", extra={"request_id": "N/A"})
    return url

def build_pubmed_url(pmc_id: str) -> str:
    logger.info(f"Building PubMed URL for PMC ID: {pmc_id}", extra={"request_id": "N/A"})
    params = {
        "db": "pmc",
        "id": pmc_id,
        "retmode": "xml",
        "api_key": NCBI_API_KEY
    }
    url = f"{PUBMED_API_URL}?{urlencode(params)}"
    logger.debug(f"PubMed URL: {url}", extra={"request_id": "N/A"})
    return url

async def process_search_result(session, item, guide_content, request_text, request_id):
    logger.info(f"Processing search result: {item['link']}", extra={"request_id": request_id})
    pmc_id = extract_pmc_id(item["link"])
    if not pmc_id:
        logger.warning(f"No PMC ID found for link: {item['link']}", extra={"request_id": request_id})
        return None

    try:
        article_url = build_pubmed_url(pmc_id)
        logger.info(f"Fetching article content from PubMed: {article_url}", extra={"request_id": request_id})
        async with session.get(article_url) as response:
            response.raise_for_status()
            article_content = await response.text()
        
        soup = BeautifulSoup(article_content, 'xml')
        front = soup.find('front')
        body = soup.find('body')

        if not front: 
            logger.warning(f"Missing front for PMC ID: {pmc_id}", extra={"request_id": request_id})
            return None
        
        if not body:
            logger.warning(f"Missing body for PMC ID: {pmc_id}", extra={"request_id": request_id})
            return None

        citation_result = await generate_citations(front.prettify(), guide_content, request_id)
        relevance_result = await check_relevance(request_text, body.prettify(), request_id)

        if not citation_result["success"] or not relevance_result["found_relevant_passage"]:
            logger.warning(f"Citation generation failed or no relevant passage found for PMC ID: {pmc_id}", extra={"request_id": request_id})
            return None

        logger.info(f"Relevant passage found for PMC ID: {pmc_id}", extra={"request_id": request_id})
        return {
            "citation": Citation(
                reference_list_citation=append_access_date(citation_result["reference_list_citation"]),
                in_text_citation=citation_result["in_text_citation"],
                supporting_passage=relevance_result["passage"],
                reasoning=relevance_result["reasoning"],
                pmc_id=pmc_id,
                title=citation_result["title"],
                doi=citation_result["doi"],
                pmc_link=f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_id}/",
                publication_date=citation_result["publication_date"]
            ),
            "citation_result": citation_result,
            "relevance_result": relevance_result
        }

    except aiohttp.ClientError as e:
        logger.error(f"Error fetching data for PMC ID {pmc_id}: {str(e)}", extra={"request_id": request_id})
    except Exception as e:
        logger.error(f"Unexpected error processing PMC ID {pmc_id}: {str(e)}", extra={"request_id": request_id})
    return None