import { capitalizeFirstLetterOfEachWord } from './common.js';

/**
 * Progress Report PDF Template
 * Based on Progress_Report_Professional.pdf template
 * 
 * @param {Object} data - The progress report data
 * @returns {Function} PDFKit document builder function
 */
export const ProgressReportPDF = (data) => (doc) => {
  const {
    practice_name = 'N/A',
    therapist_name = 'N/A',
    therapist_designation = 'Therapist',
    report_date = 'N/A',
    treatment_block_name = 'N/A',
    client_full_name = 'N/A',
    client_id = 'N/A',
    session_number = 'N/A',
    total_sessions_completed = 'N/A',
    session_summary = '',
    progress_since_last_session = '',
    risk_screening = {},
    assessments = [],
    frequency = 'Other',
  } = data;


  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const headerColor = '#1a5276';
  const sectionHeaderColor = '#2874a6';
  const lineColor = '#bdc3c7';
  const textColor = '#2c3e50';

  // Helper function to draw a horizontal line
  const drawLine = (y, color = lineColor) => {
    doc.strokeColor(color)
       .lineWidth(1)
       .moveTo(margin, y)
       .lineTo(pageWidth - margin, y)
       .stroke();
  };

  // Helper function to draw section header
  const drawSectionHeader = (text, y) => {
    doc.fillColor(sectionHeaderColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(text, margin, y);
    return doc.y + 5;
  };

  // Helper function to format date
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  // ========== HEADER ==========
  // Confidential notice
  doc.fillColor('#7f8c8d')
     .fontSize(8)
     .font('Helvetica-Oblique')
     .text('CONFIDENTIAL – This document contains sensitive clinical information and is intended solely for authorized use within MindBridge.', margin, margin, { align: 'center', width: contentWidth });

  doc.moveDown(1);

  // Title
  doc.fillColor(headerColor)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('TREATMENT PROGRESS REPORT', margin, doc.y, { align: 'center', width: contentWidth });

  doc.moveDown(0.5);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // Practice and Therapist Info
  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('Name of Practice: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(practice_name || 'N/A');

  doc.moveDown(0.3);

  // Therapist Name and Designation on same line
  doc.font('Helvetica-Bold')
     .text('Therapist Name: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(`${capitalizeFirstLetterOfEachWord(therapist_name || 'N/A')}`, { continued: true })
     .font('Helvetica-Bold')
     .text('    Designation: ', { continued: true })
     .font('Helvetica')
     .text(therapist_designation || 'Therapist');

  doc.moveDown(0.3);

  doc.font('Helvetica-Bold')
     .text('Date of Progress Report: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(formatDate(report_date));

  doc.moveDown(0.3);

  doc.font('Helvetica-Bold')
     .text('Treatment Block: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(treatment_block_name || 'N/A');

  doc.moveDown(1);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== CLIENT INFORMATION SECTION ==========
  let currentY = drawSectionHeader('CLIENT INFORMATION', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Client info in a grid layout
  const leftColX = margin;
  const rightColX = margin + (contentWidth / 2);

  doc.font('Helvetica-Bold')
     .text('Full Name: ', leftColX, currentY, { continued: true })
     .font('Helvetica')
     .text(capitalizeFirstLetterOfEachWord(client_full_name || 'N/A'));

  doc.font('Helvetica-Bold')
     .text('Client ID / Reference: ', rightColX, currentY, { continued: true })
     .font('Helvetica')
     .text(client_id || 'N/A');

  currentY = doc.y + 5;

  doc.font('Helvetica-Bold')
     .text('Session Number: ', leftColX, currentY, { continued: true })
     .font('Helvetica')
     .text(String(session_number || 'N/A'));

  doc.font('Helvetica-Bold')
     .text('Total Sessions Completed: ', rightColX, currentY, { continued: true })
     .font('Helvetica')
     .text(String(total_sessions_completed || 'N/A'));

  doc.moveDown(1.5);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== 1. SESSION SUMMARY ==========
  currentY = drawSectionHeader('1. Session Summary', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (session_summary && session_summary.trim()) {
    doc.text(session_summary, margin, currentY, { width: contentWidth, align: 'left' });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No session summary provided.', margin, currentY);
  }

  doc.moveDown(1);

  // ========== 2. PROGRESS SINCE LAST SESSION ==========
  currentY = drawSectionHeader('2. Progress Since Last Session', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (progress_since_last_session && progress_since_last_session.trim()) {
    doc.text(progress_since_last_session, margin, currentY, { width: contentWidth, align: 'left' });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No progress notes provided.', margin, currentY);
  }

  doc.moveDown(1);

  // ========== 3. RISK SCREENING ==========
  currentY = drawSectionHeader('3. Risk Screening', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Risk screening checkboxes
  const riskFlags = risk_screening?.flags || {};
  const checkboxSize = 10;
  const checkboxGap = 120;
  const rowHeight = 20;

  const riskOptions = [
    { key: 'no_risk', label: 'No risk' },
    { key: 'suicidal_ideation', label: 'Suicidal ideation' },
    { key: 'self_harm', label: 'Self-harm' },
    { key: 'substance_concerns', label: 'Substance concerns' },
  ];

  // Helper function to draw a checkmark
  const drawCheckmark = (x, y, size) => {
    doc.save()
       .strokeColor('#000000')
       .lineWidth(2)
       .moveTo(x + size * 0.2, y + size * 0.5)
       .lineTo(x + size * 0.4, y + size * 0.75)
       .lineTo(x + size * 0.8, y + size * 0.25)
       .stroke()
       .restore();
  };

  // Draw checkboxes in 2x2 grid
  let checkboxRowY = doc.y + 5;
  riskOptions.forEach((option, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const checkboxX = margin + (col * checkboxGap);
    const checkboxY = checkboxRowY + (row * rowHeight);

    const isChecked = riskFlags[option.key] === true;
    
    // Draw checkbox border
    doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize).stroke();
    
    if (isChecked) {
      // Draw checkmark using lines
      drawCheckmark(checkboxX, checkboxY, checkboxSize);
    }

    // Draw label
    doc.fontSize(10)
       .fillColor(textColor)
       .text(option.label, checkboxX + checkboxSize + 5, checkboxY + 2, { lineBreak: false });
  });

  // Move cursor down after checkboxes
  doc.y = checkboxRowY + (2 * rowHeight) + 5;

  // Risk note
  doc.font('Helvetica-Bold')
     .text('Note: ', margin, doc.y, { continued: true })
     .font('Helvetica');

  if (risk_screening?.note && risk_screening.note.trim()) {
    doc.text(risk_screening.note, { width: contentWidth - 40 });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No additional risk notes.');
  }

  doc.moveDown(1);

  // ========== 4. ASSESSMENTS ==========
  currentY = drawSectionHeader('4. Assessments (Auto-Filled)', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (assessments && assessments.length > 0) {
    assessments.forEach((assessment, index) => {
      // Check if we need a new page
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold')
         .text(`Tool: `, margin, doc.y, { continued: true })
         .font('Helvetica')
         .text(assessment.tool || 'Unknown', { continued: true })
         .font('Helvetica-Bold')
         .text(`    Score: `, { continued: true })
         .font('Helvetica')
         .text(String(assessment.score || 'N/A'));

      doc.moveDown(0.3);

      doc.font('Helvetica-Bold')
         .text('Therapist Notes: ', margin, doc.y, { continued: true })
         .font('Helvetica');

      if (assessment.therapist_notes && assessment.therapist_notes.trim()) {
        doc.text(assessment.therapist_notes, { width: contentWidth - 100 });
      } else {
        doc.fillColor('#95a5a6')
           .font('Helvetica-Oblique')
           .text('No notes provided.');
        doc.fillColor(textColor);
      }

      if (index < assessments.length - 1) {
        doc.moveDown(0.5);
        // Draw separator line
        doc.strokeColor('#ecf0f1')
           .lineWidth(0.5)
           .moveTo(margin + 20, doc.y)
           .lineTo(pageWidth - margin - 20, doc.y)
           .stroke();
        doc.moveDown(0.5);
      }
    });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No assessments recorded for this session.', margin, currentY);
  }

  doc.moveDown(1);

  // ========== FREQUENCY ==========
  currentY = drawSectionHeader('Frequency (Auto-Filled From Treatment Block)', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  const frequencyOptions = ['Weekly', 'Biweekly', 'Other'];
  const freqCheckboxGap = 120;
  const freqCheckboxY = doc.y + 5;

  frequencyOptions.forEach((option, index) => {
    const checkboxX = margin + (index * freqCheckboxGap);
    
    const isSelected = frequency === option || 
                      (option === 'Other' && !['Weekly', 'Biweekly'].includes(frequency));
    
    // Draw checkbox border
    doc.rect(checkboxX, freqCheckboxY, checkboxSize, checkboxSize).stroke();
    
    if (isSelected) {
      // Draw checkmark using lines
      drawCheckmark(checkboxX, freqCheckboxY, checkboxSize);
    }

    let labelText = option;
    if (option === 'Other' && frequency && !['Weekly', 'Biweekly'].includes(frequency)) {
      labelText = `Other: ${frequency}`;
    }

    // Draw label
    doc.fontSize(10)
       .fillColor(textColor)
       .text(labelText, checkboxX + checkboxSize + 5, freqCheckboxY + 2, { lineBreak: false });
  });

  // Move cursor down after checkboxes
  doc.y = freqCheckboxY + checkboxSize + 15;

  drawLine(doc.y, headerColor);

  doc.moveDown(0.5);

  // ========== THERAPIST SIGN-OFF ==========
  doc.fillColor(headerColor)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('THERAPIST SIGN-OFF', margin, doc.y, { align: 'center', width: contentWidth });

  doc.moveDown(0.5);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica-Oblique')
     .text(
       `Electronically approved by ${capitalizeFirstLetterOfEachWord(therapist_name || 'N/A')}, ${therapist_designation || 'Therapist'} on ${formatDate(report_date)} via MindBridge.`,
       margin,
       doc.y,
       { align: 'center', width: contentWidth }
     );

  doc.moveDown(2);

  // Footer
  doc.fillColor('#bdc3c7')
     .fontSize(8)
     .font('Helvetica')
     .text('Generated by MindBridge', margin, doc.page.height - 50, { align: 'center', width: contentWidth });
};

/**
 * Discharge Report PDF Template
 * Based on Discharge_Report_Professional.pdf template
 * 
 * @param {Object} data - The discharge report data
 * @returns {Function} PDFKit document builder function
 */
export const DischargeReportPDF = (data) => (doc) => {
  const {
    practice_name = 'N/A',
    therapist_name = 'N/A',
    therapist_designation = 'Therapist',
    report_date = 'N/A',
    treatment_block_name = 'N/A',
    client_full_name = 'N/A',
    client_id = 'N/A',
    discharge_date = 'N/A',
    total_sessions_completed = 'N/A',
    discharge_reason_flags = {},
    discharge_reason_other = '',
    treatment_summary = '',
    assessments = [],
    remaining_concerns = '',
    recommendations = '',
    client_understanding = '',
  } = data;

  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const headerColor = '#1a5276';
  const sectionHeaderColor = '#2874a6';
  const lineColor = '#bdc3c7';
  const textColor = '#2c3e50';

  // Helper function to draw a horizontal line
  const drawLine = (y, color = lineColor) => {
    doc.strokeColor(color)
       .lineWidth(1)
       .moveTo(margin, y)
       .lineTo(pageWidth - margin, y)
       .stroke();
  };

  // Helper function to draw section header
  const drawSectionHeader = (text, y) => {
    doc.fillColor(sectionHeaderColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(text, margin, y);
    return doc.y + 5;
  };

  // Helper function to format date
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper function to draw a checkmark
  const drawCheckmark = (x, y, size) => {
    doc.save()
       .strokeColor('#000000')
       .lineWidth(2)
       .moveTo(x + size * 0.2, y + size * 0.5)
       .lineTo(x + size * 0.4, y + size * 0.75)
       .lineTo(x + size * 0.8, y + size * 0.25)
       .stroke()
       .restore();
  };

  const checkboxSize = 10;

  // ========== HEADER ==========
  // Confidential notice
  doc.fillColor('#7f8c8d')
     .fontSize(8)
     .font('Helvetica-Oblique')
     .text('CONFIDENTIAL – This document contains sensitive clinical information and is intended solely for authorized use within MindBridge.', margin, margin, { align: 'center', width: contentWidth });

  doc.moveDown(1);

  // Title
  doc.fillColor(headerColor)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('TREATMENT DISCHARGE REPORT', margin, doc.y, { align: 'center', width: contentWidth });

  doc.moveDown(0.5);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // Practice and Therapist Info
  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('Name of Practice: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(practice_name || 'N/A');

  doc.moveDown(0.3);

  // Therapist Name and Designation on same line
  doc.font('Helvetica-Bold')
     .text('Therapist Name: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(`${capitalizeFirstLetterOfEachWord(therapist_name || 'N/A')}`, { continued: true })
     .font('Helvetica-Bold')
     .text('    Designation: ', { continued: true })
     .font('Helvetica')
     .text(therapist_designation || 'Therapist');

  doc.moveDown(0.3);

  doc.font('Helvetica-Bold')
     .text('Date of Discharge Report: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(formatDate(report_date));

  doc.moveDown(0.3);

  doc.font('Helvetica-Bold')
     .text('Treatment Block: ', margin, doc.y, { continued: true })
     .font('Helvetica')
     .text(treatment_block_name || 'N/A');

  doc.moveDown(1);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== CLIENT INFORMATION SECTION ==========
  let currentY = drawSectionHeader('CLIENT INFORMATION', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Client info in a grid layout
  const leftColX = margin;
  const rightColX = margin + (contentWidth / 2);

  doc.font('Helvetica-Bold')
     .text('Client Full Name: ', leftColX, currentY, { continued: true })
     .font('Helvetica')
     .text(capitalizeFirstLetterOfEachWord(client_full_name || 'N/A'));

  doc.font('Helvetica-Bold')
     .text('Client ID / Reference: ', rightColX, currentY, { continued: true })
     .font('Helvetica')
     .text(client_id || 'N/A');

  currentY = doc.y + 5;

  doc.font('Helvetica-Bold')
     .text('Date of Discharge Session: ', leftColX, currentY, { continued: true })
     .font('Helvetica')
     .text(formatDate(discharge_date));

  doc.font('Helvetica-Bold')
     .text('Total Sessions Completed: ', rightColX, currentY, { continued: true })
     .font('Helvetica')
     .text(String(total_sessions_completed || 'N/A'));

  doc.moveDown(1.5);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== REASON FOR DISCHARGE ==========
  currentY = drawSectionHeader('Reason for Discharge', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  const dischargeOptions = [
    { key: 'goals_met', label: 'Treatment goals met' },
    { key: 'client_withdrew', label: 'Client withdrew' },
    { key: 'referral_made', label: 'Referral made' },
    { key: 'other', label: 'Other' },
  ];

  const checkboxGap = 130;
  let checkboxRowY = doc.y + 5;

  dischargeOptions.forEach((option, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const checkboxX = margin + (col * checkboxGap);
    const checkboxY = checkboxRowY + (row * 20);

    const isChecked = discharge_reason_flags[option.key] === true;
    
    // Draw checkbox border
    doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize).stroke();
    
    if (isChecked) {
      drawCheckmark(checkboxX, checkboxY, checkboxSize);
    }

    // Draw label
    doc.fontSize(10)
       .fillColor(textColor)
       .text(option.label, checkboxX + checkboxSize + 5, checkboxY + 2, { lineBreak: false });
  });

  // Move cursor down after checkboxes
  doc.y = checkboxRowY + 45;

  // If 'Other' reason
  if (discharge_reason_flags.other && discharge_reason_other) {
    doc.font('Helvetica-Bold')
       .text("If 'Other': ", margin, doc.y, { continued: true })
       .font('Helvetica')
       .text(discharge_reason_other, { width: contentWidth - 60 });
  }

  doc.moveDown(1);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== TREATMENT SUMMARY ==========
  currentY = drawSectionHeader('Treatment Summary', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (treatment_summary && treatment_summary.trim()) {
    doc.text(treatment_summary, margin, currentY, { width: contentWidth, align: 'left' });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No treatment summary provided.', margin, currentY);
  }

  doc.moveDown(1);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== FINAL ASSESSMENT ==========
  currentY = drawSectionHeader('Final Assessment (Auto-Filled)', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (assessments && assessments.length > 0) {
    assessments.forEach((assessment, index) => {
      // Check if we need a new page
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold')
         .text(`Tool: `, margin, doc.y, { continued: true })
         .font('Helvetica')
         .text(assessment.tool || 'Unknown', { continued: true })
         .font('Helvetica-Bold')
         .text(`    Score: `, { continued: true })
         .font('Helvetica')
         .text(String(assessment.score || 'N/A'));

      doc.moveDown(0.3);

      doc.font('Helvetica-Bold')
         .text('Therapist Notes: ', margin, doc.y, { continued: true })
         .font('Helvetica');

      if (assessment.therapist_notes && assessment.therapist_notes.trim()) {
        doc.text(assessment.therapist_notes, { width: contentWidth - 100 });
      } else {
        doc.fillColor('#95a5a6')
           .font('Helvetica-Oblique')
           .text('No notes provided.');
        doc.fillColor(textColor);
      }

      if (index < assessments.length - 1) {
        doc.moveDown(0.5);
        // Draw separator line
        doc.strokeColor('#ecf0f1')
           .lineWidth(0.5)
           .moveTo(margin + 20, doc.y)
           .lineTo(pageWidth - margin - 20, doc.y)
           .stroke();
        doc.moveDown(0.5);
      }
    });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No assessments recorded.', margin, currentY);
  }

  doc.moveDown(1);

  // Remaining concerns
  doc.fillColor(textColor)
     .font('Helvetica-Bold')
     .text('Remaining concerns: ', margin, doc.y, { continued: true })
     .font('Helvetica');

  if (remaining_concerns && remaining_concerns.trim()) {
    doc.text(remaining_concerns, { width: contentWidth - 120 });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('None noted.');
  }

  doc.moveDown(1);

  drawLine(doc.y);

  doc.moveDown(0.5);

  // ========== RECOMMENDATIONS POST-DISCHARGE ==========
  currentY = drawSectionHeader('Recommendations Post-Discharge', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (recommendations && recommendations.trim()) {
    doc.text(recommendations, margin, currentY, { width: contentWidth, align: 'left' });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('No recommendations provided.', margin, currentY);
  }

  doc.moveDown(1);

  // Client/caregiver understanding
  doc.fillColor(textColor)
     .font('Helvetica-Bold')
     .text('Client/caregiver understanding: ', margin, doc.y, { continued: true })
     .font('Helvetica');

  if (client_understanding && client_understanding.trim()) {
    doc.text(client_understanding, { width: contentWidth - 160 });
  } else {
    doc.fillColor('#95a5a6')
       .font('Helvetica-Oblique')
       .text('Not documented.');
  }

  doc.moveDown(1.5);

  drawLine(doc.y, headerColor);

  doc.moveDown(0.5);

  // ========== THERAPIST SIGN-OFF ==========
  doc.fillColor(headerColor)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('THERAPIST SIGN-OFF', margin, doc.y, { align: 'center', width: contentWidth });

  doc.moveDown(0.5);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica-Oblique')
     .text(
       `Electronically approved by ${capitalizeFirstLetterOfEachWord(therapist_name || 'N/A')}, ${therapist_designation || 'Therapist'} on ${formatDate(report_date)} via MindBridge.`,
       margin,
       doc.y,
       { align: 'center', width: contentWidth }
     );

  doc.moveDown(2);

  // Footer
  doc.fillColor('#bdc3c7')
     .fontSize(8)
     .font('Helvetica')
     .text('Generated by MindBridge', margin, doc.page.height - 50, { align: 'center', width: contentWidth });
};

/**
 * Intake Report PDF Template
 * Based on Intake_Report_Template.docx.pdf
 * 
 * @param {Object} data - The intake report data
 * @returns {Function} PDFKit document builder function
 */
export const IntakeReportPDF = (data) => (doc) => {
  const {
    client_full_name = 'N/A',
    client_information = {},
    presenting_problem = {},
    symptoms = {},
    mental_health_history = {},
    safety_assessment = {},
    clinical_impression = '',
  } = data;

  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const headerColor = '#1a5276';
  const sectionHeaderColor = '#2874a6';
  const textColor = '#2c3e50';

  // Helper function to draw section header
  const drawSectionHeader = (text, y) => {
    doc.fillColor(sectionHeaderColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(text, margin, y);
    return doc.y + 5;
  };

  // Helper function to draw a checkmark
  const drawCheckmark = (x, y, size) => {
    doc.save()
       .strokeColor('#000000')
       .lineWidth(2)
       .moveTo(x + size * 0.2, y + size * 0.5)
       .lineTo(x + size * 0.4, y + size * 0.75)
       .lineTo(x + size * 0.8, y + size * 0.25)
       .stroke()
       .restore();
  };

  const checkboxSize = 10;

  // ========== HEADER ==========
  // Title
  doc.fillColor(headerColor)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('CLIENT INTAKE FORM', margin, margin, { align: 'center', width: contentWidth });

  // Confidential subtitle
  doc.fillColor('#7f8c8d')
     .fontSize(10)
     .font('Helvetica-Oblique')
     .text('(Confidential)', margin, doc.y + 5, { align: 'center', width: contentWidth });

  doc.moveDown(1.5);

  // ========== CLIENT INFORMATION ==========
  let currentY = drawSectionHeader('Client Information', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Full Name field
  doc.text('Full Name: ', margin, currentY, { continued: true });
  const fullNameValue = capitalizeFirstLetterOfEachWord(client_information.full_name || client_full_name || '');
  doc.text(fullNameValue || '___________________________', { width: contentWidth - 70 });

  currentY = doc.y + 8;

  // Phone field
  doc.text('Phone: ', margin, currentY, { continued: true });
  doc.text(client_information.phone || '___________________________', { width: contentWidth - 50 });

  currentY = doc.y + 8;

  // Email field
  doc.text('Email: ', margin, currentY, { continued: true });
  doc.text(client_information.email || '___________________________', { width: contentWidth - 45 });

  currentY = doc.y + 8;

  // Emergency Contact field
  doc.text('Emergency Contact: ', margin, currentY, { continued: true });
  doc.text(client_information.emergency_contact || '___________________________', { width: contentWidth - 115 });

  doc.moveDown(1.5);

  // ========== PRESENTING PROBLEM ==========
  currentY = drawSectionHeader('Presenting Problem', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  doc.text('Reason for seeking therapy:', margin, currentY);

  currentY = doc.y + 5;

  // Draw text area box or show the content
  if (presenting_problem.reason && presenting_problem.reason.trim()) {
    doc.text(presenting_problem.reason, margin, currentY, { width: contentWidth });
  } else {
    doc.text('________________________________________', margin, currentY);
  }

  currentY = doc.y + 15;

  // Duration of concern - split into two rows for better spacing
  doc.text('Duration of concern:', margin, currentY);

  const durationOptions = [
    { key: 'less_than_1_month', label: 'Less than 1 month' },
    { key: '1_6_months', label: '1–6 months' },
    { key: '6_12_months', label: '6–12 months' },
    { key: 'over_1_year', label: 'Over 1 year' },
  ];

  const durationRowY = currentY + 15;
  const durationColWidth = 130;

  durationOptions.forEach((option, index) => {
    const col = index % 4;
    const checkboxX = margin + (col * durationColWidth);
    const isChecked = presenting_problem.duration === option.key;
    
    doc.rect(checkboxX, durationRowY, checkboxSize, checkboxSize).stroke();
    
    if (isChecked) {
      drawCheckmark(checkboxX, durationRowY, checkboxSize);
    }

    doc.fontSize(10)
       .fillColor(textColor)
       .text(option.label, checkboxX + checkboxSize + 3, durationRowY + 1, { lineBreak: false });
  });

  doc.y = durationRowY + 25;

  doc.moveDown(0.5);

  // ========== SYMPTOMS ==========
  currentY = drawSectionHeader('Symptoms', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  const symptomOptions = [
    { key: 'anxiety', label: 'Anxiety' },
    { key: 'depression', label: 'Depression' },
    { key: 'stress', label: 'Stress' },
    { key: 'sleep_issues', label: 'Sleep issues' },
    { key: 'mood_changes', label: 'Mood changes' },
    { key: 'relationship_issues', label: 'Relationship issues' },
  ];

  // Row 1: First 3 symptoms with fixed column width
  const symptomColWidth = 130;
  const symptomY = currentY;

  symptomOptions.slice(0, 3).forEach((option, index) => {
    const checkboxX = margin + (index * symptomColWidth);
    const isChecked = symptoms[option.key] === true;
    
    doc.rect(checkboxX, symptomY, checkboxSize, checkboxSize).stroke();
    
    if (isChecked) {
      drawCheckmark(checkboxX, symptomY, checkboxSize);
    }

    doc.fontSize(10)
       .fillColor(textColor)
       .text(option.label, checkboxX + checkboxSize + 3, symptomY + 1, { lineBreak: false });
  });

  // Row 2: Next 3 symptoms
  const symptomY2 = symptomY + 18;

  symptomOptions.slice(3, 6).forEach((option, index) => {
    const checkboxX = margin + (index * symptomColWidth);
    const isChecked = symptoms[option.key] === true;
    
    doc.rect(checkboxX, symptomY2, checkboxSize, checkboxSize).stroke();
    
    if (isChecked) {
      drawCheckmark(checkboxX, symptomY2, checkboxSize);
    }

    doc.fontSize(10)
       .fillColor(textColor)
       .text(option.label, checkboxX + checkboxSize + 3, symptomY2 + 1, { lineBreak: false });
  });

  // Row 3: Other symptom
  const symptomY3 = symptomY2 + 18;

  doc.rect(margin, symptomY3, checkboxSize, checkboxSize).stroke();
  
  if (symptoms.other) {
    drawCheckmark(margin, symptomY3, checkboxSize);
  }

  doc.fontSize(10)
     .fillColor(textColor)
     .text('Other: ', margin + checkboxSize + 3, symptomY3 + 1, { continued: true });

  if (symptoms.other && typeof symptoms.other === 'string') {
    doc.text(symptoms.other);
  } else {
    doc.text('___________');
  }

  doc.y = symptomY3 + 25;

  doc.moveDown(0.5);

  // ========== MENTAL HEALTH & MEDICAL HISTORY ==========
  currentY = drawSectionHeader('Mental Health & Medical History', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Previous therapy with inline checkboxes
  doc.text('Previous therapy:', margin, currentY);

  const therapyCheckboxY = currentY;
  let therapyCheckboxX = margin + 105;

  // Yes checkbox
  doc.rect(therapyCheckboxX, therapyCheckboxY, checkboxSize, checkboxSize).stroke();
  if (mental_health_history.previous_therapy === 'yes') {
    drawCheckmark(therapyCheckboxX, therapyCheckboxY, checkboxSize);
  }
  doc.text('Yes', therapyCheckboxX + checkboxSize + 3, therapyCheckboxY + 1, { lineBreak: false });

  therapyCheckboxX += 55;

  // No checkbox
  doc.rect(therapyCheckboxX, therapyCheckboxY, checkboxSize, checkboxSize).stroke();
  if (mental_health_history.previous_therapy === 'no') {
    drawCheckmark(therapyCheckboxX, therapyCheckboxY, checkboxSize);
  }
  doc.text('No', therapyCheckboxX + checkboxSize + 3, therapyCheckboxY + 1, { lineBreak: false });

  currentY = therapyCheckboxY + 20;

  // Current medications
  doc.text('Current medications: ', margin, currentY, { continued: true });
  if (mental_health_history.current_medications && mental_health_history.current_medications.trim()) {
    doc.text(mental_health_history.current_medications, { width: contentWidth - 120 });
  } else {
    doc.text('___________________________');
  }

  currentY = doc.y + 10;

  // Medical conditions
  doc.text('Medical conditions (if any): ', margin, currentY, { continued: true });
  if (mental_health_history.medical_conditions && mental_health_history.medical_conditions.trim()) {
    doc.text(mental_health_history.medical_conditions, { width: contentWidth - 150 });
  } else {
    doc.text('___________________________');
  }

  doc.moveDown(1);

  // ========== SAFETY ASSESSMENT ==========
  currentY = drawSectionHeader('Safety Assessment', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Thoughts of self-harm with inline checkboxes
  doc.text('Thoughts of self-harm:', margin, currentY);

  const selfHarmY = currentY;
  let selfHarmX = margin + 130;

  const selfHarmOptions = [
    { key: 'no', label: 'No' },
    { key: 'past', label: 'Past' },
    { key: 'current', label: 'Current' },
  ];

  selfHarmOptions.forEach((option, index) => {
    const checkX = selfHarmX + (index * 60);
    doc.rect(checkX, selfHarmY, checkboxSize, checkboxSize).stroke();
    if (safety_assessment.thoughts_of_self_harm === option.key) {
      drawCheckmark(checkX, selfHarmY, checkboxSize);
    }
    doc.text(option.label, checkX + checkboxSize + 3, selfHarmY + 1, { lineBreak: false });
  });

  currentY = selfHarmY + 20;

  // Thoughts of harming others with inline checkboxes
  doc.text('Thoughts of harming others:', margin, currentY);

  const harmOthersY = currentY;
  let harmOthersX = margin + 155;

  const harmingOthersOptions = [
    { key: 'no', label: 'No' },
    { key: 'yes', label: 'Yes' },
  ];

  harmingOthersOptions.forEach((option, index) => {
    const checkX = harmOthersX + (index * 55);
    doc.rect(checkX, harmOthersY, checkboxSize, checkboxSize).stroke();
    if (safety_assessment.thoughts_of_harming_others === option.key) {
      drawCheckmark(checkX, harmOthersY, checkboxSize);
    }
    doc.text(option.label, checkX + checkboxSize + 3, harmOthersY + 1, { lineBreak: false });
  });

  currentY = harmOthersY + 20;

  // Immediate safety concerns
  doc.text('Immediate safety concerns noted: ', margin, currentY, { continued: true });
  if (safety_assessment.immediate_safety_concerns && safety_assessment.immediate_safety_concerns.trim()) {
    doc.text(safety_assessment.immediate_safety_concerns, { width: contentWidth - 190 });
  } else {
    doc.text('___________________________');
  }

  doc.moveDown(1);

  // ========== Initial Assessment (Preliminary) ==========
  currentY = drawSectionHeader('Initial Assessment (Preliminary)', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  if (clinical_impression && clinical_impression.trim()) {
    doc.text(clinical_impression, margin, currentY, { width: contentWidth, align: 'left' });
  } else {
    doc.text('________________________________________', margin, currentY);
  }

  doc.moveDown(1.5);

  // ========== CONSENT ==========
  currentY = drawSectionHeader('Consent', doc.y);

  // Draw checked checkbox
  const checkboxX = margin;
  const checkboxY = currentY;
  doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize).stroke();
  drawCheckmark(checkboxX, checkboxY, checkboxSize);

  // Draw text after checkbox
  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica')
     .text('Client has provided informed consent to begin therapy services.', checkboxX + checkboxSize + 5, checkboxY + 2);

  doc.moveDown(2);

  // Footer
  doc.fillColor('#bdc3c7')
     .fontSize(8)
     .font('Helvetica')
     .text('Generated by MindBridge', margin, doc.page.height - 50, { align: 'center', width: contentWidth });
};

/**
 * Treatment Plan PDF Template
 * Based on Treatment_Plan_Template.docx.pdf
 * 
 * @param {Object} data - The treatment plan data
 * @returns {Function} PDFKit document builder function
 */
export const TreatmentPlanReportPDF = (data) => (doc) => {
  const {
    client_name = '',
    treatment_plan_date = '',
    clinical_impressions = '',
    long_term_goals = '',
    short_term_goals = '',
    therapeutic_approaches = '',
    session_frequency = '',
    how_measured = '',
    review_date = '',
    updates = '',
    therapist_name = '',
    therapist_signature = '',
    signature_date = '',
  } = data;

  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const headerColor = '#1a5276';
  const sectionHeaderColor = '#2874a6';
  const textColor = '#2c3e50';

  // Helper function to draw section header
  const drawSectionHeader = (text, y) => {
    doc.fillColor(sectionHeaderColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(text, margin, y);
    return doc.y + 5;
  };

  // Helper function to format date
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return '___/___/___';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // ========== HEADER ==========
  // Title
  doc.fillColor(headerColor)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('TREATMENT PLAN', margin, margin, { align: 'center', width: contentWidth });

  // Confidential subtitle
  doc.fillColor('#7f8c8d')
     .fontSize(10)
     .font('Helvetica-Oblique')
     .text('(Confidential)', margin, doc.y + 5, { align: 'center', width: contentWidth });

  doc.moveDown(1.5);

  // ========== CLIENT INFORMATION ==========
  let currentY = drawSectionHeader('Client Information', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Client Name
  doc.text('Client Name: ', margin, currentY, { continued: true });
  doc.text(capitalizeFirstLetterOfEachWord(client_name) || '___________________________', { width: contentWidth - 80 });

  currentY = doc.y + 10;

  // Date Treatment Plan Created
  doc.text('Date Treatment Plan Created: ', margin, currentY, { continued: true });
  doc.text(formatDate(treatment_plan_date));

  doc.moveDown(1.5);

  // ========== CLINICAL ASSESSMENT & DIAGNOSIS ==========
  currentY = drawSectionHeader('Clinical Assessment & Diagnosis', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  doc.text('Clinical impressions / diagnosis (if applicable):', margin, currentY);

  currentY = doc.y + 5;

  if (clinical_impressions && clinical_impressions.trim()) {
    doc.text(clinical_impressions, margin, currentY, { width: contentWidth });
  } else {
    doc.text('___________________________', margin, currentY);
  }

  doc.moveDown(1.5);

  // ========== TREATMENT GOALS ==========
  currentY = drawSectionHeader('Treatment Goals', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Long-term goals
  doc.text('Long-term goals:', margin, currentY);
  currentY = doc.y + 5;
  if (long_term_goals && long_term_goals.trim()) {
    doc.text(long_term_goals, margin, currentY, { width: contentWidth });
  } else {
    doc.text('___________________________', margin, currentY);
  }

  currentY = doc.y + 10;

  // Short-term goals
  doc.text('Short-term goals:', margin, currentY);
  currentY = doc.y + 5;
  if (short_term_goals && short_term_goals.trim()) {
    doc.text(short_term_goals, margin, currentY, { width: contentWidth });
  } else {
    doc.text('___________________________', margin, currentY);
  }

  doc.moveDown(1.5);

  // ========== PLANNED INTERVENTIONS ==========
  currentY = drawSectionHeader('Planned Interventions', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Therapeutic approaches
  doc.text('Therapeutic approaches (e.g., CBT, DBT, EMDR):', margin, currentY);
  currentY = doc.y + 5;
  if (therapeutic_approaches && therapeutic_approaches.trim()) {
    doc.text(therapeutic_approaches, margin, currentY, { width: contentWidth });
  } else {
    doc.text('___________________________', margin, currentY);
  }

  currentY = doc.y + 10;

  // Session frequency
  doc.text('Session frequency: ', margin, currentY, { continued: true });
  if (session_frequency && session_frequency.trim()) {
    doc.text(session_frequency, { width: contentWidth - 100 });
  } else {
    doc.text('___________________________');
  }

  doc.moveDown(1.5);

  // ========== PROGRESS MEASUREMENT ==========
  currentY = drawSectionHeader('Progress Measurement', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  doc.text('How progress will be measured:', margin, currentY);
  currentY = doc.y + 5;
  if (how_measured && how_measured.trim()) {
    doc.text(how_measured, margin, currentY, { width: contentWidth });
  } else {
    doc.text('___________________________', margin, currentY);
  }

  doc.moveDown(1.5);

  // ========== REVIEW & UPDATES ==========
  currentY = drawSectionHeader('Review & Updates', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Plan review date(s)
  doc.text('Plan review date(s): ', margin, currentY, { continued: true });
  if (review_date && review_date.trim()) {
    doc.text(review_date, { width: contentWidth - 110 });
  } else {
    doc.text('___________________________');
  }

  currentY = doc.y + 10;

  // Updates / revisions
  doc.text('Updates / revisions:', margin, currentY);
  currentY = doc.y + 5;
  if (updates && updates.trim()) {
    doc.text(updates, margin, currentY, { width: contentWidth });
  } else {
    doc.text('___________________________', margin, currentY);
  }

  doc.moveDown(1.5);

  // ========== THERAPIST ACKNOWLEDGMENT ==========
  currentY = drawSectionHeader('Therapist Acknowledgment', doc.y);

  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica');

  // Therapist Name
  doc.text('Therapist Name: ', margin, currentY, { continued: true });
  doc.text(capitalizeFirstLetterOfEachWord(therapist_name) || '___________________________', { width: contentWidth - 100 });

  currentY = doc.y + 10;

  // Signature
  doc.text('Signature: ', margin, currentY);
  const signatureY = doc.y + 5;

  // Draw signature if available (base64 image)
  if (therapist_signature && therapist_signature.startsWith('data:image')) {
    try {
      doc.image(therapist_signature, margin, signatureY, { width: 150, height: 50 });
      doc.y = signatureY + 55;
    } catch (e) {
      doc.text('___________________________', margin, signatureY);
    }
  } else {
    doc.text('___________________________', margin, signatureY);
  }

  currentY = doc.y + 10;

  // Date
  doc.text('Date: ', margin, currentY, { continued: true });
  doc.text(formatDate(signature_date));

  doc.moveDown(2);

  // Footer
  doc.fillColor('#bdc3c7')
     .fontSize(8)
     .font('Helvetica')
     .text('Generated by MindBridge', margin, doc.page.height - 50, { align: 'center', width: contentWidth });
};

export default {
  ProgressReportPDF,
  DischargeReportPDF,
  IntakeReportPDF,
  TreatmentPlanReportPDF,
};

