from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.utils.auth import get_current_user
from app.services import kpi_calculator
from app.state import app_state
import io

router = APIRouter(prefix="/kpis", tags=["kpis"])


@router.get("/summary")
def get_summary(
    product: str = Query("all"),
    segment: str = Query("all"),
    period_start: Optional[str] = Query(None),
    period_end: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return kpi_calculator.compute_summary(db, product, segment, period_start, period_end)


@router.get("/by-product")
def get_by_product(
    period_start: Optional[str] = Query(None),
    period_end: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return kpi_calculator.compute_by_product(
        db, period_start, period_end,
        risk_classifier=app_state.risk_classifier
    )


@router.get("/time-series")
def get_time_series(
    product: str = Query("all"),
    granularity: str = Query("monthly"),
    period_start: Optional[str] = Query(None),
    period_end: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return kpi_calculator.compute_time_series(db, product, granularity, period_start, period_end)


@router.get("/by-segment")
def get_by_segment(
    period_start: Optional[str] = Query(None),
    period_end: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return kpi_calculator.compute_by_segment(db, period_start, period_end)


@router.post("/export-pdf")
def export_pdf(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Notium Profitability Intelligence Platform", styles["Title"]))
    elements.append(Paragraph("KPI Summary Report", styles["Heading2"]))
    elements.append(Spacer(1, 12))

    summary = kpi_calculator.compute_summary(db)
    data = [
        ["Metric", "Value"],
        ["Total Revenue", f"£{summary['total_revenue']:,.2f}"],
        ["Total Cost", f"£{summary['total_cost']:,.2f}"],
        ["Total Profit", f"£{summary['total_profit']:,.2f}"],
        ["Profit Margin %", f"{summary['profit_margin_pct']:.2f}%"],
        ["YoY Growth", f"{summary['yoy_growth_pct']:.2f}%"],
        ["MoM Change", f"{summary['mom_change_pct']:.2f}%"],
    ]
    t = Table(data, colWidths=[200, 200])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D1321")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F4FF")]),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("This report is for decision support only.", styles["Italic"]))

    doc.build(elements)
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=notium-kpi-report.pdf"},
    )
