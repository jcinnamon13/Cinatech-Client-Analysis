'use strict';

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  ShadingType,
  BorderStyle,
  PageBreak,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Page geometry — US Letter
// 1 inch = 1440 DXA.  Margins: 1 inch all sides.
// ---------------------------------------------------------------------------
const PAGE_WIDTH = 12240;   // DXA
const PAGE_HEIGHT = 15840;  // DXA
const MARGIN = 1440;        // 1 inch
const USABLE_WIDTH = PAGE_WIDTH - 2 * MARGIN; // 9360 DXA

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const BRAND_BLUE   = '1F4E79';
const ACCENT_BLUE  = '2E74B5';
const GUIDANCE_GREY  = '595959';
const PLACEHOLDER_GREY = 'A6A6A6';
const RESPONSE_BG  = 'F2F2F2';

// ---------------------------------------------------------------------------
// Font sizes in half-points (docx convention: 1pt = 2 units)
// ---------------------------------------------------------------------------
const PT = (n) => n * 2;

// ---------------------------------------------------------------------------
// Pillar data — 9 pillars, 23 questions total (verbatim from XLSX template)
// ---------------------------------------------------------------------------
const PILLARS = [
  {
    number: 1,
    name: 'COMPETITIVE POSITIONING AND DIFFERENTIATION',
    questions: [
      {
        ref: 'P1.Q1',
        text: 'Who are your top 3 competitors and how do clients typically compare you to them?',
        guidance: 'Name them directly. Note how prospects frame the comparison \u2014 price, quality, specialisation, speed, or reputation.',
        placeholder: 'List competitors and how prospects compare you to them',
      },
      {
        ref: 'P1.Q2',
        text: 'What is your primary point of differentiation? (price, quality, specialisation, speed, or results guarantee)',
        guidance: 'Choose one main differentiator and explain it briefly. What would a client say if asked why they chose you over a competitor?',
        placeholder: 'Describe your primary differentiator and why clients choose you',
      },
      {
        ref: 'P1.Q3',
        text: 'What do competitors offer that you currently do not?',
        guidance: 'Be honest. This is not a weakness to hide \u2014 it is intelligence the agency needs to give you accurate strategic advice.',
        placeholder: 'List gaps honestly \u2014 services, reach, pricing, technology, etc.',
      },
    ],
  },
  {
    number: 2,
    name: 'TARGET MARKET DEFINITION AND IDEAL CLIENT PROFILE',
    questions: [
      {
        ref: 'P2.Q1',
        text: 'Describe your ideal client \u2014 industry, company size, geography, and decision-maker role.',
        guidance: "Be specific. \u2018SMEs in the UK\u2019 is not enough. Example: \u2018Owner-operated aesthetics clinics in England, 2\u201310 staff, decision-maker is the clinic owner directly.\u2019",
        placeholder: 'Industry / company size / geography / decision-maker role',
      },
      {
        ref: 'P2.Q2',
        text: 'What is the single biggest problem your best clients had before working with you?',
        guidance: 'State it in the client\u2019s own words if possible. This feeds directly into the Jobs-to-be-Done analysis.',
        placeholder: 'The core problem your best clients had \u2014 in their own words if possible',
      },
      {
        ref: 'P2.Q3',
        text: 'Which client segments are most profitable for you, and which do you want more of?',
        guidance: 'These may not be the same. Distinguish between your current best clients and your target best clients.',
        placeholder: 'Most profitable segment now / segment you want more of',
      },
    ],
  },
  {
    number: 3,
    name: 'CLIENT ACQUISITION AND GROWTH ENGINE',
    questions: [
      {
        ref: 'P3.Q1',
        text: 'What are your top 3 lead sources by volume and by revenue?',
        guidance: 'Volume and revenue rankings often differ \u2014 a referral brings fewer leads but higher value. List both rankings separately.',
        placeholder: 'Top 3 by volume / Top 3 by revenue',
      },
      {
        ref: 'P3.Q2',
        text: 'What is your average cost to acquire a new client and your average first-year client value (\u00a3)?',
        guidance: 'Rough estimates are fine. Include time cost if there is no fixed ad spend. CAC and LTV are foundational to the Ansoff Matrix analysis.',
        placeholder: 'Average CAC \u00a3 / Average first-year client value \u00a3',
      },
      {
        ref: 'P3.Q3',
        text: 'What is your current lead-to-client conversion rate, and where do most prospects drop off?',
        guidance: 'Identify the drop-off stage: awareness, enquiry, proposal, or close. Even a rough percentage is useful.',
        placeholder: 'Conversion rate % / Stage where prospects most commonly drop off',
      },
    ],
  },
  {
    number: 4,
    name: 'ONBOARDING FRICTION AND OPERATIONAL READINESS',
    questions: [
      {
        ref: 'P4.Q1',
        text: 'Walk us through your current client onboarding process. Where are the most common delays or friction points?',
        guidance: 'List each step in sequence. Mark any step that regularly causes delays, confusion, or client complaints.',
        placeholder: 'Step-by-step onboarding process / friction points or common delays',
      },
      {
        ref: 'P4.Q2',
        text: 'What tools and systems underpin your service delivery? List any manual steps you would like to automate.',
        guidance: 'Include CRM, project management, communication, billing, and reporting tools. Note any spreadsheet-based or email-based processes.',
        placeholder: 'Tools and systems used / manual steps you want to automate',
      },
    ],
  },
  {
    number: 5,
    name: 'PROOF OF RESULTS AND CASE STUDIES',
    questions: [
      {
        ref: 'P5.Q1',
        text: 'Do you have documented client outcomes, case studies, or testimonials? Describe 1\u20132 specific results with numbers.',
        guidance: 'Include percentages, revenue figures, time saved, or leads generated. Vague praise (\u2018great results\u2019) is far less useful than specific numbers.',
        placeholder: 'Outcome 1 with numbers / Outcome 2 with numbers',
      },
      {
        ref: 'P5.Q2',
        text: 'How do you currently present proof of results to prospects during the sales process?',
        guidance: 'Examples: case study PDF, video testimonials, live results dashboard, written reference, reference call. Be specific about the format and timing.',
        placeholder: 'How proof is presented to prospects \u2014 format and timing',
      },
    ],
  },
  {
    number: 6,
    name: 'SERVICE DELIVERY MODEL AND SCALABILITY',
    questions: [
      {
        ref: 'P6.Q1',
        text: 'How is your service delivered? (Done-for-you / Done-with-you / Self-serve / Hybrid)',
        guidance: 'Done-for-you = you do the work. Done-with-you = collaborative. Self-serve = client uses your platform/tools. Hybrid/Mixed = combination.',
        placeholder: 'Select delivery model and describe how it works in practice',
      },
      {
        ref: 'P6.Q2',
        text: 'What is your maximum client capacity at current headcount, without further hiring?',
        guidance: 'Estimate based on hours per client per week \u00d7 available team hours. Include yourself in the calculation if you are the primary delivery resource.',
        placeholder: 'Maximum number of clients at current headcount',
      },
      {
        ref: 'P6.Q3',
        text: 'What is the single biggest bottleneck to scaling your delivery?',
        guidance: 'Be specific: is it time, a particular skill, a missing system, or capital? Identifying one root constraint is more valuable than listing several.',
        placeholder: 'Single biggest delivery bottleneck and why',
      },
    ],
  },
  {
    number: 7,
    name: 'REVENUE MODEL AND GROWTH TRAJECTORY',
    questions: [
      {
        ref: 'P7.Q1',
        text: 'List your current revenue streams and the approximate percentage contribution of each.',
        guidance: 'Example: Retainer 60%, one-off projects 30%, training/courses 10%. If you only have one stream, note that clearly.',
        placeholder: 'Revenue stream / % contribution \u2014 e.g. Retainer 60%, Projects 30%, Training 10%',
      },
      {
        ref: 'P7.Q2',
        text: 'What was your total revenue in the last 12 months, and what is your target for the next 12?',
        guidance: 'Exact or approximate figures in \u00a3. If revenue varies significantly month-to-month, note the range.',
        placeholder: 'Last 12 months revenue \u00a3 / Target next 12 months \u00a3',
      },
      {
        ref: 'P7.Q3',
        text: 'Do you offer recurring or retainer contracts? What is your average contract length and monthly churn rate?',
        guidance: 'If you do not track churn formally, estimate: how many clients cancel per quarter out of your total active client base?',
        placeholder: 'Contract type / average length in months / monthly churn % or estimate',
      },
    ],
  },
  {
    number: 8,
    name: 'CLIENT EDUCATION AND RETENTION',
    questions: [
      {
        ref: 'P8.Q1',
        text: 'What structured onboarding, training, or education do you provide to clients after they sign?',
        guidance: 'Include kick-off calls, welcome sequences, resource libraries, portal access, check-in cadence. \u2018Nothing formal\u2019 is a valid answer.',
        placeholder: 'Structured education / onboarding steps provided after sign-up',
      },
      {
        ref: 'P8.Q2',
        text: 'How do you identify and manage at-risk clients? What is your average client lifespan in months?',
        guidance: 'Name your early-warning signals: missed calls, low engagement, payment delays, complaints. Describe what action you take when you spot them.',
        placeholder: 'At-risk signals / management process / average client lifespan in months',
      },
    ],
  },
  {
    number: 9,
    name: 'REGULATORY AND COMPLIANCE EXPOSURE',
    questions: [
      {
        ref: 'P9.Q1',
        text: 'What sector do you operate in? (CQC / MHRA / FCA / SRA / Ofsted / General)',
        guidance: 'Your sector determines which regulatory frameworks apply (CQC, MHRA, FCA, SRA, Ofsted, etc.). This is mandatory for compliance analysis.',
        placeholder: 'Select your sector and describe any known regulatory obligations',
      },
      {
        ref: 'P9.Q2',
        text: 'Do you make guarantees or promises of specific results in your marketing or contracts? Describe them exactly.',
        guidance: 'Copy the exact wording from your sales page, ads, or contract. Vague answers make compliance review impossible. \u2018We guarantee results\u2019 is not enough.',
        placeholder: 'Exact wording of any guarantees or specific result promises, or \u2018None\u2019',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Builder helpers
// ---------------------------------------------------------------------------

function spacer(ptBefore = 0, ptAfter = 0) {
  return new Paragraph({
    text: '',
    spacing: { before: ptBefore * 20, after: ptAfter * 20 },
  });
}

function titleBlock() {
  return [
    spacer(0, 60),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'CINATECH',
          bold: true,
          size: PT(36),
          font: 'Arial',
          color: BRAND_BLUE,
        }),
      ],
      spacing: { before: 0, after: 160 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Strategic Client Onboarding Questionnaire',
          size: PT(20),
          font: 'Arial',
          color: ACCENT_BLUE,
        }),
      ],
      spacing: { before: 0, after: 320 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_BLUE, space: 4 },
      },
      children: [
        new TextRun({
          text: 'Complete all 23 questions before submitting.',
          italics: true,
          size: PT(11),
          font: 'Arial',
          color: GUIDANCE_GREY,
        }),
      ],
      spacing: { before: 0, after: 480 },
    }),
  ];
}

