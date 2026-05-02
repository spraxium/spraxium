import type { Constructor, PrefixConfig, SpraxiumGuard } from '@spraxium/common';
import { CommandLogger, Logger, logger } from '@spraxium/logger';
import { type Client, GatewayIntentBits, Partials } from 'discord.js';
import { ModuleLoader } from '../bootstrap';
import { ClientFactory, PresenceManager, SpraxiumShardManager, isShardChild } from '../client';
import type { PresenceOptions, ShardOptions } from '../client/interfaces';
import { IntentPreset, resolveIntents } from '../client/types';
import { ConfigLoader, ConfigStore } from '../config';
import { GuardRegistry } from '../guards';
import { spraxiumFatal } from '../utils';
import type { ApplicationState, SpraxiumOptions } from './interfaces';
import { ProcessLock } from './lock';
import { ShutdownHandler } from './shutdown.handler';
import { UpgradeChecker } from './upgrade';

export class SpraxiumApplication {
  private readonly state: ApplicationState;
  private booted = false;

  constructor(
    private readonly options: SpraxiumOptions,
    private readonly startedAt: number,
  ) {
    this.state = {
      token: options.token,
      sharding: options.sharding,
      globalProviders: new Map(),
    };
  }

  public useModule(module: Constructor): this {
    this.state.rootModule = module;
    return this;
  }

  public intents(preset: IntentPreset | Array<GatewayIntentBits>): this {
    this.state.intents = typeof preset === 'string' ? resolveIntents(preset) : preset;
    return this;
  }

  public addIntents(...bits: Array<GatewayIntentBits>): this {
    const base = this.state.intents ?? resolveIntents(IntentPreset.Standard);
    this.state.intents = [...new Set([...base, ...bits])];
    return this;
  }

  public initPresence(config: PresenceOptions): this {
    this.state.presence = config;
    return this;
  }

  public useSharding(options: ShardOptions): this {
    this.state.sharding = options;
    return this;
  }

  public partials(...names: Array<keyof typeof Partials>): this {
    this.state.partials = names.map((n) => Partials[n]);
    return this;
  }

  /**
   * Registers a pre-built instance in the root DI container under the given token.
   * Use this to inject value-providers such as validated environment schemas.
   *
   * Chainable. Must be called before `listen()`.
   *
   * @example
   *   const env = EnvValidator.validate(AppEnv);
   *   SpraxiumFactory.create({ token: env.token })
   *     .useModule(AppModule)
   *     .provide(AppEnv, env)
   *     .listen();
   */
  public provide(token: unknown, instance: unknown): this {
    this.state.globalProviders.set(token, instance);
    return this;
  }

  /**
   * Registers a guard to be applied globally , before every command handler,
   * regardless of class- or method-level @UseGuards().
   *
   * Chainable: call multiple times to stack global guards in registration order.
   *
   * @example
   *   app.useGlobalGuards(GuildOnly);
   *   app.useGlobalGuards(OwnerOnly, { ownerIds: ['123456789012345678'] });
   */
  public useGlobalGuards(guardClass: new () => SpraxiumGuard, options: Record<string, unknown> = {}): this {
    GuardRegistry.register(guardClass, options);
    return this;
  }

  /**
   * Forces slash command registration with the Discord REST API, bypassing the
   * dev-mode hash cache. Useful after modifying commands at runtime without
   * restarting the application.
   *
   * No-op if the application has not yet booted or has no slash commands.
   */
  public async forceRegisterSlashCommands(): Promise<void> {
    const dispatcher = this.state.moduleLoader?.getSlashDispatcher();
    const contextMenuDispatcher = this.state.moduleLoader?.getContextMenuDispatcher();
    const slashCount = dispatcher?.commandCount ?? 0;
    const contextMenuCount = contextMenuDispatcher?.commandCount ?? 0;
    if (!dispatcher || slashCount + contextMenuCount === 0) return;

    const token = this.state.token ?? process.env.DISCORD_TOKEN;
    const clientId = this.state.client?.user?.id;
    if (!token || !clientId) return;

    const extraPayloads = contextMenuDispatcher?.buildPayloads() ?? [];
    const extraGuildPayloads = contextMenuDispatcher?.buildGuildGroupedPayloads() ?? new Map();
    await dispatcher.register(token, clientId, undefined, true, extraPayloads, extraGuildPayloads);
  }

