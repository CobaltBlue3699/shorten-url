import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import csvParser from 'csv-parser';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { GeoIp, GeoIpTemp } from './geoip.schema';
import { Connection, Model } from 'mongoose';

@Injectable()
export class IpGeolocationService implements OnModuleInit {
  private readonly logger = new Logger(IpGeolocationService.name);

  geoCollectionName!: string;
  geoTempCollectionName!: string;
  dir = './temp'

  constructor(
    @InjectModel(GeoIp.name) private geoIpModel: Model<GeoIp>,
    @InjectModel(GeoIpTemp.name) private geoIpTempModel: Model<GeoIpTemp>,
    @InjectConnection() private connection: Connection,
    private http: HttpService
  ) {
    this.geoCollectionName = this.geoIpModel.collection.name;
    this.geoTempCollectionName = this.geoIpTempModel.collection.name;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    await this.downloadAndParseCsv();
    await this.insertDataToTemp();
    await this.renameAndBackupCollections();
  }

  onModuleInit() { // for new environment
    this.handleCron();
  }

  private async downloadAndParseCsv() {
    this.logger.debug('Downloading IP Geolocation CSV...');
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(this.dir)){
          this.logger.debug('generate temp folder to save ip data...')
          fs.mkdirSync(this.dir, { recursive: true });
        }
        lastValueFrom(
          this.http.get(
            'https://raw.githubusercontent.com/sapics/ip-location-db/main/geo-whois-asn-country/geo-whois-asn-country-ipv4.csv',
            {
              responseType: 'stream',
            }
          )
        ).then((response) => {
          const file = fs.createWriteStream(`${this.dir}/geo-whois-asn-country-ipv4.csv`, { flags: 'w', encoding: 'utf-8' });
          response.data.pipe(file);

          file.on('finish', () => {
            file.close();
            this.logger.debug('Downloaded and saved the CSV file.');
            resolve(void 0);
          });
        });
      } catch (error) {
        fs.unlinkSync(`${this.dir}/geo-whois-asn-country-ipv4.csv`);
        this.logger.error('Error downloading CSV file', error.message);
        reject();
      }
    });
  }

  async insertDataToTemp() {
    return new Promise((resolve, reject) => {
      try {
        const results = [];
        fs.createReadStream(`${this.dir}/geo-whois-asn-country-ipv4.csv`)
          .pipe(csvParser(['ipStart', 'ipEnd', 'countryCode']))
          .on('data', (data) => {
            const { ipStart, ipEnd, countryCode } = data;
            results.push({
              ipStartNum: this.ipToNumber(ipStart),
              ipEndNum: this.ipToNumber(ipEnd),
              countryCode,
            });
          })
          .on('end', async () => {
            this.logger.debug('CSV file parsed successfully.');
            // 處理解析後的資料, 可以儲存在記憶體或者寫入DB等操作
            // console.log(results[0]);
            const insertRes = await this.geoIpTempModel.insertMany(results);
            this.logger.debug(`Data saved to collection: ${GeoIpTemp.name}, ${insertRes.length}`);
            resolve(insertRes.length);
          });
      } catch (err) {
        this.logger.debug(`Data saved to collection failed: ${err}`);
        reject();
      }
    });
  }

  async renameAndBackupCollections() {
    const connection = this.connection.db;
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await connection.renameCollection(this.geoCollectionName, `${this.geoCollectionName}_${todayDate}`, { dropTarget: true });
    this.logger.debug(`Renamed ${this.geoCollectionName} collection to ${this.geoCollectionName}_${todayDate}.`);
    await connection.renameCollection(this.geoTempCollectionName, this.geoCollectionName, { dropTarget: true });
    this.logger.debug(`Renamed ${this.geoTempCollectionName} to ${this.geoCollectionName} successfully.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON) // Every day at noon
  async dropOldBackup() {
    const yesterdayDate = this.getYesterdayDate(); // Yesterday's date
    const collectionName = `${this.geoCollectionName}_${yesterdayDate}`;

    const collections = await this.connection.db.listCollections({ name: collectionName }).toArray();

    if (collections.length > 0) {
      await this.connection.db.dropCollection(collectionName);
      this.logger.debug(`Dropped backup collection ${collectionName}`);
    } else {
      this.logger.warn(`Backup collection ${collectionName} does not exist.`);
    }
  }

  private getYesterdayDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => {
      return (acc << 8) + parseInt(octet, 10);
    }, 0);
  }
}
