import path from 'path';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Pillar, ActionItem, StructuredResult } from '@/types';
import {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, Header, Footer,
    AlignmentType, TableOfContents,
    BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
} from 'docx';
import PDFDocument from 'pdfkit';

// ── Brand colours (hex without #) ──────────────────────────────────────────
const INDIGO   = '6366F1';
const TEAL     = '5aaddb';
const GREEN_H  = '059669'; const GREEN_R = 'D1FAE5';
const AMBER_H  = 'D97706'; const AMBER_R = 'FEF3C7';
const ROSE_R   = 'FEE2E2';
const INDIGO_L = 'EEF2FF';
const WHITE    = 'FFFFFF'; const GREY = '6B7280'; const DARK = '111827';
const CONTENT_W = 9026; // DXA — A4 width minus 2 × 1440 DXA margins

// ── PDF dark-theme colours ──────────────────────────────────────────────────
const PDF_LIGHT   = 'F9FAFB';
const PDF_LGREY   = '9CA3AF';
const PDF_OBJ_BG  = '1E1B4B';
const PDF_GREEN_D = '064E3B';
const PDF_AMBER_D = '78350F';
const PDF_ROSE_D  = '4C0519';

// ── Helper: indigo-bordered objective box ──────────────────────────────────
function makeObjectiveBox(text: string): Table {
    return new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [CONTENT_W],
        borders: {
            top:    { style: BorderStyle.NONE,  size: 0, color: 'auto' },
            bottom: { style: BorderStyle.NONE,  size: 0, color: 'auto' },
            right:  { style: BorderStyle.NONE,  size: 0, color: 'auto' },
            left:   { style: BorderStyle.THICK, size: 24, color: INDIGO },
        },
        rows: [new TableRow({ children: [
            new TableCell({
                width: { size: CONTENT_W, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: INDIGO_L, color: 'auto' },
                children: [
                    new Paragraph({ children: [new TextRun({ text: 'Agency Objective', bold: true, color: INDIGO })] }),
                    new Paragraph({ children: [new TextRun(text)] }),
                ],
            }),
        ]}),
        ],
    });
}

// ── Helper: amber-bordered crisis box ──────────────────────────────────────
function makeAmberBox(text: string): Table {
    return new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [CONTENT_W],
        borders: {
            top:    { style: BorderStyle.NONE,  size: 0,  color: 'auto' },
            bottom: { style: BorderStyle.NONE,  size: 0,  color: 'auto' },
            right:  { style: BorderStyle.NONE,  size: 0,  color: 'auto' },
            left:   { style: BorderStyle.THICK, size: 24, color: AMBER_H },
        },
        rows: [new TableRow({ children: [
            new TableCell({
                width: { size: CONTENT_W, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: AMBER_R, color: 'auto' },
                children: [
                    new Paragraph({ children: [new TextRun({ text: 'Dominant Crisis', bold: true, color: AMBER_H })] }),
                    new Paragraph({ children: [new TextRun(text)] }),
                ],
            }),
        ]}),
        ],
    });
}

// ── Helper: numbered list table (recommendations / flags) ──────────────────
function makeListTable(items: string[], headerText: string, headerBg: string, rowBg: string): Table {
    const headerRow = new TableRow({ children: [
        new TableCell({
            columnSpan: 2,
            width: { size: CONTENT_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: headerBg, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun({ text: headerText, bold: true, color: WHITE })] })],
        }),
    ]});
    const dataRows = items.map((item, i) => new TableRow({ children: [
        new TableCell({
            width: { size: 500, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: rowBg, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), bold: true })] })],
        }),
        new TableCell({
            width: { size: 8526, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: rowBg, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun(item)] })],
        }),
    ]}));
    return new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [500, 8526],
        rows: [headerRow, ...dataRows],
    });
}

// ── Helper: colour-coded priority action plan table ────────────────────────
// Columns: #(400) | Action(2000) | Owner(1200) | Deadline(1000) | Pillar(1226) | Consequence(3200) = 9026
const PAP_COLS = [400, 2000, 1200, 1000, 1226, 3200];

