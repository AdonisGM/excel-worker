import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableTelegramTemplate1747020470174 implements MigrationInterface {
    name = 'CreateTableTelegramTemplate1747020470174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` DROP FOREIGN KEY \`FK_560f58ddfdb678adc3f09d96f41\``);
        await queryRunner.query(`CREATE TABLE \`telegram_template\` (\`template_id\` varchar(36) NOT NULL, \`code\` varchar(50) NOT NULL, \`name\` varchar(200) NOT NULL, \`template\` varchar(2000) NOT NULL, UNIQUE INDEX \`IDX_cfe9a1b24f2f4ff92ad55b33ba\` (\`code\`), PRIMARY KEY (\`template_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` DROP COLUMN \`fk_budgoose_wallet_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` ADD \`fk_budgoose_wallet_id\` varchar(36) NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_cfe9a1b24f2f4ff92ad55b33ba\` ON \`telegram_template\``);
        await queryRunner.query(`DROP TABLE \`telegram_template\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` ADD CONSTRAINT \`FK_560f58ddfdb678adc3f09d96f41\` FOREIGN KEY (\`fk_budgoose_wallet_id\`) REFERENCES \`budgoose_wallet\`(\`budgoose_wallet_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
