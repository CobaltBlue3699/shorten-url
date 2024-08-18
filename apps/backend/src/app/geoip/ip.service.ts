import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GeoIp } from './geoip.schema';
import { Model } from 'mongoose';

@Injectable()
export class IpService  {
  private readonly logger = new Logger(IpService.name);

  constructor(@InjectModel(GeoIp.name) private geoIpModel: Model<GeoIp>) {}

  async getCountryByIp(ip: string): Promise<string> {
    const ipNumber = this.ipToNumber(ip);
    const geoIpRecord = await this.geoIpModel.findOne({
      ipStartNum: { $lte: ipNumber },
      ipEndNum: { $gte: ipNumber },
    }).exec();
    this.logger.log(`${ip} from ${geoIpRecord.countryCode}`)
    return geoIpRecord ? geoIpRecord.countryCode : null;
  }

  ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => {
      return (acc << 8) + parseInt(octet, 10);
    }, 0);
  }
}
