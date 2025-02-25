import { Migration } from '@mikro-orm/migrations';

export class Migration20250225165923 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`meter_readings\` (\`id\` integer not null primary key autoincrement, \`nmi\` text not null, \`timestamp\` timestamp null, \`consumption\` numeric not null);`);
    this.addSql(`create unique index \`meter_readings_nmi_timestamp_unique\` on \`meter_readings\` (\`nmi\`, \`timestamp\`);`);
  }

}
