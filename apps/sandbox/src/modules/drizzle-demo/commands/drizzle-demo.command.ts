import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'drizzle',
  description: 'Testes de integracao com Drizzle ORM e PostgreSQL',
})
export class DrizzleDemoCommand {
  @SlashSubcommand({
    name: 'ping',
    description: 'Valida conectividade com PostgreSQL',
  })
  ping() {}

  @SlashOption.String('note', {
    description: 'Texto para salvar na tabela de teste',
    required: true,
    maxLength: 120,
  })
  @SlashSubcommand({
    name: 'insert',
    description: 'Insere um registro de teste no banco',
  })
  insert() {}

  @SlashOption.Integer('limit', {
    description: 'Quantidade de registros retornados',
    required: false,
    min: 1,
    max: 10,
  })
  @SlashSubcommand({
    name: 'recent',
    description: 'Lista os registros de teste mais recentes',
  })
  recent() {}
}
