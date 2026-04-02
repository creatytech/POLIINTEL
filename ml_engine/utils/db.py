"""
Database utilities for the ML Engine.
Uses SQLAlchemy to connect to Supabase PostgreSQL.
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

engine = None
SessionLocal = None

if DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency for database sessions."""
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def fetch_campaign_responses(campaign_id: str, limit: int = 1000) -> list[dict]:
    """Fetch survey responses for a campaign."""
    if engine is None:
        return []

    query = text("""
        SELECT
            id, collector_id, answers, quality_score, sentiment_score,
            lat, lng, municipio_id, collected_at
        FROM survey_responses
        WHERE campaign_id = :campaign_id
          AND status = 'submitted'
        ORDER BY collected_at DESC
        LIMIT :limit
    """)

    with engine.connect() as conn:
        result = conn.execute(query, {"campaign_id": campaign_id, "limit": limit})
        return [dict(row._mapping) for row in result]


def fetch_territory_stats(campaign_id: str) -> list[dict]:
    """Fetch aggregated territory statistics for a campaign."""
    if engine is None:
        return []

    query = text("""
        SELECT territory_id, territory_level, total_responses,
               valid_responses, top_candidate, demographic_breakdown
        FROM territory_stats
        WHERE campaign_id = :campaign_id
        ORDER BY total_responses DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(query, {"campaign_id": campaign_id})
        return [dict(row._mapping) for row in result]
