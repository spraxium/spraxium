export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
}

export const CATALOG: ReadonlyArray<Book> = [
  { id: 'b-1', title: 'Designing Data-Intensive Applications', author: 'Kleppmann', price: 39 },
  { id: 'b-2', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', price: 29 },
  { id: 'b-3', title: 'Refactoring', author: 'Fowler', price: 35 },
  { id: 'b-4', title: 'Domain-Driven Design', author: 'Evans', price: 42 },
];
