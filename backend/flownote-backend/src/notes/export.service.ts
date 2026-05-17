import { Injectable, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  // Exportar nota como PDF
  exportarPDF(titulo: string, contenido: string, res: Response): void {
    if (!contenido || contenido.trim().length === 0) {
      throw new BadRequestException('La nota está vacía, no hay contenido para exportar');
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${titulo.replace(/\s+/g, '_')}.pdf"`,
    );

    doc.pipe(res);

    // Título
    doc.fontSize(22).font('Helvetica-Bold').text(titulo, { align: 'left' });
    doc.moveDown(0.5);

    // Línea separadora
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Contenido
    doc.fontSize(12).font('Helvetica').text(contenido, {
      align: 'left',
      lineGap: 4,
    });

    doc.end();
  }

  // Exportar nota como Markdown
  exportarMarkdown(titulo: string, contenido: string, res: Response): void {
    if (!contenido || contenido.trim().length === 0) {
      throw new BadRequestException('La nota está vacía, no hay contenido para exportar');
    }

    const markdown = `# ${titulo}\n\n${contenido}`;

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${titulo.replace(/\s+/g, '_')}.md"`,
    );

    res.send(markdown);
  }
}