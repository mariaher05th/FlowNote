export declare class CreateNoteDto {
    titulo: string;
    contenido?: string;
    estado?: string;
    etiquetas?: string[];
    es_colaborativa?: boolean;
    espacio_id?: string;
}
export declare class UpdateNoteDto {
    titulo?: string;
    contenido?: string;
    estado?: string;
    etiquetas?: string[];
    es_colaborativa?: boolean;
}
export declare class SearchNoteDto {
    q: string;
}