function instructionsBlock() {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'How to use this document',
          bold: true,
          size: PT(12),
          font: 'Arial',
          color: BRAND_BLUE,
        }),
      ],
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Please fill out the following fields with as much detail as your client provided. Every response field is marked with a shaded box \u2014 type directly into it. ',
          size: PT(11),
          font: 'Arial',
        }),
        new TextRun({
          text: 'Guidance notes',
          italics: true,
          size: PT(11),
          font: 'Arial',
          color: GUIDANCE_GREY,
        }),
        new TextRun({
          text: ' beneath each question explain what to include. Submit the completed document to ',
          size: PT(11),
          font: 'Arial',
        }),
        new TextRun({
          text: 'joseph@cinatech.ai',
          bold: true,
          size: PT(11),
          font: 'Arial',
          color: ACCENT_BLUE,
        }),
        new TextRun({
          text: ' for your free analysis.',
          size: PT(11),
          font: 'Arial',
        }),
      ],
      spacing: { before: 0, after: 480 },
    }),
  ];
}

function pillarHeadingBlock(number, name) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `PILLAR ${number}  \u2014  ${name}`,
        bold: true,
        size: PT(14),
        font: 'Arial',
        color: BRAND_BLUE,
        allCaps: true,
      }),
    ],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_BLUE, space: 4 },
    },
    spacing: { before: 480, after: 200 },
  });
}

