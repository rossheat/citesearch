import os
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv
from utils import extract_pmc_id
import logging
import uuid
import time
import json
import asyncio
import aiohttp

from models import CitationRequest, CitationResponse, Citation
from database import log_search
from logging_config import setup_logging
from utils import load_file_content
from citation_service import generate_citations, check_relevance
from search_service import build_google_search_url, process_search_result

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = setup_logging()

OU_HARVARD_CTR_GUIDE_PATH = "ou_harvard_cite_them_right_guide.md"

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    request_id = getattr(request.state, 'request_id', 'N/A')
    logger.error(f"HTTP exception: {exc.detail}", extra={"request_id": request_id})
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_messages = []
    for error in errors:
        if error["type"] == "value_error":
            error_messages.append(error["msg"])
        elif error["type"] == "missing":
            error_messages.append(f"Missing required field: {error['loc'][-1]}")
    
    return JSONResponse(
        status_code=400,
        content={"detail": error_messages},
        )

@app.post("/find-citations-for-passage", response_model=CitationResponse)
async def find_citations_for_passage(request: CitationRequest, background_tasks: BackgroundTasks, fastapi_request: Request):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    logger.info(f"Received citation request for text: {request.text[:50]}...", extra={"request_id": request_id})
    guide_content = load_file_content(OU_HARVARD_CTR_GUIDE_PATH)
    
    try:
        search_url = build_google_search_url(request.text)
        logger.info(f"Sending request to Google Custom Search API: {search_url}", extra={"request_id": request_id})
        async with aiohttp.ClientSession() as session:
            async with session.get(search_url) as response:
                response.raise_for_status()
                search_data = await response.json()
        logger.debug(f"Google Custom Search API response: {search_data}", extra={"request_id": request_id})

        found_pmc_ids = [extract_pmc_id(item["link"]) for item in search_data.get("items", [])]
        found_pmc_ids = [pmc_id for pmc_id in found_pmc_ids if pmc_id]

        async with aiohttp.ClientSession() as session:
            tasks = [process_search_result(session, item, guide_content, request.text, request_id) 
                     for item in search_data.get("items", [])[:10]]
            results = await asyncio.gather(*tasks)

        results = [r for r in results if r is not None]
        citations = [r["citation"] for r in results]
        processed_pmc_ids = [citation.pmc_id for citation in citations]
        citation_generation_results = [r["citation_result"] for r in results]
        relevance_check_results = [r["relevance_result"] for r in results]

        logger.info(f"Found {len(citations)} relevant citations", extra={"request_id": request_id})
        
        response_time = time.time() - start_time
        response = CitationResponse(search_text=request.text, citations=citations)
        
        background_tasks.add_task(
            log_search,
            request_id=request_id,
            client_ip=fastapi_request.client.host,
            user_agent=fastapi_request.headers.get("user-agent", "unknown"),
            search_text=request.text,
            query_params=dict(fastapi_request.query_params),
            response_status=200,
            response_time=response_time,
            citations_found=len(citations),
            search_results=search_data,
            found_pmc_ids=found_pmc_ids,
            processed_pmc_ids=processed_pmc_ids,
            citation_generation_results=citation_generation_results,
            relevance_check_results=relevance_check_results,
            final_citations=[citation.dict() for citation in citations]
        )
        
        return response

    except aiohttp.ClientError as e:
        logger.error(f"Error fetching data: {str(e)}", extra={"request_id": request_id})
        raise HTTPException(status_code=503, detail=f"Error fetching data: {str(e)}")
    except Exception as e:
        logger.error(f"Internal server error: {str(e)}", extra={"request_id": request_id})
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")
    path = request.url.path
    query_params = dict(request.query_params)

    logger.info(f"Request received: Path={path}, IP={client_ip}, User-Agent={user_agent}, QueryParams={query_params}", extra={"request_id": request_id})

    request.state.request_id = request_id
    response = await call_next(request)

    logger.info(f"Response status: {response.status_code}, Path={path}, IP={client_ip}, RequestID={request_id}", extra={"request_id": request_id})
    return response

if __name__ == "__main__":
    import uvicorn

    logger.info("Starting citation app server", extra={"request_id": "N/A"})

    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=300)