function makePriorityTable(items: ActionItem[]): Table {
    const headerRow = new TableRow({ children: (
        ['#', 'Action', 'Owner', 'Deadline', 'Pillar', 'Consequence'] as const
    ).map((label, ci) => new TableCell({
        width: { size: PAP_COLS[ci], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: INDIGO, color: 'auto' },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: WHITE })] })],
    }))});

    const dataRows = items.map((item, i) => {
        const bg = i < 2 ? ROSE_R : i < 4 ? AMBER_R : GREEN_R;
        const cells = [
            String(i + 1), item.action, item.owner, item.deadline, item.pillar, item.consequence,
        ];
        return new TableRow({ children: cells.map((val, ci) => new TableCell({
            width: { size: PAP_COLS[ci], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: bg, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun(val)] })],
        }))});
    });

    return new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: PAP_COLS,
        rows: [headerRow, ...dataRows],
    });
}

// ── Main builder ───────────────────────────────────────────────────────────
async function buildDocx(
    clientName: string,
    fileName: string,
    summary: string | null,
    structured: StructuredResult
): Promise<Buffer> {

    // Section 1 — Cover page (no header/footer)
    const coverChildren = [
        ...Array.from({ length: 8 }, () => new Paragraph({ children: [] })),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'CLIENT ANALYSIS REPORT', bold: true, size: 72, color: INDIGO })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: clientName, bold: true, size: 56, color: DARK })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INDIGO, space: 6 } },
            children: [],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: fileName, size: 24, color: GREY })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Prepared by CinaTech', size: 22, color: GREY })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
    ];

    // Section 2 — Body (with header/footer)
    const header = new Header({ children: [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({ text: 'CinaTech Client Analysis  |  ', color: GREY, size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GREY }),
            ],
        }),
    ]});

    const footer = new Footer({ children: [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Confidential \u2014 CinaTech', color: GREY, size: 16 })],
        }),
    ]});

    const bodyChildren: (Paragraph | Table)[] = [];

    // Table of contents
    bodyChildren.push(new TableOfContents('Contents', { headingStyleRange: '1-3' }) as unknown as Table);
    bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));

    // Executive Summary
    if (summary) {
        bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Executive Summary')] }));
        summary.split('\n\n').forEach(para => {
            if (para.trim()) bodyChildren.push(new Paragraph({ children: [new TextRun(para.trim())] }));
        });
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // Detailed Analysis
    bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Detailed Analysis')] }));

    // Growth Stage Assessment
    const gsa = structured.growth_stage_assessment;
    if (gsa) {
        bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Growth Stage Assessment')] }));
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: 'Classified Stage', bold: true })] }));
        bodyChildren.push(new Paragraph({ children: [new TextRun(gsa.classified_stage)] }));
        if (gsa.signals.length > 0) {
            bodyChildren.push(makeListTable(gsa.signals, 'Classification Signals', INDIGO, INDIGO_L));
        }
        bodyChildren.push(makeAmberBox(gsa.crisis_status));
        bodyChildren.push(new Paragraph({
            border: { left: { style: BorderStyle.SINGLE, size: 12, color: INDIGO, space: 4 } },
            children: [new TextRun({ text: gsa.calibration_statement, italics: true, color: GREY })],
        }));
        bodyChildren.push(new Paragraph({ children: [] }));
    }

    for (const pillar of structured.pillars) {
        bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(pillar.question)] }));
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: 'Client Context', bold: true })] }));
        bodyChildren.push(new Paragraph({ children: [new TextRun(pillar.original_response)] }));
        bodyChildren.push(makeObjectiveBox(pillar.improved_response));

        if (pillar.recommendations.length > 0) {
            bodyChildren.push(makeListTable(pillar.recommendations, 'Actionable Recommendations', GREEN_H, GREEN_R));
        }
        if (pillar.flags.length > 0) {
            bodyChildren.push(makeListTable(pillar.flags, 'Areas for Clarification', AMBER_H, AMBER_R));
        }
        bodyChildren.push(new Paragraph({ children: [] }));
    }

    // Priority Action Plan
    if (structured.priority_action_plan.length > 0) {
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
        bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Priority Action Plan')] }));
        bodyChildren.push(makePriorityTable(structured.priority_action_plan));
    }

    const doc = new Document({
        features: { updateFields: true },
        styles: {
            paragraphStyles: [
                {
                    id: 'Heading1', name: 'heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                    run: { bold: true, size: 32, color: INDIGO },
                    paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
                },
                {
                    id: 'Heading2', name: 'heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                    run: { bold: true, size: 26, color: DARK },
                    paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 },
                },
            ],
        },
        sections: [
            { children: coverChildren },
            { headers: { default: header }, footers: { default: footer }, children: bodyChildren },
        ],
    });

    return Packer.toBuffer(doc);
}

