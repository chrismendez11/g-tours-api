import { Module, forwardRef } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PlacesRepository } from './places.repository';
import { CountriesController } from './countries/countries.controller';
import { AssistantsModule } from 'src/assistants/assistants.module';

@Module({
  imports: [forwardRef(() => AssistantsModule)],
  controllers: [PlacesController, CountriesController],
  providers: [PlacesService, PlacesRepository],
  exports: [PlacesService],
})
export class PlacesModule {}
