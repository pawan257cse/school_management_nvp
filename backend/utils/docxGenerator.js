const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const path = require('path');
const fs = require('fs');

const generateWordDocument = async (paper, saveToFolder = true) => {
  const {
    class: classObj,
    subject: subjectObj,
    examType = 'PA - 1',
    session = '2026-27',
    examDate,
    duration = 90,
    totalMarks = 40,
    language = 'English',
    instructions = [],
    questions = []
  } = paper;

  const className = typeof classObj === 'object' ? (classObj?.name || '4') : (classObj || '4');
  const subjectName = typeof subjectObj === 'object' ? (subjectObj?.name || 'Computer') : (subjectObj || 'Computer');
  const formattedDate = examDate ? new Date(examDate).toLocaleDateString('en-IN') : '__________';

  const isHindi = language === 'Hindi' || subjectName.toLowerCase().includes('hindi') || subjectName.toLowerCase().includes('sanskrit');

  const children = [];

  // 1. School Header (Exact format from N.V.P English Medium School Nimbi Jodhan reference papers)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'N.V.P English Medium School Nimbi Jodhan',
          bold: true,
          size: 32, // 16pt font
          font: isHindi ? 'Arial' : 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `Exam –  ${examType}                     Session – ${session}                          Class - ${className}`,
          bold: true,
          size: 24, // 12pt font
          font: isHindi ? 'Arial' : 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `Subject – ${subjectName}            Name - _____________                Roll No - ______`,
          bold: true,
          size: 24,
          font: isHindi ? 'Arial' : 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Date - ${formattedDate}             Day - _______________               Maximum Marks : ${totalMarks}`,
          bold: true,
          size: 24,
          font: isHindi ? 'Arial' : 'Times New Roman'
        })
      ]
    })
  );

  // 2. Instructions if present
  if (instructions && instructions.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: isHindi ? 'सामान्य निर्देश:' : 'General Instructions:',
            bold: true,
            size: 22,
            font: isHindi ? 'Arial' : 'Times New Roman'
          })
        ]
      })
    );
    instructions.forEach((inst, i) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `${i + 1}. ${inst}`,
              size: 20,
              font: isHindi ? 'Arial' : 'Times New Roman'
            })
          ]
        })
      );
    });
    children.push(new Paragraph({ spacing: { after: 120 }, text: '' }));
  }

  // 3. Questions Render
  questions.forEach((q, idx) => {
    const qNum = isHindi ? `प्र.${idx + 1}` : `Q${idx + 1}.`;
    const marksText = q.marks ? (isHindi ? `(${q.marks} अंक)` : `(${q.marks} Marks)`) : '';

    // Handle Section Header if present in section title
    if (q.sectionHeader) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 120 },
          children: [
            new TextRun({
              text: q.sectionHeader,
              bold: true,
              size: 24,
              font: isHindi ? 'Arial' : 'Times New Roman'
            })
          ]
        })
      );
    }

    // Main Question Statement Paragraph
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: `${qNum} ${q.questionText} `,
            bold: true,
            size: 22,
            font: isHindi ? 'Arial' : 'Times New Roman'
          }),
          ...(marksText ? [
            new TextRun({
              text: `      ${marksText}`,
              bold: true,
              size: 20,
              font: isHindi ? 'Arial' : 'Times New Roman'
            })
          ] : [])
        ]
      })
    );

    // Sub-questions (e.g. (i), (ii), (iii)) if array exists
    if (q.subQuestions && q.subQuestions.length > 0) {
      q.subQuestions.forEach((sq, sIdx) => {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: `(${sq.label || (sIdx + 1)}) ${sq.text}`,
                size: 20,
                font: isHindi ? 'Arial' : 'Times New Roman'
              })
            ]
          })
        );
      });
    }

    // MCQ Options Render
    if (q.questionType === 'mcq' && q.options && q.options.length > 0) {
      const optRuns = [];
      q.options.forEach((opt, optIdx) => {
        const letter = isHindi ? `(${['क', 'ख', 'ग', 'घ', 'ङ'][optIdx] || optIdx + 1})` : `${String.fromCharCode(97 + optIdx)})`;
        optRuns.push(
          new TextRun({
            text: `${letter} ${opt} [    ]     `,
            size: 20,
            font: isHindi ? 'Arial' : 'Times New Roman'
          })
        );
      });
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 80 },
          children: optRuns
        })
      );
    }

    // Match Columns Table
    if (q.questionType === 'match' && q.matchPairs && q.matchPairs.length > 0) {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: isHindi ? "स्तम्भ 'क'" : 'Column A',
                      bold: true,
                      size: 20,
                      font: isHindi ? 'Arial' : 'Times New Roman'
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: isHindi ? "स्तम्भ 'ख'" : 'Column B',
                      bold: true,
                      size: 20,
                      font: isHindi ? 'Arial' : 'Times New Roman'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ];

      q.matchPairs.forEach((pair, pairIdx) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${pairIdx + 1}. ${pair.left}`,
                        size: 20,
                        font: isHindi ? 'Arial' : 'Times New Roman'
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${isHindi ? String.fromCharCode(2437 + pairIdx) : String.fromCharCode(97 + pairIdx)}. ${pair.right}`,
                        size: 20,
                        font: isHindi ? 'Arial' : 'Times New Roman'
                      })
                    ]
                  })
                ]
              })
            ]
          })
        );
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );
    }

    // Answer lines for descriptive questions
    if (['short', 'long', 'very_short'].includes(q.questionType)) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: isHindi ? 'उत्तर : _______________________________________________________________________________' : 'Ans: _______________________________________________________________________________',
              size: 18,
              font: isHindi ? 'Arial' : 'Times New Roman'
            })
          ]
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);

  // If saveToFolder is true, write copy to output folder in workspace root
  if (saveToFolder) {
    try {
      const outputDir = path.join(__dirname, '../../output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const safeSubject = (subjectName || 'Paper').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
      const safeClass = (className || 'Class').replace(/[^a-zA-Z0-9]/g, '_');
      const docxPath = path.join(outputDir, `${safeSubject}_Class_${safeClass}.docx`);
      fs.writeFileSync(docxPath, buffer);
      console.log(`Saved Word document to output directory: ${docxPath}`);
    } catch (err) {
      console.error('Failed to auto-save Word doc to output directory:', err);
    }
  }

  return buffer;
};

module.exports = { generateWordDocument };

