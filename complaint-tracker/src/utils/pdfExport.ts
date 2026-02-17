import { jsPDF } from 'jspdf';
import type { Complaint } from '../types';
import { calculateDaysPending } from './helpers';

export const exportToPDF = (complaints: Complaint[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Complaint Tracker Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Total Complaints: ${complaints.length}`, 20, 40);
  
  let y = 60;
  complaints.forEach((complaint, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    doc.text(`${index + 1}. ${complaint.complaintId}`, 20, y);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Portal: ${complaint.portalName}`, 20, y + 7);
    doc.text(`Category: ${complaint.category}`, 20, y + 14);
    doc.text(`Status: ${complaint.status}`, 20, y + 21);
    doc.text(`Department: ${complaint.department}`, 20, y + 28);
    doc.text(`Date Lodged: ${complaint.dateLodged}`, 20, y + 35);
    doc.text(`Days Pending: ${calculateDaysPending(complaint.dateLodged)}`, 20, y + 42);
    doc.text(`Expected Response: ${complaint.expectedResponseDate}`, 20, y + 49);
    
    if (complaint.description) {
      const desc = doc.splitTextToSize(`Description: ${complaint.description}`, 170);
      doc.text(desc, 20, y + 56);
      y += desc.length * 5;
    }
    
    y += 70;
  });
  
  doc.save('complaints-report.pdf');
};
