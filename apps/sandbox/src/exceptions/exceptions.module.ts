import { Module } from '@spraxium/common';
import { ExceptionsDemoListener } from './exceptions-demo.listener';

@Module({
  listeners: [ExceptionsDemoListener],
})
export class ExceptionsModule {}