  public async listen(): Promise<void> {
    if (this.booted) {
      spraxiumFatal(
        'SpraxiumApplication',
        'listen() called more than once',
        [
          'The application has already been bootstrapped.',
          'Calling listen() again would duplicate event listeners and reconnect the client.',
        ],
        ['Remove the duplicate listen() call.'],
      );
    }
    this.booted = true;

    await ProcessLock.acquire();
    UpgradeChecker.check();

    await this.loadConfig();
    const token = this.resolveToken();

    if (await this.trySpawnShards(token)) return;

    const client = this.buildClient();
    this.loadModules(client);
    await this.runBootHooks();
    await this.wireClient(client);

    ShutdownHandler.register(client, this.state.moduleLoader);

    await this.loginAndAwaitReady(client, token);
  }

  private async loadConfig(): Promise<void> {
    await ConfigLoader.load();
    const raw = ConfigStore.getRaw();
    if (raw.debug) Logger.setDebug(true);
    if (raw.logger) Logger.configure(raw.logger);
  }

  private resolveToken(): string {
    const token = this.state.token ?? process.env.DISCORD_TOKEN;

    if (!token) {
      spraxiumFatal(
        'SpraxiumApplication',
        'no Discord token found',
        [
          'A bot token is required to authenticate with the Discord API.',
          'No token was found in options or in the DISCORD_TOKEN environment variable.',
        ],
        [
          'Option A , pass it directly: SpraxiumFactory.create({ token: "your-token" })',
          'Option B , set DISCORD_TOKEN in your .env file and ensure it is loaded.',
          'Get or regenerate your token at: discord.com/developers/applications',
        ],
      );
    }

    return token;
  }

  private async trySpawnShards(token: string): Promise<boolean> {
    if (!this.state.sharding || isShardChild()) return false;

    if (process.env.NODE_ENV === 'development') {
      logger.warn(
        'Sharding in dev mode is not recommended , multiple shard processes slow down restarts ' +
          'and may hit Discord rate limits. Consider using a single instance during development.',
      );
    }

    const sm = new SpraxiumShardManager(this.state.sharding, token);
    await sm.spawn(this.startedAt);
    return true;
  }

  private loadModules(client: Client): void {
    if (!this.state.rootModule) return;

    this.state.client = client;
    this.state.moduleLoader = new ModuleLoader();
    this.state.moduleLoader.load(this.state.rootModule, client, this.state.globalProviders);
    this.state.moduleLoader.printBootTables();
  }

  private async runBootHooks(): Promise<void> {
    await this.state.moduleLoader?.runBootHooks();
  }

  private buildClient(): Client {
    return ClientFactory.create({
      ...this.options,
      intents: this.state.intents,
      partials: this.state.partials ?? this.options.partials,
    });
  }

  private async wireClient(client: Client): Promise<void> {
    Logger.setClient(client);
    const raw = ConfigStore.getRaw();
    if (raw.logger?.commandLogging) CommandLogger.bind(client);
    this.state.moduleLoader?.bindListeners(client);

    const prefixConfig = this.resolvePrefixConfig(raw.prefix);
    const dispatcher = this.state.moduleLoader?.getPrefixDispatcher();
    if (dispatcher && dispatcher.size > 0 && prefixConfig) {
      this.validateMessageContentIntent(client);

      if (prefixConfig.guildPrefixProvider) {
        await dispatcher.guildPrefixes.loadFromProvider(prefixConfig.guildPrefixProvider);
      }

      dispatcher.bind(client, prefixConfig);
    }

    const slashDispatcher = this.state.moduleLoader?.getSlashDispatcher();
    if (slashDispatcher && slashDispatcher.size > 0) {
      slashDispatcher.bind(client);
    }

    const contextMenuDispatcher = this.state.moduleLoader?.getContextMenuDispatcher();
    if (contextMenuDispatcher && contextMenuDispatcher.size > 0) {
      contextMenuDispatcher.bind(client);
    }
  }

