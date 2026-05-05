import { Module } from '@spraxium/common';
import { ReportsService } from './reports.service';

@Module({
  providers: [ReportsService],
})
export class ReportsModule {}