async function buildPdf(
    clientName: string,
    fileName: string,
    summary: string | null,
    structured: StructuredResult
): Promise<Buffer> {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = await sharp(logoPath).trim().png().toBuffer();

    return new Promise<Buffer>((resolve, reject) => {
        // ── Layout constants ────────────────────────────────────────────────
        const M           = 60;
        const CW          = 475.28;   // 595.28 - 2×60
        const PH          = 841.89;
        const SAFE_BOTTOM = PH - M - 30;

        const doc = new PDFDocument({
            size: 'A4',
            margin: M,
            bufferPages: true,
            info: { Title: 'Client Analysis Report', Author: 'CinaTech' },
        });

        const chunks: Buffer[] = [];
        doc.on('data',  (chunk: Buffer) => chunks.push(chunk));
        doc.on('error', reject);
        doc.on('end',   () => resolve(Buffer.concat(chunks)));

        // ── Helpers ─────────────────────────────────────────────────────────

        function fillPageBg(): void {
            doc.rect(0, 0, 595.28, PH).fillColor(`#${DARK}`).fill();
        }

        function checkPageBreak(h: number): void {
            if (doc.y + h > SAFE_BOTTOM) { doc.addPage(); fillPageBg(); }
        }

        function drawH1(text: string): void {
            const h = doc.font('Helvetica-Bold').fontSize(18).heightOfString(text, { width: CW }) + 20;
            checkPageBreak(h);
            doc.moveDown(0.5)
               .font('Helvetica-Bold').fontSize(18).fillColor(`#${TEAL}`)
               .text(text, M, doc.y, { width: CW })
               .fillColor(`#${PDF_LIGHT}`).moveDown(0.4);
        }

        function drawH2(text: string): void {
            const h = doc.font('Helvetica-Bold').fontSize(13).heightOfString(text, { width: CW }) + 12;
            checkPageBreak(h);
            doc.moveDown(0.3)
               .font('Helvetica-Bold').fontSize(13).fillColor(`#${PDF_LIGHT}`)
               .text(text, M, doc.y, { width: CW })
               .moveDown(0.25);
        }

        function drawBodyText(text: string): void {
            checkPageBreak(doc.font('Helvetica').fontSize(10).heightOfString(text, { width: CW, lineGap: 3 }) + 6);
            doc.font('Helvetica').fontSize(10).fillColor(`#${PDF_LIGHT}`)
               .text(text, M, doc.y, { width: CW, lineGap: 3 });
        }

        function drawLabel(label: string): void {
            checkPageBreak(16);
            doc.moveDown(0.3)
               .font('Helvetica-Bold').fontSize(10).fillColor(`#${PDF_LIGHT}`)
               .text(label, M, doc.y, { width: CW });
        }

        function drawObjectiveBox(text: string): void {
            const BORDER_W = 3;
            const PAD      = 8;
            const innerW   = CW - BORDER_W - PAD * 2;
            const labelH   = doc.font('Helvetica-Bold').fontSize(10).currentLineHeight(true);
            const textH    = doc.font('Helvetica').fontSize(10).heightOfString(text, { width: innerW, lineGap: 3 });
            const boxH     = PAD + labelH + 4 + textH + PAD;

            checkPageBreak(boxH + 8);
            doc.moveDown(0.3);
            const y = doc.y;

            doc.rect(M, y, BORDER_W, boxH).fillColor(`#${TEAL}`).fill();
            doc.rect(M + BORDER_W, y, CW - BORDER_W, boxH).fillColor(`#${PDF_OBJ_BG}`).fill();

            doc.font('Helvetica-Bold').fontSize(10).fillColor(`#${TEAL}`)
               .text('Agency Objective:', M + BORDER_W + PAD, y + PAD, { width: innerW });
            doc.font('Helvetica').fontSize(10).fillColor(`#${PDF_LIGHT}`)
               .text(text, M + BORDER_W + PAD, y + PAD + labelH + 4, { width: innerW, lineGap: 3 });

            doc.y = y + boxH + 4;
        }

        function drawAmberBox(text: string): void {
            const BORDER_W = 3;
            const PAD      = 8;
            const innerW   = CW - BORDER_W - PAD * 2;
            const labelH   = doc.font('Helvetica-Bold').fontSize(10).currentLineHeight(true);
            const textH    = doc.font('Helvetica').fontSize(10).heightOfString(text, { width: innerW, lineGap: 3 });
            const boxH     = PAD + labelH + 4 + textH + PAD;

            checkPageBreak(boxH + 8);
            doc.moveDown(0.3);
            const y = doc.y;

            doc.rect(M, y, BORDER_W, boxH).fillColor(`#${AMBER_H}`).fill();
            doc.rect(M + BORDER_W, y, CW - BORDER_W, boxH).fillColor(`#${PDF_AMBER_D}`).fill();

            doc.font('Helvetica-Bold').fontSize(10).fillColor(`#${AMBER_H}`)
               .text('Dominant Crisis:', M + BORDER_W + PAD, y + PAD, { width: innerW });
            doc.font('Helvetica').fontSize(10).fillColor(`#${PDF_LIGHT}`)
               .text(text, M + BORDER_W + PAD, y + PAD + labelH + 4, { width: innerW, lineGap: 3 });

            doc.y = y + boxH + 4;
        }

        function drawNumberedList(
            items: string[],
            headerText: string,
            headerBg: string,
            rowBg: string,
        ): void {
            if (items.length === 0) return;
            const NUM_W   = 28;
            const TEXT_W  = CW - NUM_W;
            const H_PAD   = 6;
            const V_PAD   = 5;

            const headerH = doc.font('Helvetica-Bold').fontSize(10)
                               .heightOfString(headerText, { width: CW - H_PAD * 2 }) + V_PAD * 2;
            checkPageBreak(headerH);
            let rowY = doc.y + 2;

            doc.rect(M, rowY, CW, headerH).fillColor(`#${headerBg}`).fill();
            doc.font('Helvetica-Bold').fontSize(10).fillColor(`#${WHITE}`)
               .text(headerText, M + H_PAD, rowY + V_PAD, { width: CW - H_PAD * 2 });
            doc.y = rowY + headerH;

            items.forEach((item, i) => {
                const rowTextH = doc.font('Helvetica').fontSize(10)
                                    .heightOfString(item, { width: TEXT_W - H_PAD * 2, lineGap: 2 });
                const rowH = rowTextH + V_PAD * 2;
                checkPageBreak(rowH);
                rowY = doc.y;

                doc.rect(M,          rowY, NUM_W,  rowH).fillColor(`#${rowBg}`).fill();
                doc.rect(M + NUM_W,  rowY, TEXT_W, rowH).fillColor(`#${rowBg}`).fill();

                doc.font('Helvetica-Bold').fontSize(10).fillColor(`#${PDF_LIGHT}`)
                   .text(String(i + 1), M + 4, rowY + V_PAD, { width: NUM_W - 8, align: 'center' });
                doc.font('Helvetica').fontSize(10).fillColor(`#${PDF_LIGHT}`)
                   .text(item, M + NUM_W + H_PAD, rowY + V_PAD, { width: TEXT_W - H_PAD * 2, lineGap: 2 });

                doc.y = rowY + rowH;
            });

            doc.moveDown(0.5);
        }

        function drawActionCard(item: ActionItem, index: number): void {
            const bg        = index < 2 ? PDF_ROSE_D : index < 4 ? PDF_AMBER_D : PDF_GREEN_D;
            const BADGE     = 22;
            const PAD       = 10;
            const TEXT_X    = M + BADGE + PAD * 2;
            const TEXT_W    = CW - BADGE - PAD * 3;
            const metaLine  = `Owner: ${item.owner}  |  Deadline: ${item.deadline}  |  Pillar: ${item.pillar}`;

            const actionH = doc.font('Helvetica-Bold').fontSize(11).heightOfString(item.action, { width: TEXT_W });
            const metaH   = doc.font('Helvetica').fontSize(9).heightOfString(metaLine, { width: TEXT_W });
            const conseqH = doc.font('Helvetica').fontSize(9)
                               .heightOfString(`Consequence: ${item.consequence}`, { width: TEXT_W });
            const cardH   = Math.max(BADGE + PAD * 2, actionH + metaH + conseqH + PAD * 2 + 6);

            checkPageBreak(cardH + 6);
            const cardY = doc.y + 4;

            doc.roundedRect(M, cardY, CW, cardH, 4).fillColor(`#${bg}`).fill();

            const badgeCX = M + PAD + BADGE / 2;
            const badgeCY = cardY + PAD + BADGE / 2;
            doc.circle(badgeCX, badgeCY, BADGE / 2).fillColor(`#${INDIGO}`).fill();
            doc.font('Helvetica-Bold').fontSize(10).fillColor(`#${WHITE}`)
               .text(String(index + 1), M + PAD, badgeCY - 6, { width: BADGE, align: 'center' });

            let textY = cardY + PAD;
            doc.font('Helvetica-Bold').fontSize(11).fillColor(`#${PDF_LIGHT}`)
               .text(item.action, TEXT_X, textY, { width: TEXT_W });
            textY += actionH + 4;
            doc.font('Helvetica').fontSize(9).fillColor(`#${PDF_LGREY}`)
               .text(metaLine, TEXT_X, textY, { width: TEXT_W });
            textY += metaH + 3;
            doc.font('Helvetica').fontSize(9).fillColor(`#${PDF_LIGHT}`)
               .text(`Consequence: ${item.consequence}`, TEXT_X, textY, { width: TEXT_W });

            doc.y = cardY + cardH + 4;
        }

        function addPageNumbers(): void {
            const range = doc.bufferedPageRange();
            for (let i = 1; i < range.count; i++) {
                doc.switchToPage(i);
                doc.page.margins.bottom = 0;
                doc.font('Helvetica').fontSize(9).fillColor(`#${PDF_LGREY}`)
                   .text(`Page ${i}`, M, PH - M + 8, { width: CW, align: 'center', lineBreak: false });
            }
            doc.flushPages();
        }

        // ── Cover page (page 0, auto-created) ───────────────────────────────
        fillPageBg();
        const BAND_H = 140;
        doc.rect(0, 0, 595.28, BAND_H).fillColor(`#${TEAL}`).fill();
        doc.font('Helvetica-Bold').fontSize(14).fillColor(`#${WHITE}`)
           .text('CLIENT ANALYSIS REPORT', 0, 54, { width: 595.28, align: 'center' });

        // Logo centred below the header band — trim white border, preserve transparency
        const logoW = 120;
        const logoX = (595.28 - logoW) / 2;
        doc.image(logoBuffer, logoX, BAND_H + 10, { width: logoW });

        doc.font('Helvetica-Bold').fontSize(28).fillColor(`#${PDF_LIGHT}`)
           .text(clientName, M, BAND_H + 150, { width: CW, align: 'center' });

        const sepY = BAND_H + 210;
        doc.moveTo(M, sepY).lineTo(M + CW, sepY).strokeColor(`#${INDIGO}`).lineWidth(1).stroke();

        doc.font('Helvetica').fontSize(10).fillColor(`#${PDF_LGREY}`)
           .text(fileName, M, sepY + 18, { width: CW, align: 'center' });
        doc.font('Helvetica').fontSize(10).fillColor(`#${PDF_LGREY}`)
           .text('Prepared by CinaTech', M, sepY + 36, { width: CW, align: 'center' });

        // ── Body pages ───────────────────────────────────────────────────────
        doc.addPage();
        fillPageBg();

        if (summary) {
            drawH1('Executive Summary');
            for (const para of summary.split('\n\n').filter(p => p.trim())) {
                drawBodyText(para.trim());
                doc.moveDown(0.4);
            }
            doc.moveDown(0.6);
        }

        drawH1('Detailed Analysis');

        // Growth Stage Assessment
        const gsaPdf = structured.growth_stage_assessment;
        if (gsaPdf) {
            drawH2('Growth Stage Assessment');
            drawLabel('Classified Stage:');
            drawBodyText(gsaPdf.classified_stage);
            if (gsaPdf.signals.length > 0) {
                doc.moveDown(0.3);
                drawNumberedList(gsaPdf.signals, 'Classification Signals', INDIGO, PDF_OBJ_BG);
            }
            drawAmberBox(gsaPdf.crisis_status);
            // Calibration statement — italic with indigo left rule
            const CAL_PAD = 8;
            const calW = CW - CAL_PAD * 2 - 3;
            const calH = doc.font('Helvetica-Oblique').fontSize(10)
                            .heightOfString(gsaPdf.calibration_statement, { width: calW, lineGap: 3 });
            checkPageBreak(calH + 12);
            doc.moveDown(0.4);
            const calY = doc.y;
            doc.moveTo(M, calY).lineTo(M, calY + calH + CAL_PAD).strokeColor(`#${INDIGO}`).lineWidth(2).stroke();
            doc.font('Helvetica-Oblique').fontSize(10).fillColor(`#${PDF_LGREY}`)
               .text(gsaPdf.calibration_statement, M + 3 + CAL_PAD, calY, { width: calW, lineGap: 3 });
            doc.y = calY + calH + CAL_PAD + 4;
            doc.moveDown(0.6);
        }

        for (const pillar of structured.pillars) {
            drawH2(pillar.question);
            drawLabel('Client Context:');
            drawBodyText(pillar.original_response);
            drawObjectiveBox(pillar.improved_response);
            if (pillar.recommendations.length > 0) {
                doc.moveDown(0.3);
                drawNumberedList(pillar.recommendations, 'Actionable Recommendations', GREEN_H, PDF_GREEN_D);
            }
            if (pillar.flags.length > 0) {
                doc.moveDown(0.3);
                drawNumberedList(pillar.flags, 'Areas for Clarification', AMBER_H, PDF_AMBER_D);
            }
            doc.moveDown(0.8);
        }

        if (structured.priority_action_plan.length > 0) {
            doc.addPage();
            fillPageBg();
            drawH1('Priority Action Plan');
            structured.priority_action_plan.forEach((item, i) => drawActionCard(item, i));
        }

        // ── Page numbers then finalise ───────────────────────────────────────
        addPageNumbers();
        doc.end();
    });
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const { id: documentId } = await props.params;
    const format = request.nextUrl.searchParams.get('format');

    if (format !== 'docx' && format !== 'pdf') {
        return NextResponse.json({ error: 'format must be docx or pdf' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: document, error } = await supabase
        .from('documents')
        .select('*, clients(name), analyses(summary, structured_result, version)')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .order('version', { ascending: false, referencedTable: 'analyses' })
        .single();

    if (error || !document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.status !== 'ready') {
        return NextResponse.json({ error: 'Analysis not ready' }, { status: 423 });
    }

    const analysis = (document.analyses as { summary: string; structured_result: unknown; version: number }[] | null)?.[0];
    if (!analysis) {
        return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
    }

    const clientName = (document.clients as { name: string } | null)?.name ?? 'Unknown Client';
    const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const structured = analysis.structured_result as StructuredResult;

    if (format === 'docx') {
        const buffer = await buildDocx(clientName, document.file_name, analysis.summary, structured);
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${safeClientName}_analysis.docx"`,
            },
        });
    }

    const buffer = await buildPdf(clientName, document.file_name, analysis.summary, structured);
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeClientName}_analysis.pdf"`,
        },
    });
}
