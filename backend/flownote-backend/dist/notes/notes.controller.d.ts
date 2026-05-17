import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    crear(dto: CreateNoteDto, req: any): Promise<import("./schemas/note.schema").NoteDocument>;
    obtenerMias(req: any): Promise<import("./schemas/note.schema").NoteDocument[]>;
    buscar(q: string, req: any): Promise<import("./schemas/note.schema").NoteDocument[]>;
    porEstado(estado: string, req: any): Promise<import("./schemas/note.schema").NoteDocument[]>;
    obtenerUna(id: string, req: any): Promise<import("./schemas/note.schema").NoteDocument>;
    actualizar(id: string, dto: UpdateNoteDto, req: any): Promise<import("./schemas/note.schema").NoteDocument>;
    eliminar(id: string, req: any): Promise<{
        mensaje: string;
    }>;
    sugerirVinculos(id: string, req: any): Promise<import("./schemas/note.schema").NoteDocument[]>;
}
