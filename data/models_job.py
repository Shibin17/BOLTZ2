from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from ..db.session import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="pending") # pending, running, completed, failed

    # Store the complex description (sequences, etc.)
    inputs = Column(JSON)

    # Store prediction parameters
    params = Column(JSON)

    # Output info
    results_path = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True)
    logs = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
