"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = require("pdfkit");
let ExportService = class ExportService {
    exportarPDF(titulo, contenido, res) {
        if (!contenido || contenido.trim().length === 0) {
            throw new common_1.BadRequestException('La nota está vacía, no hay contenido para exportar');
        }
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${titulo.replace(/\s+/g, '_')}.pdf"`);
        doc.pipe(res);
        doc.fontSize(22).font('Helvetica-Bold').text(titulo, { align: 'left' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(contenido, {
            align: 'left',
            lineGap: 4,
        });
        doc.end();
    }
    exportarMarkdown(titulo, contenido, res) {
        if (!contenido || contenido.trim().length === 0) {
            throw new common_1.BadRequestException('La nota está vacía, no hay contenido para exportar');
        }
        const markdown = `# ${titulo}\n\n${contenido}`;
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${titulo.replace(/\s+/g, '_')}.md"`);
        res.send(markdown);
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)()
], ExportService);
//# sourceMappingURL=export.service.js.map