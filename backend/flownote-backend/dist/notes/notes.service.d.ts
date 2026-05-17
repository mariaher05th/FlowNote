import { Model } from 'mongoose';
import { NoteDocument } from './schemas/note.schema';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
export declare class NotesService {
    private noteModel;
    constructor(noteModel: Model<NoteDocument>);
    crear(dto: CreateNoteDto, userId: string): Promise<NoteDocument>;
    obtenerMias(userId: string): Promise<NoteDocument[]>;
    obtenerUna(id: string, userId: string): Promise<NoteDocument>;
    actualizar(id: string, dto: UpdateNoteDto, userId: string): Promise<NoteDocument>;
    eliminar(id: string, userId: string): Promise<{
        mensaje: string;
    }>;
    buscar(query: string, userId: string): Promise<NoteDocument[]>;
    sugerirVinculos(id: string, userId: string): Promise<NoteDocument[]>;
    porEstado(estado: string, userId: string): Promise<NoteDocument[]>;
}
