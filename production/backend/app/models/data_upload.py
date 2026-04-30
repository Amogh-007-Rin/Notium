from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base


class DataUpload(Base):
    __tablename__ = "data_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_by = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    row_count = Column(Integer, default=0)
    quality_score = Column(Float, default=0.0)
    status = Column(String, default="pending")
