import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def create_guide_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    primary_color = colors.HexColor('#1E3A8A')  # Deep Blue
    secondary_color = colors.HexColor('#0F172A') # Slate 900
    accent_color = colors.HexColor('#2563EB')   # Blue 600
    emerald_color = colors.HexColor('#059669')  # Emerald 600
    amber_color = colors.HexColor('#D97706')    # Amber 600
    card_bg = colors.HexColor('#F8FAFC')        # Slate 50
    border_color = colors.HexColor('#E2E8F0')   # Slate 200

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=secondary_color,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    table_body_bold = ParagraphStyle(
        'TableBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=primary_color
    )

    story = []

    # Title & Header
    story.append(Paragraph("NVP ENGLISH MEDIUM SCHOOL, NIMBI JODHAN", title_style))
    story.append(Paragraph("MASTER ADMINISTRATOR & DEPLOYMENT CHEAT SHEET", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=12))

    # SECTION 1: MASTER CREDENTIALS & SECRET KEYS
    story.append(Paragraph("1. Current Secret Keys & Master Credentials", h1_style))
    story.append(Paragraph("Yeh confidential data hai. Ise sirf Head Administrator ke pass surakshit rakhein.", body_style))

    cred_data = [
        [Paragraph("Field / Item", table_header_style), Paragraph("Confidential Value (Current)", table_header_style), Paragraph("Purpose / Use Case", table_header_style)],
        [Paragraph("Master Recovery Key", table_body_bold), Paragraph("NVP-HEAD-RECOVERY-KEY-2026", code_style), Paragraph("Secret /admin URL se password reset karne ke liye", table_body_style)],
        [Paragraph("Head Admin Email", table_body_bold), Paragraph("head@school.local", code_style), Paragraph("Super-Admin Portal Login Email", table_body_style)],
        [Paragraph("Head Default Password", table_body_bold), Paragraph("Head@12345", code_style), Paragraph("Initial First-Time Login Password (Changeable)", table_body_style)],
        [Paragraph("Secret Admin Gate URL", table_body_bold), Paragraph("https://your-site.vercel.app/admin", code_style), Paragraph("Stealth URL (Normal login par ye kisi ko nahi dikhega)", table_body_style)],
        [Paragraph("Public Portal URL", table_body_bold), Paragraph("https://your-site.vercel.app/login", code_style), Paragraph("Students, Teachers, and Staff portal entry", table_body_style)],
    ]

    t_cred = Table(cred_data, colWidths=[140, 200, 180])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 12))

    # SECTION 2: PASSWORD FORGOT & EMERGENCY RECOVERY
    story.append(Paragraph("2. Emergency Password Recovery (Aapke Passwords Bhoolne Par)", h1_style))

    recov_data = [
        [Paragraph("Situation", table_header_style), Paragraph("Solution Step-by-Step", table_header_style)],
        [
            Paragraph("Case 1: Sirf Head Password Bhool Gaye", table_body_bold),
            Paragraph("1. Browser me open karein: <b>https://your-site.vercel.app/admin</b><br/>2. <b>'Emergency Recovery'</b> button par click karein.<br/>3. Master Recovery Key dalein: <b>NVP-HEAD-RECOVERY-KEY-2026</b><br/>4. Naya password daal kar submit karein. Turant reset ho jayega!", table_body_style)
        ],
        [
            Paragraph("Case 2: Password + Master Key DONO Bhool Gaye", table_body_bold),
            Paragraph("1. <b>Render.com</b> dashboard me login karein.<br/>2. Apni Backend Service open karein aur <b>'Shell'</b> tab (terminal) kholein.<br/>3. Sirf ye command likhein: <b>npm run reset-admin MeraNayaPassword123</b><br/>4. Bina kisi key ke direct Head ka password reset ho jayega!", table_body_style)
        ],
        [
            Paragraph("Case 3: Local Computer Par Reset Karna Ho", table_body_bold),
            Paragraph("VS Code ya CMD terminal me project folder me command chalayein:<br/><b>npm run reset-admin MeraNayaPassword123</b>", table_body_style)
        ]
    ]

    t_recov = Table(recov_data, colWidths=[160, 360])
    t_recov.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F766E')), # Teal 700
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_recov)
    story.append(Spacer(1, 12))

    # SECTION 3: STEP-BY-STEP DEPLOYMENT ROADMAP
    story.append(Paragraph("3. Step-by-Step Deployment Guide (Render + Vercel)", h1_style))

    deploy_data = [
        [Paragraph("Step", table_header_style), Paragraph("Platform", table_header_style), Paragraph("Key Actions / Settings", table_header_style)],
        [
            Paragraph("Step 1", table_body_bold),
            Paragraph("Render.com<br/>(Backend)", table_body_bold),
            Paragraph("1. Web Service create karein aur GitHub repo link karein.<br/>2. Build Command: <b>npm install</b> | Start Command: <b>node backend/server.js</b><br/>3. Environment Variables dalein:<br/>   * <b>MONGODB_URI</b> = (Atlas Cloud Connection String)<br/>   * <b>JWT_SECRET</b> = nvp_school_super_secret_jwt_key_2026_change_this<br/>   * <b>ADMIN_RECOVERY_KEY</b> = NVP-HEAD-RECOVERY-KEY-2026<br/>   * <b>NODE_ENV</b> = production<br/>4. Deploy hone par Backend URL copy karein (e.g. <i>https://nvp-backend.onrender.com</i>).", table_body_style)
        ],
        [
            Paragraph("Step 2", table_body_bold),
            Paragraph("Vercel.com<br/>(Frontend)", table_body_bold),
            Paragraph("1. Add New Project aur GitHub repo select karein.<br/>2. Root Directory: <b>frontend</b> select karein.<br/>3. Framework Preset: <b>Vite</b> (Auto-detected).<br/>4. Environment Variable dalein:<br/>   * <b>VITE_API_URL</b> = https://nvp-backend.onrender.com (Bina trailing slash ke).<br/>5. Deploy karein. Aapki website live ho jayegi!", table_body_style)
        ]
    ]

    t_deploy = Table(deploy_data, colWidths=[50, 100, 370])
    t_deploy.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_deploy)
    story.append(Spacer(1, 12))

    # SECTION 4: TEACHER DATA & ATTENDANCE ISOLATION POLICY
    story.append(Paragraph("4. Teacher Access & Attendance Security Rules", h1_style))

    rules_data = [
        [Paragraph("Feature / Module", table_header_style), Paragraph("Strict Access Rule Applied", table_header_style)],
        [
            Paragraph("Student Attendance", table_body_bold),
            Paragraph("Teachers <b>sirf aur sirf apni assigned classes</b> ki attendance le sakte hain. Kisi unassigned class ko na dekh sakte hain na mark kar sakte hain (Backend 403 Forbidden protection).", table_body_style)
        ],
        [
            Paragraph("Question Papers", table_body_bold),
            Paragraph("Teacher ko sirf <b>unke dwara banaye gaye question papers</b> dikhenge. Dusre teachers ke papers bilkul nahi dikhenge.", table_body_style)
        ],
        [
            Paragraph("Homework / Assignments", table_body_bold),
            Paragraph("Teacher sirf apne dwara issue kiye gaye homework/assignments manage kar sakte hain. School-wide diary sirf Head/Principal dekh sakte hain.", table_body_style)
        ],
        [
            Paragraph("Student List & Privacy", table_body_bold),
            Paragraph("Teacher search me sirf unki assigned classes ke bachhe aayenge. Pure school ke sabhi students ka data unse private rahega.", table_body_style)
        ],
        [
            Paragraph("Faculty Attendance", table_body_bold),
            Paragraph("Teacher ko sirf apna check-in/check-out dikhega; baaki staff ka attendance status confidential rahega.", table_body_style)
        ]
    ]

    t_rules = Table(rules_data, colWidths=[130, 390])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')), # Slate 700
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_rules)
    story.append(Spacer(1, 14))

    # Footer note
    footer_text = Paragraph(
        "<b>Important Note:</b> Yeh document confidential hai. Isme Head Administrator ke master keys aur reset procedures hain. Ise school management ki surakshit jagah par rakhein.",
        ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#DC2626'), alignment=1)
    )
    story.append(footer_text)

    doc.build(story)
    print(f"[Success] PDF generated: {filename}")

if __name__ == '__main__':
    target_path = os.path.join(os.path.dirname(__file__), '..', 'NVP_School_Master_Guide.pdf')
    create_guide_pdf(os.path.abspath(target_path))
