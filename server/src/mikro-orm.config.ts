import { Migrator } from "@mikro-orm/migrations";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SeedManager } from "@mikro-orm/seeder";
import { Options, SqliteDriver } from "@mikro-orm/sqlite";

const config: Options = {
  // for simplicity, we use the SQLite database, as it's available pretty much everywhere
  driver: SqliteDriver,
  dbName: "sqlite.db",
  // folder-based discovery setup, using common filename suffix
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug mode to log SQL queries and discovery information
  debug: true,
  dynamicImportProvider: (id) => import(id),
  extensions: [SeedManager, Migrator],
};

export default config;
