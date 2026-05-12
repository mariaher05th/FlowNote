import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SampleService {

    constructor(private readonly prisma: PrismaService) {}

    async getAllSamples(): Promise<string> {
        // Aquí podrías implementar la lógica para obtener todos los datos de muestra.
        const samples = await this.prisma.sample.findMany();
        if (!samples || samples.length === 0) {
            throw new NotFoundException('No samples found');
        }
        return `All sample data: ${JSON.stringify(samples)}`; // Devuelve los datos en formato JSON
    }

    async getSampleDataById(id: number): Promise<string> {
        // Aquí podrías implementar la lógica para obtener datos basados en el ID.
        // Sample usando prisma
        const sampleData = await this.prisma.sample.findUnique({
            where: { id },
        });
        if (!sampleData) {
            throw new NotFoundException('Sample data not found');
        }

        return `Sample data for ID ${id}: ${JSON.stringify(sampleData)}`; // Devuelve los datos en formato JSON
    }

    async postSampleData(data: string): Promise<string> {
        // Aquí podrías implementar la lógica para guardar o procesar los datos recibidos.
        const newSampleData = await this.prisma.sample.create({
            data: { data },
        });
        if (!newSampleData) {
            throw new BadRequestException('Failed to create sample data');
        }
        return `Data received and stored with ID: ${newSampleData.id}`;
    }

    async updateSampleData(id: number, data: string): Promise<string> {
        // Aquí podrías implementar la lógica para actualizar los datos basados en el ID.
        const updatedSampleData = await this.prisma.sample.update({
            where: { id },
            data: { data },
        });
        if (!updatedSampleData) {
            throw new NotFoundException('Sample data not found for update');
        }
        return `Data with ID ${id} updated to: ${JSON.stringify(updatedSampleData)}`;
    }

    async deleteSampleData(id: number): Promise<string> {
        // Aquí podrías implementar la lógica para eliminar los datos basados en el ID.
        const deletedSampleData = await this.prisma.sample.delete({
            where: { id },
        });
        if (!deletedSampleData) {
            throw new NotFoundException('Sample data not found for deletion');
        }
        return `Data with ID ${id} has been deleted.`;
    }
}
