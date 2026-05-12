import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';

@Module({
  //imports: [], // Uncomment and add any modules that this module depends on
  providers: [SampleService],
  controllers: [SampleController]
  //exports: [SampleService], // Uncomment to provide SampleService to other modules
})
export class SampleModule {}
