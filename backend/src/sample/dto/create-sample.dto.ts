//Este es un sample de DTO (Data Transfer Object) 
//Un DTO es un objeto que se utiliza para transferir datos entre procesos (endpoints, servicios, etc.) de manera estructurada y tipada.
//En este caso, el CreateSampleDto se utiliza para definir la estructura de los datos que se esperan al crear una nueva entidad de muestra (sample) en la aplicación.
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSampleDto {
    // Usamos @ApiProperty para documentar la propiedad en Swagger
    @ApiProperty({
        description: 'The unique identifier of the sample',
        example: '1234',
    })
    @IsNotEmpty() // Validación para asegurar que no está vacío
    @IsString() // Validación para asegurar que es una cadena de texto
    readonly id: number; 
    

    @ApiProperty({
        description: 'The data associated with the sample',
        example: 'This is a sample data string.',
    })
    @IsString() // Validación para asegurar que es una cadena de texto
    readonly data: string;

    // Puedes agregar más propiedades según las necesidades de tu aplicación.
    constructor(id: number, data: string) {
        this.id = id;
        this.data = data;
    }
}