import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/modules/prisma/prisma.module';
import { PlacesModule } from './places/places.module';
import { ToursModule } from './tours/tours.module';

@Module({
  imports: [PrismaModule, PlacesModule, ToursModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
