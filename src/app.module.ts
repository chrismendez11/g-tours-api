import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/modules/prisma/prisma.module';
import { PlacesModule } from './places/places.module';
import { ToursModule } from './tours/tours.module';
import { AssistantsModule } from './assistants/assistants.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    PrismaModule,
    PlacesModule,
    ToursModule,
    AssistantsModule,
    ReservationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
