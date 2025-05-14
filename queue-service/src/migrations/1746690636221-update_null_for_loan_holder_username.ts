import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNullForLoanHolderUsername1746690636221 implements MigrationInterface {
    name = 'UpdateNullForLoanHolderUsername1746690636221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_holder\` CHANGE \`holder_username\` \`holder_username\` varchar(50) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budgoose_loan_holder\` CHANGE \`holder_username\` \`holder_username\` varchar(50) NOT NULL`);
    }

}
