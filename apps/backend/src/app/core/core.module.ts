import { HttpModule } from '@nestjs/axios';
import { Global, Module, SetMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Agent } from 'https';

export const BYPASS_RESPONSE_FORMAT = 'bypassResponseFormat';

export const BypassResponseFormat = () => SetMetadata(BYPASS_RESPONSE_FORMAT, true);

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // console.log(process.env.NODE_ENV)
        // console.log(configService.get('environment'))
        // console.log(configService.get('HTTP_TIMEOUT'))
        // console.log(configService.get('HTTP_MAX_REDIRECTS'))
        return {
          timeout: configService.get('HTTP_TIMEOUT'),
          maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
          httpsAgent: new Agent({
            rejectUnauthorized: process.env.NODE_ENV === 'production',
          }),
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [HttpModule],
})
export class CoreModule {}
