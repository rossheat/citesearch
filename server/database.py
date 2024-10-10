import os
import json
import asyncpg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from typing import List, Optional
from logging_config import setup_logging

load_dotenv()
logger = setup_logging()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def log_search(
    request_id: str,
    client_ip: str,
    user_agent: str,
    search_text: str,
    query_params: dict,
    response_status: int,
    response_time: float,
    citations_found: int,
    search_results: dict,
    found_pmc_ids: List[str],
    processed_pmc_ids: List[str],
    citation_generation_results: List[dict],
    relevance_check_results: List[dict],
    final_citations: List[dict]
):
    logger.info(f"Attempting to insert search log for request_id: {request_id}", extra={"request_id": request_id})
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        try:
            await conn.execute('''
                INSERT INTO searches (
                    request_id, timestamp, client_ip, user_agent, search_text, query_params,
                    response_status, response_time, citations_found, search_results,
                    found_pmc_ids, processed_pmc_ids, citation_generation_results,
                    relevance_check_results, final_citations
                ) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ''', request_id, client_ip, user_agent, search_text, json.dumps(query_params),
                response_status, response_time, citations_found, json.dumps(search_results),
                json.dumps(found_pmc_ids), json.dumps(processed_pmc_ids),
                json.dumps(citation_generation_results), json.dumps(relevance_check_results),
                json.dumps(final_citations))
            
            logger.info(f"Search log successfully inserted for request_id: {request_id}", extra={"request_id": request_id})
        finally:
            await conn.close()
    except Exception as e:
        logger.error(f"Error inserting search log for request_id: {request_id}. Error: {str(e)}", extra={"request_id": request_id})