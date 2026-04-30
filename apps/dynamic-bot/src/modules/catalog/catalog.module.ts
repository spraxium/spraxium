import { Module } from '@spraxium/common';
import { CatalogCommand } from './commands/catalog.command';
import { NextPageButtonHandler, PrevPageButtonHandler } from './handlers/browse-button.handler';
import { BuyBookButtonHandler } from './handlers/buy-book-button.handler';
import { CatalogCommandHandler } from './handlers/catalog-command.handler';

@Module({
  commands: [CatalogCommand],
  handlers: [CatalogCommandHandler, BuyBookButtonHandler, PrevPageButtonHandler, NextPageButtonHandler],
})
export class CatalogModule {}
