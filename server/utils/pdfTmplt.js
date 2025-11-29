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
    assessment_done = 0,
    assessment_not_done = 0,
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
    const table = [
      [`Client Name`, `${capitalizeFirstLetterOfEachWord(client_full_name)}`],
      [`Serial Number`, `${client_clam_nbr}`],
      [`Total Sessions`, `${total_sessions}`],
      [`Total Attendance`, `${total_attended_sessions}`],
      [`Total Cancellations`, `${total_cancellation_total}`],
      [`Total Homework Sent`, `${total_homework_sent}`],
      [`Assessment Done`, `${assessment_done}`],
      [`Assessment Not Done`, `${assessment_not_done}`],
    ];

    // Draw table
    const tableStartY = doc.y;
    const columnWidths = [200, 200];
    const rowHeight = 25;

    // Draw table headers
    doc.rect(50, tableStartY, columnWidths[0], rowHeight).stroke();
    doc.rect(250, tableStartY, columnWidths[1], rowHeight).stroke();
    doc.text('Field', 55, tableStartY + 5);
    doc.text('Details', 255, tableStartY + 5);

    // Draw table rows
    let rowY = tableStartY + rowHeight;
    for (let i = 1; i < table.length; i++) {
      doc.rect(50, rowY, columnWidths[0], rowHeight).stroke();
      doc.rect(250, rowY, columnWidths[1], rowHeight).stroke();
      doc.text(table[i][0], 55, rowY + 5);
      doc.text(table[i][1], 255, rowY + 5);
      rowY += rowHeight;
    }
  };
