import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeoIp, GeoIpSchema, GeoIpTemp, GeoIpTempSchema } from './geoip.schema';
import { IpGeolocationService } from './ip-geolocation.service';
import { IpService } from './ip.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: GeoIp.name,
        useFactory: () => GeoIpSchema,
      },
      {
        name: GeoIpTemp.name,
        useFactory: () => GeoIpTempSchema,
      },
    ]),
    // BullModule.registerQueue({
    //   name: 'usage-count',
    // }),
  ],
  controllers: [],
  providers: [
    IpService,
    IpGeolocationService,
    // DeleteStatProcessor
  ],
  exports: [IpService],
})
export class GeoIpModule {}
