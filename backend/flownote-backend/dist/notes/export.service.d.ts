import { Response } from 'express';
export declare class ExportService {
    exportarPDF(titulo: string, contenido: string, res: Response): void;
    exportarMarkdown(titulo: string, contenido: string, res: Response): void;
}
