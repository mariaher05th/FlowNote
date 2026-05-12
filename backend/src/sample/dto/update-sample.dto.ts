// DTO sample for updating a sample entity
// This DTO is used to transfer data when updating a sample entity in the application.
// It defines the structure and types of the data that can be sent to the server when making an update request.
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSampleDto {
    @ApiProperty({
        description: 'The unique identifier of the sample to be updated',
        example: '1234',
    })
    @IsNotEmpty() // Validation to ensure it's not empty
    @IsString() // Validation to ensure it's a string
    readonly id: number;

    @ApiProperty({
        description: 'The new data for the sample',
        example: 'This is the updated sample data.',
    })
    @IsString() // Validation to ensure it's a string
    readonly data: string;

    // You can add more properties as needed for your application.
    constructor(id: number, data: string) {
        this.id = id;
        this.data = data;
    }
}