  private resolvePrefixConfig(configPrefix?: PrefixConfig): PrefixConfig | undefined {
    if (configPrefix) return configPrefix;
    return undefined;
  }

  private validateMessageContentIntent(client: Client): void {
    const intents = client.options.intents;
    const hasMessageContent = intents.has(GatewayIntentBits.MessageContent);

    if (!hasMessageContent) {
      spraxiumFatal(
        'SpraxiumApplication',
        'MessageContent intent required for prefix commands',
        [
          'You have registered prefix commands but the MessageContent privileged intent is not enabled.',
          'Without GatewayIntentBits.MessageContent, message.content will always be empty',
          'and the prefix parser will never match any commands.',
        ],
        [
          'Add the intent in your bootstrap: app.addIntents(GatewayIntentBits.MessageContent)',
          'Or use the "all" intent preset: app.intents("all")',
          'Make sure the MESSAGE CONTENT INTENT is also enabled in the Discord Developer Portal:',
          'Discord Developer Portal → Your App → Bot → Privileged Gateway Intents.',
        ],
      );
    }
  }

  private static readonly READY_TIMEOUT_MS = 30_000;

  private waitForReady(client: Client): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.destroy();
        reject(
          new Error(
            `Client did not receive READY within ${SpraxiumApplication.READY_TIMEOUT_MS / 1_000}s. Check your intents configuration and network connectivity.`,
          ),
        );
      }, SpraxiumApplication.READY_TIMEOUT_MS);

      client.once('clientReady', async (readyClient) => {
        clearTimeout(timeout);
        PresenceManager.initialize(readyClient, this.state.presence);
        await this.state.moduleLoader?.runReadyHooks(readyClient);

        const slashDispatcher = this.state.moduleLoader?.getSlashDispatcher();
        const contextMenuDispatcher = this.state.moduleLoader?.getContextMenuDispatcher();
        const slashCount = slashDispatcher?.commandCount ?? 0;
        const contextMenuCount = contextMenuDispatcher?.commandCount ?? 0;

        if (slashDispatcher && slashCount + contextMenuCount > 0) {
          const token = this.state.token ?? process.env.DISCORD_TOKEN;
          if (token) {
            const extraPayloads = contextMenuDispatcher?.buildPayloads() ?? [];
            const extraGuildPayloads = contextMenuDispatcher?.buildGuildGroupedPayloads() ?? new Map();
            await slashDispatcher.register(
              token,
              readyClient.user.id,
              undefined,
              false,
              extraPayloads,
              extraGuildPayloads,
            );
          }
        }

        if (!isShardChild()) {
          const ms = Date.now() - this.startedAt;
          logger.success(
            `Logged in as ${readyClient.user.tag} (${readyClient.guilds.cache.size} guilds) in ${ms}ms`,
          );
        }

        resolve();
      });
    });
  }

  private async loginAndAwaitReady(client: Client, token: string): Promise<void> {
    const readyPromise = this.waitForReady(client);

    try {
      await client.login(token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      client.destroy();
      spraxiumFatal(
        'SpraxiumApplication',
        'failed to connect to Discord',
        [`discord.js rejected the login attempt: ${message}`],
        [
          'Check that the token is correct and has not been regenerated or revoked.',
          'Ensure the bot has the Gateway Intents it needs enabled in the',
          'Discord Developer Portal → Your App → Bot → Privileged Gateway Intents.',
          'Get a fresh token at: discord.com/developers/applications',
        ],
      );
    }

    await readyPromise;
  }
}