function questionHeadingBlock(ref, text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${ref}  `,
        bold: true,
        size: PT(12),
        font: 'Arial',
        color: ACCENT_BLUE,
      }),
      new TextRun({
        text,
        bold: true,
        size: PT(12),
        font: 'Arial',
        color: '000000',
      }),
    ],
    spacing: { before: 280, after: 80 },
  });
}

function guidanceBlock(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: 'Guidance:  ',
        bold: true,
        italics: true,
        size: PT(10),
        font: 'Arial',
        color: GUIDANCE_GREY,
      }),
      new TextRun({
        text,
        italics: true,
        size: PT(10),
        font: 'Arial',
        color: GUIDANCE_GREY,
      }),
    ],
    spacing: { before: 0, after: 100 },
  });
}

function responseBoxBlock(placeholder) {
  return new Table({
    width: { size: USABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [USABLE_WIDTH],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: USABLE_WIDTH, type: WidthType.DXA },
            shading: { fill: RESPONSE_BG, type: ShadingType.CLEAR, color: 'auto' },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: placeholder,
                    italics: true,
                    size: PT(11),
                    font: 'Arial',
                    color: PLACEHOLDER_GREY,
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
              // Empty lines to give writing space
              new Paragraph({ text: '', spacing: { before: 0, after: 0 } }),
              new Paragraph({ text: '', spacing: { before: 0, after: 0 } }),
              new Paragraph({ text: '', spacing: { before: 0, after: 240 } }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ---------------------------------------------------------------------------
// Build document children
// ---------------------------------------------------------------------------
function buildChildren() {
  const children = [];

  // Title page
  children.push(...titleBlock());
  children.push(...instructionsBlock());

  // 9 pillars
  for (const pillar of PILLARS) {
    children.push(pillarHeadingBlock(pillar.number, pillar.name));

    for (const q of pillar.questions) {
      children.push(questionHeadingBlock(q.ref, q.text));
      children.push(guidanceBlock(q.guidance));
      children.push(responseBoxBlock(q.placeholder));
      children.push(spacer(0, 8));
    }
  }

  return children;
}

// ---------------------------------------------------------------------------
// Assemble and write
// ---------------------------------------------------------------------------
async function main() {
  const doc = new Document({
    creator: 'CinaTech',
    title: 'CinaTech Strategic Client Onboarding Questionnaire',
    description: 'Complete all 23 questions across 9 analysis pillars before submitting.',
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: PT(11),
            color: '000000',
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: {
              top: MARGIN,
              right: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
            },
          },
        },
        children: buildChildren(),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'public', 'CinaTech_Client_Onboarding_Template.docx');
  fs.writeFileSync(outPath, buffer);

  const kb = Math.round(buffer.length / 1024);
  console.log(`Written: ${outPath} (${kb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
