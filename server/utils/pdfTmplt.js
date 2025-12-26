import { capitalizeFirstLetterOfEachWord } from './common.js';

export const AttendancePDF =
  (
    counselor_full_name,
    client_full_name,
    client_clam_nbr,
    total_sessions,
    total_attended_sessions,
    total_cancellation_total,
    total_homework_sent = 0,
    assessment_done = [],
    assessment_not_done = [],
  ) =>
  (doc) => {
    // Title
    doc.fontSize(20).text('Attendance Record', { align: 'center' }).moveDown();

    // Counselor Details
    doc
      .fontSize(12)
      .text(
        `Counselor Name: ${capitalizeFirstLetterOfEachWord(counselor_full_name)}`,
      );
    doc.text(`Date of Report: ${new Date().toLocaleDateString()}`);
    doc.text(
      `Client Name: ${capitalizeFirstLetterOfEachWord(client_full_name)}`,
    );
    doc.text(`Serial Number: ${client_clam_nbr}`).moveDown();

    // Session Overview
    doc.fontSize(16).text(`Session Overview`, { bold: true }).moveDown();
    doc
      .fontSize(12)
      .text(
        `The Session Overview presents a comprehensive view of active sessions, allowing for efficient tracking of attendance, cancellations, homework assignments, assessments, and engagement patterns.`,
      );

    // Table Header
    doc
      .moveDown()
      .fontSize(16)
      .text(`Client Session Summary`, { bold: true })
      .moveDown();
    doc.fontSize(12);
    
    // Format assessment names
    const assessmentDoneText = Array.isArray(assessment_done) && assessment_done.length > 0 
      ? assessment_done.join(', ') 
      : (typeof assessment_done === 'number' ? assessment_done.toString() : 'None');
    const assessmentNotDoneText = Array.isArray(assessment_not_done) && assessment_not_done.length > 0 
      ? assessment_not_done.join(', ') 
      : (typeof assessment_not_done === 'number' ? assessment_not_done.toString() : 'None');
    
    const table = [
      [`Client Name`, `${capitalizeFirstLetterOfEachWord(client_full_name)}`],
      [`Serial Number`, `${client_clam_nbr}`],
      [`Total Sessions`, `${total_sessions}`],
      [`Total Attendance`, `${total_attended_sessions}`],
      [`Total Cancellations`, `${total_cancellation_total}`],
      [`Total Homework Sent`, `${total_homework_sent}`],
      [`Assessment Done`, assessmentDoneText],
      [`Assessment Not Done`, assessmentNotDoneText],
    ];

    // Draw table
    const tableStartY = doc.y;
    const columnWidths = [200, 350];
    const defaultRowHeight = 25;
    const padding = 5;

    // Draw table headers
    doc.rect(50, tableStartY, columnWidths[0], defaultRowHeight).stroke();
    doc.rect(250, tableStartY, columnWidths[1], defaultRowHeight).stroke();
    doc.text('Field', 55, tableStartY + padding);
    doc.text('Details', 255, tableStartY + padding);

    // Draw table rows
    let rowY = tableStartY + defaultRowHeight;
    for (let i = 1; i < table.length; i++) {
      const fieldName = table[i][0];
      const fieldValue = table[i][1];
      
      // Calculate row height based on content
      // For assessment rows, calculate height based on text wrapping
      let rowHeight = defaultRowHeight;
      if (fieldName === 'Assessment Done' || fieldName === 'Assessment Not Done') {
        // Calculate height needed for wrapped text
        // heightOfString returns the height in points for the text when wrapped to the specified width
        const textHeight = doc.heightOfString(fieldValue, {
          width: columnWidths[1] - (padding * 2),
        });
        // Add padding (top and bottom) and ensure minimum height
        // Add a small buffer (2 points) to ensure text doesn't get cut off
        rowHeight = Math.max(defaultRowHeight, Math.ceil(textHeight) + (padding * 2) + 2);
      }
      
      // Draw cell borders
      doc.rect(50, rowY, columnWidths[0], rowHeight).stroke();
      doc.rect(250, rowY, columnWidths[1], rowHeight).stroke();
      
      // Draw field name (left column)
      doc.text(fieldName, 55, rowY + padding);
      
      // Draw field value (right column) with text wrapping for assessment rows
      if (fieldName === 'Assessment Done' || fieldName === 'Assessment Not Done') {
        doc.text(fieldValue, 255, rowY + padding, {
          width: columnWidths[1] - (padding * 2),
          align: 'left',
        });
      } else {
        doc.text(fieldValue, 255, rowY + padding);
      }
      
      rowY += rowHeight;
    }
  };
