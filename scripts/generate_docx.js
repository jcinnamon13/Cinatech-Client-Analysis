const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          text: "CINATECH CLIENT ONBOARDING TEMPLATE",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Please fill out the following fields with as much detail as your client provided. Email the completed form to joseph@cinatech.ai for your free analysis.",
              italics: true,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "1. Client / Brand Name:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter name here]\n" }),
        new Paragraph({ text: "2. Industry / Niche:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter industry here]\n" }),
        new Paragraph({ text: "3. Target Audience:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter primary demographics here]\n" }),
        new Paragraph({ text: "4. Current Core Challenges:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter main problems they face]\n" }),
        new Paragraph({ text: "5. Main Competitors:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter 2-5 competitors]\n" }),
        new Paragraph({ text: "6. Core Value Proposition / Messaging:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter how they pitch their product today]\n" }),
        new Paragraph({ text: "7. Specific Goals for this Quarter/Year:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "[Enter the objectives they explicitly shared]\n" }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(__dirname, '../public/CinaTech_Client_Onboarding_Template.docx'), buffer);
  console.log("DOCX generated successfully.");
});
