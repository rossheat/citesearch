import logging
from datetime import datetime
from typing import List, Optional

logger = logging.getLogger("citation_app")

def load_file_content(path: str) -> str:
    logger.info(f"Loading file content from {path}", extra={"request_id": "N/A"})
    try:
        with open(path, "r") as f:
            content = f.read()
        logger.debug(f"Successfully loaded content from {path}", extra={"request_id": "N/A"})
        return content
    except Exception as e:
        logger.error(f"Failed to load content from {path}: {str(e)}", extra={"request_id": "N/A"})
        raise

def append_access_date(original_string):
    logger.info("Appending access date to citation", extra={"request_id": "N/A"})
    today = datetime.now()
    day = today.day
    suffix = get_ordinal_suffix(day)
    formatted_date = today.strftime(f"{day}{suffix} %B %Y")
    result = f"{original_string} (Accessed: {formatted_date})"
    logger.debug(f"Citation with access date: {result}", extra={"request_id": "N/A"})
    return result

def get_ordinal_suffix(day):
    if 11 <= day <= 13:
        return 'th'
    else:
        return {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')

def extract_pmc_id(link: str) -> Optional[str]:
    logger.info(f"Extracting PMC ID from link: {link}", extra={"request_id": "N/A"})
    import re
    pattern = r'PMC(\d+)'
    match = re.search(pattern, link)
    if match:
        pmc_id = match.group(1)
        logger.debug(f"Extracted PMC ID: {pmc_id}", extra={"request_id": "N/A"})
        return pmc_id
    else:
        logger.warning(f"No PMC ID found in link: {link}", extra={"request_id": "N/A"})
        return None