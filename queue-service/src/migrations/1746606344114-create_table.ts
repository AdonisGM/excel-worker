import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1746606344114 implements MigrationInterface {
    name = 'CreateTable1746606344114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_login_logger\` (\`user_login_logger_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`ip_address\` varchar(50) NULL, \`ip_address_v6\` varchar(50) NULL, \`device\` varchar(300) NULL, \`is_correct_password\` tinyint NOT NULL DEFAULT '0', \`created_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(36) NULL, \`fk_user_id\` varchar(36) NULL, PRIMARY KEY (\`user_login_logger_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_refresh_token\` (\`user_refresh_token_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`refresh_token\` varchar(500) NOT NULL, \`expire_date\` datetime NOT NULL, \`ip_address\` varchar(50) NULL, \`ip_address_v6\` varchar(50) NULL, \`device\` varchar(300) NULL, \`created_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(36) NULL, \`fk_user_id\` varchar(36) NULL, PRIMARY KEY (\`user_refresh_token_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`diary_info\` (\`diary_info_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`quantity_posts\` int NOT NULL DEFAULT '0', \`quantity_likes\` int NOT NULL DEFAULT '0', \`locked\` int NOT NULL DEFAULT '0', \`fk_user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_56904a73fbf3b5d57c1880a7f7\` (\`username\`), UNIQUE INDEX \`REL_e0850b37061ce978958ea7f483\` (\`fk_user_id\`), PRIMARY KEY (\`diary_info_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`diary_key\` (\`diary_key_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`fingerprint\` varchar(100) NOT NULL, \`fk_user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_7bbf467ca1cec9bda6c7105b76\` (\`username\`), PRIMARY KEY (\`diary_key_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`diary_entity\` (\`diary_entity_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`title\` varchar(300) NOT NULL, \`status\` varchar(50) NOT NULL, \`counter\` varchar(100) NULL, \`is_archived\` tinyint NOT NULL DEFAULT '0', \`content\` text NULL, \`created_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_time\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`created_by\` varchar(36) NULL, \`updated_by\` varchar(36) NULL, \`fk_user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_b8ad5b9bea266c74d190a816f3\` (\`username\`), PRIMARY KEY (\`diary_entity_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_info\` (\`budgoose_info_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`cash_balance\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_loan\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_credit_limit\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_credit_usage\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_savings\` decimal(20,2) NOT NULL DEFAULT '0.00', \`fk_user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_79e8421d29aa05937bd24ad0bb\` (\`username\`), UNIQUE INDEX \`REL_c6d14ce20ca1d54d1ca6202392\` (\`fk_user_id\`), PRIMARY KEY (\`budgoose_info_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_history\` (\`budgoose_history_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`date\` datetime NOT NULL, \`cash_balance\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_loan\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_credit_limit\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_credit_usage\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_savings\` decimal(20,2) NOT NULL DEFAULT '0.00', \`fk_user_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_history_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_wallet\` (\`budgoose_wallet_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`name\` varchar(200) NOT NULL, \`cash_balance\` decimal(20,2) NOT NULL DEFAULT '0.00', \`description\` varchar(2000) NULL, \`fk_user_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_wallet_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_wallet_trans\` (\`budgoose_wallet_trans_id\` varchar(36) NOT NULL, \`cash_in\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_out\` decimal(20,2) NOT NULL DEFAULT '0.00', \`note\` varchar(2000) NULL, \`date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`fk_budgoose_wallet_id\` varchar(36) NULL, \`fk_budgoose_management_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_wallet_trans_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_management\` (\`budgoose_management_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`business_type\` varchar(50) NOT NULL, \`description\` varchar(2000) NULL, \`cash\` decimal(20,2) NOT NULL DEFAULT '0.00', \`fk_user_id\` varchar(36) NULL, \`fk_budgoose_wallet_id\` varchar(36) NULL, \`fk_budgoose_wallet_target_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_management_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_loan_trans\` (\`budgoose_loan_trans_id\` varchar(36) NOT NULL, \`cash_in\` decimal(20,2) NOT NULL DEFAULT '0.00', \`cash_out\` decimal(20,2) NOT NULL DEFAULT '0.00', \`note\` varchar(2000) NULL, \`date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`fk_budgoose_loan_holder_id\` varchar(36) NULL, \`fk_budgoose_management_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_loan_trans_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_loan_holder\` (\`budgoose_loan_holder_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`holder_name\` varchar(200) NOT NULL, \`holder_username\` varchar(50) NOT NULL, \`cash_loan\` decimal(20,2) NOT NULL DEFAULT '0.00', \`note\` varchar(2000) NULL, \`telegram_id\` varchar(50) NULL, \`fk_user_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_loan_holder_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`user_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`password\` varchar(60) NOT NULL, \`password_salt\` varchar(60) NOT NULL, \`fullname\` varchar(200) NOT NULL, \`email\` varchar(300) NOT NULL, \`mobile\` varchar(20) NULL, \`birthday\` datetime NULL, \`status\` varchar(20) NOT NULL, \`subscription_type\` varchar(20) NULL, \`timezone\` varchar(50) NULL, \`timezone_offset\` varchar(10) NULL, \`telegram_id\` varchar(50) NULL, \`created_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_time\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`created_by\` varchar(36) NULL, \`updated_by\` varchar(36) NULL, \`fk_diary_info_id\` varchar(36) NULL, \`fk_budgoose_info_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`REL_4d50fa60ae08828ab681c7d4d7\` (\`fk_diary_info_id\`), UNIQUE INDEX \`REL_7346513323d8d0dfe6668e5482\` (\`fk_budgoose_info_id\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budgoose_management_loan\` (\`budgoose_management_loan_id\` varchar(36) NOT NULL, \`cash\` decimal(20,2) NOT NULL DEFAULT '0.00', \`description\` varchar(2000) NULL, \`fk_budgoose_wallet_id\` varchar(36) NULL, \`fk_budgoose_management_id\` varchar(36) NULL, PRIMARY KEY (\`budgoose_management_loan_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_login_logger\` ADD CONSTRAINT \`FK_b202080d0253515dc2238bf93d2\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_login_logger\` ADD CONSTRAINT \`FK_8660352740a16363bc1cc323f5c\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` ADD CONSTRAINT \`FK_18fbb5c789d47fc75f8eca19b26\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` ADD CONSTRAINT \`FK_facfc36ccdd78ceac2cb4f7c8a2\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diary_info\` ADD CONSTRAINT \`FK_e0850b37061ce978958ea7f4831\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diary_key\` ADD CONSTRAINT \`FK_25a3bd53c114fec3dba5d714ff3\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diary_entity\` ADD CONSTRAINT \`FK_ccc6f7dff1f2314591b6522a760\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diary_entity\` ADD CONSTRAINT \`FK_b49abeb7cdc2e38f2607d8defc1\` FOREIGN KEY (\`updated_by\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`diary_entity\` ADD CONSTRAINT \`FK_1991f0f6ec448365fbf35cd5997\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_info\` ADD CONSTRAINT \`FK_c6d14ce20ca1d54d1ca62023920\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_history\` ADD CONSTRAINT \`FK_f7e6cd4837dbb8064c186742fa0\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_wallet\` ADD CONSTRAINT \`FK_f9b76db9ecac8fb640e50dd78e2\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_wallet_trans\` ADD CONSTRAINT \`FK_3bb8696fa9e509705b5913976ee\` FOREIGN KEY (\`fk_budgoose_wallet_id\`) REFERENCES \`budgoose_wallet\`(\`budgoose_wallet_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_wallet_trans\` ADD CONSTRAINT \`FK_cb68287fc8d9c6a87e3e84f5f7c\` FOREIGN KEY (\`fk_budgoose_management_id\`) REFERENCES \`budgoose_management\`(\`budgoose_management_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_management\` ADD CONSTRAINT \`FK_802e1c5423b9559c4031c5b6464\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_management\` ADD CONSTRAINT \`FK_4cbcabadbf2cf2fb513a7320f50\` FOREIGN KEY (\`fk_budgoose_wallet_id\`) REFERENCES \`budgoose_wallet\`(\`budgoose_wallet_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_management\` ADD CONSTRAINT \`FK_f9e73d6089a6c7b1ffea2b551f4\` FOREIGN KEY (\`fk_budgoose_wallet_target_id\`) REFERENCES \`budgoose_wallet\`(\`budgoose_wallet_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_trans\` ADD CONSTRAINT \`FK_9cc207db42db8a4e2f560277f68\` FOREIGN KEY (\`fk_budgoose_loan_holder_id\`) REFERENCES \`budgoose_loan_holder\`(\`budgoose_loan_holder_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_trans\` ADD CONSTRAINT \`FK_2ad6d1e90c664aeb75aef84e36f\` FOREIGN KEY (\`fk_budgoose_management_id\`) REFERENCES \`budgoose_management\`(\`budgoose_management_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_holder\` ADD CONSTRAINT \`FK_b3aa1b57b738ba0995852a4b20e\` FOREIGN KEY (\`fk_user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_d2f5e343630bd8b7e1e7534e82e\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_6bfae5ab9f39212d5b6ad0276b1\` FOREIGN KEY (\`updated_by\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_4d50fa60ae08828ab681c7d4d7e\` FOREIGN KEY (\`fk_diary_info_id\`) REFERENCES \`diary_info\`(\`diary_info_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_7346513323d8d0dfe6668e54820\` FOREIGN KEY (\`fk_budgoose_info_id\`) REFERENCES \`budgoose_info\`(\`budgoose_info_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` ADD CONSTRAINT \`FK_560f58ddfdb678adc3f09d96f41\` FOREIGN KEY (\`fk_budgoose_wallet_id\`) REFERENCES \`budgoose_wallet\`(\`budgoose_wallet_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` ADD CONSTRAINT \`FK_237ccb87e30f87137b5fda154f9\` FOREIGN KEY (\`fk_budgoose_management_id\`) REFERENCES \`budgoose_management\`(\`budgoose_management_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` DROP FOREIGN KEY \`FK_237ccb87e30f87137b5fda154f9\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_management_loan\` DROP FOREIGN KEY \`FK_560f58ddfdb678adc3f09d96f41\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_7346513323d8d0dfe6668e54820\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_4d50fa60ae08828ab681c7d4d7e\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_6bfae5ab9f39212d5b6ad0276b1\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_d2f5e343630bd8b7e1e7534e82e\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_holder\` DROP FOREIGN KEY \`FK_b3aa1b57b738ba0995852a4b20e\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_trans\` DROP FOREIGN KEY \`FK_2ad6d1e90c664aeb75aef84e36f\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_trans\` DROP FOREIGN KEY \`FK_9cc207db42db8a4e2f560277f68\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_management\` DROP FOREIGN KEY \`FK_f9e73d6089a6c7b1ffea2b551f4\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_management\` DROP FOREIGN KEY \`FK_4cbcabadbf2cf2fb513a7320f50\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_management\` DROP FOREIGN KEY \`FK_802e1c5423b9559c4031c5b6464\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_wallet_trans\` DROP FOREIGN KEY \`FK_cb68287fc8d9c6a87e3e84f5f7c\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_wallet_trans\` DROP FOREIGN KEY \`FK_3bb8696fa9e509705b5913976ee\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_wallet\` DROP FOREIGN KEY \`FK_f9b76db9ecac8fb640e50dd78e2\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_history\` DROP FOREIGN KEY \`FK_f7e6cd4837dbb8064c186742fa0\``);
        await queryRunner.query(`ALTER TABLE \`budgoose_info\` DROP FOREIGN KEY \`FK_c6d14ce20ca1d54d1ca62023920\``);
        await queryRunner.query(`ALTER TABLE \`diary_entity\` DROP FOREIGN KEY \`FK_1991f0f6ec448365fbf35cd5997\``);
        await queryRunner.query(`ALTER TABLE \`diary_entity\` DROP FOREIGN KEY \`FK_b49abeb7cdc2e38f2607d8defc1\``);
        await queryRunner.query(`ALTER TABLE \`diary_entity\` DROP FOREIGN KEY \`FK_ccc6f7dff1f2314591b6522a760\``);
        await queryRunner.query(`ALTER TABLE \`diary_key\` DROP FOREIGN KEY \`FK_25a3bd53c114fec3dba5d714ff3\``);
        await queryRunner.query(`ALTER TABLE \`diary_info\` DROP FOREIGN KEY \`FK_e0850b37061ce978958ea7f4831\``);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` DROP FOREIGN KEY \`FK_facfc36ccdd78ceac2cb4f7c8a2\``);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` DROP FOREIGN KEY \`FK_18fbb5c789d47fc75f8eca19b26\``);
        await queryRunner.query(`ALTER TABLE \`user_login_logger\` DROP FOREIGN KEY \`FK_8660352740a16363bc1cc323f5c\``);
        await queryRunner.query(`ALTER TABLE \`user_login_logger\` DROP FOREIGN KEY \`FK_b202080d0253515dc2238bf93d2\``);
        await queryRunner.query(`DROP TABLE \`budgoose_management_loan\``);
        await queryRunner.query(`DROP INDEX \`REL_7346513323d8d0dfe6668e5482\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`REL_4d50fa60ae08828ab681c7d4d7\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`budgoose_loan_holder\``);
        await queryRunner.query(`DROP TABLE \`budgoose_loan_trans\``);
        await queryRunner.query(`DROP TABLE \`budgoose_management\``);
        await queryRunner.query(`DROP TABLE \`budgoose_wallet_trans\``);
        await queryRunner.query(`DROP TABLE \`budgoose_wallet\``);
        await queryRunner.query(`DROP TABLE \`budgoose_history\``);
        await queryRunner.query(`DROP INDEX \`REL_c6d14ce20ca1d54d1ca6202392\` ON \`budgoose_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_79e8421d29aa05937bd24ad0bb\` ON \`budgoose_info\``);
        await queryRunner.query(`DROP TABLE \`budgoose_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_b8ad5b9bea266c74d190a816f3\` ON \`diary_entity\``);
        await queryRunner.query(`DROP TABLE \`diary_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_7bbf467ca1cec9bda6c7105b76\` ON \`diary_key\``);
        await queryRunner.query(`DROP TABLE \`diary_key\``);
        await queryRunner.query(`DROP INDEX \`REL_e0850b37061ce978958ea7f483\` ON \`diary_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_56904a73fbf3b5d57c1880a7f7\` ON \`diary_info\``);
        await queryRunner.query(`DROP TABLE \`diary_info\``);
        await queryRunner.query(`DROP TABLE \`user_refresh_token\``);
        await queryRunner.query(`DROP TABLE \`user_login_logger\``);
    }

}
