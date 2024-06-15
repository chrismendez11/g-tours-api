import { Module, forwardRef } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { ToursRepository } from './tours.repository';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
  imports: [forwardRef(() => AssistantsModule), ReservationsModule],
  controllers: [ToursController],
  providers: [ToursService, ToursRepository],
  exports: [ToursService],
})
export class ToursModule {}
