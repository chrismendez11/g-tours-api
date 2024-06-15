import { Module, forwardRef } from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { AssistantsController } from './assistants.controller';
import { AssistantsRepository } from './assistants.repository';
import { PlacesModule } from 'src/places/places.module';
import { ToursModule } from 'src/tours/tours.module';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
  imports: [forwardRef(() => PlacesModule), ToursModule, ReservationsModule],
  controllers: [AssistantsController],
  providers: [AssistantsService, AssistantsRepository],
  exports: [AssistantsService],
})
export class AssistantsModule {}
