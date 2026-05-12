import { Controller, Get, Post, Put, Delete, HttpCode, Body } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';

@Controller('sample')
export class SampleController {

    constructor(private readonly sampleService: SampleService) {}

    @Get('Get-all-samples')
    @ApiOperation({ summary: 'Get all samples' })
    @ApiOkResponse({ description: 'Successfully retrieved all samples.' })
    @ApiNotFoundResponse({ description: 'No samples found.' })
    @ApiBadRequestResponse({ description: 'Bad request.' })
    @HttpCode(200)
    async findAll() {
        return this.sampleService.getAllSamples();
    }

    @Get('Get-sample-data-by-id')
    @ApiOperation({ summary: 'Get sample data by ID' })
    @ApiOkResponse({ description: 'Successfully retrieved sample data by ID.' })
    @ApiNotFoundResponse({ description: 'Sample data not found for the given ID.' })
    @ApiBadRequestResponse({ description: 'Bad request.' })
    @HttpCode(200)
    async findOne(@Body('id') id: number) {
        return this.sampleService.getSampleDataById(id);
    }

    @Post('Post-sample-data')
    @ApiOperation({ summary: 'Post sample data' })
    @ApiOkResponse({ description: 'Successfully posted sample data.' })
    @ApiBadRequestResponse({ description: 'Bad request.' })
    @ApiBody({schema: { $ref: getSchemaPath(CreateSampleDto) }})
    @HttpCode(201)
    async create(@Body() createSampleDto: CreateSampleDto) {
        return this.sampleService.postSampleData(createSampleDto.data);
    }

    @Put('Update-sample-data')
    @ApiOperation({ summary: 'Update sample data by ID' })
    @ApiOkResponse({ description: 'Successfully updated sample data by ID.' })
    @ApiNotFoundResponse({ description: 'Sample data not found for the given ID.' })
    @ApiBadRequestResponse({ description: 'Bad request.' })
    @ApiBody({schema: { $ref: getSchemaPath(UpdateSampleDto) }})
    @HttpCode(200)
    async update(@Body() updateSampleDto: UpdateSampleDto) {
        return this.sampleService.updateSampleData(updateSampleDto.id, updateSampleDto.data);
    }

    @Delete('Delete-sample-data')
    @ApiOperation({ summary: 'Delete sample data by ID' })
    @ApiOkResponse({ description: 'Successfully deleted sample data by ID.' })
    @ApiNotFoundResponse({ description: 'Sample data not found for the given ID.' })
    @ApiBadRequestResponse({ description: 'Bad request.' })
    @HttpCode(200)
    async remove(@Body('id') id: number) {
        return this.sampleService.deleteSampleData(id);
    }
}
