from typing import List, Optional
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

Base = declarative_base()

class CitationRequest(BaseModel):
    text: str = Field(..., description="The passage of text to find citations for")

    @validator('text')
    def check_word_count(cls, v):
        word_count = len(v.split())
        if word_count < MIN_WORD_COUNT or word_count > MAX_WORD_COUNT:
            raise ValueError(f"Text must be between {MIN_WORD_COUNT} and {MAX_WORD_COUNT} words. Current word count: {word_count}")
        return v

class Citation(BaseModel):
    reference_list_citation: str
    in_text_citation: str
    supporting_passage: str
    reasoning: str
    pmc_id: str
    title: str
    doi: Optional[str]
    pmc_link: str
    publication_date: str

class CitationResponse(BaseModel):
    search_text: str
    citations: List[Citation]

class SearchLog(Base):
    __tablename__ = "searches"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    client_ip = Column(String)
    user_agent = Column(String)
    search_text = Column(String)
    query_params = Column(JSONB)
    response_status = Column(Integer)
    response_time = Column(Float)
    citations_found = Column(Integer)
    search_results = Column(JSONB)
    found_pmc_ids = Column(JSONB)
    processed_pmc_ids = Column(JSONB)
    citation_generation_results = Column(JSONB)
    relevance_check_results = Column(JSONB)
    final_citations = Column(JSONB)

MAX_WORD_COUNT = 300
MIN_WORD_COUNT = 5