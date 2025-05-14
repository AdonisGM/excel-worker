import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'node:fs';
import * as Excel from 'exceljs';
import {
  ConfigRange,
  ConfigRangeTable,
  ConfigSheet,
  ConfigWorkbook,
} from './export.type';

@Injectable()
export class ExportService {
  constructor(private readonly logger: LoggerService) {}

  // Process export
  public async processExport(
    fileCode: string,
    data: any[],
  ): Promise<string | void> {
    try {
      this.logger.log(`-------- Start export --------`);
      this.logger.log(`Processing export for file code: ${fileCode}`);

      const workbook = await this.readFileTemplate(fileCode);
      this.logger.log(`\t(1)  this.readFileTemplate => Done`);

      // Get config file
      const configFile = this.getConfigWorkbook(workbook);
      this.logger.log(`\t(2)  this.getConfigWorkbook => Done`);

      // Get config file
      const processData = this.processData(configFile, data);
      this.logger.log(`\t(3)  this.processData => Done`);

      this.logger.log(`-------- End export --------`);
      return '';
    } catch (e) {
      const typedError = e as Error;
      this.logger.error(`Error processing export: ${typedError.message}`);
      throw new Error(`Error processing export: ${typedError.message}`);
    }
  }

  // Read file template
  private async readFileTemplate(fileCode: string): Promise<Excel.Workbook> {
    let workbook: Excel.Workbook;

    try {
      const filePath = `templates/${fileCode}.xlsx`;
      const fileStream = fs.createReadStream(filePath);

      workbook = await new Excel.Workbook().xlsx.read(fileStream);
    } catch (error) {
      const typedError = error as Error;
      this.logger.error(
        `Error function 'readFileTemplate': ${typedError.message}`,
      );
      throw new Error(`Error reading file template: ${typedError.message}`);
    }

    return workbook;
  }

  // Get config file
  private getConfigWorkbook(workbook: Excel.Workbook): ConfigWorkbook {
    const configWorkbook: ConfigWorkbook = {
      isHasGeneralData: false,
      isMergeCell: false,
      isMultipleSheet: false,
      sheet: [],
    };

    let sheetConfig: ConfigSheet | undefined = undefined;

    const configSheet = workbook.getWorksheet('config');
    if (!configSheet) {
      this.logger.error(`No config found in file!`);
      throw new Error('No config found in file!');
    }

    let isGetGeneralConfig: boolean = false;

    configSheet.eachRow({ includeEmpty: true }, (row: Excel.Row) => {
      // Get general config
      if (!isGetGeneralConfig) {
        if (!row.hasValues) {
          isGetGeneralConfig = true;
        }

        if (row.hasValues) {
          // get first cell - name general config
          const firstCell = row.getCell(1);
          // get second cell - value general config
          const secondCell = row.getCell(2);

          switch (firstCell.text) {
            case 'isHasGeneralData':
              configWorkbook.isHasGeneralData = Boolean(
                secondCell.text === '1',
              );
              break;
            case 'isMergeCell':
              configWorkbook.isMergeCell = Boolean(secondCell.text === '1');
              break;
            case 'isMultipleSheet':
              configWorkbook.isMultipleSheet = Boolean(secondCell.text === '1');
              break;
          }
        }
      }

      // Get sheet config
      if (isGetGeneralConfig) {
        if (row.hasValues) {
          // get first cell - name config
          const firstCell = row.getCell(1);

          // Check create new sheet config
          if (firstCell.text.includes('sheet_') || firstCell.text === '') {
            if (sheetConfig) {
              configWorkbook.sheet.push(sheetConfig);
            }

            let indexSheet: number = 0;
            if (firstCell.text !== '') {
              indexSheet = Number(firstCell.text.split('_')[1]);
            }

            sheetConfig = {
              no: indexSheet,
              ranges: [],
            };
          }

          // Check create new range config
          if (sheetConfig) {
            if (firstCell.text.includes('range_')) {
              const indexRange = Number(firstCell.text.split('_')[1]);
              const beginCellValue = row.getCell(2).text;
              const endCellValue = row.getCell(3).text;
              const columnsValue = row.getCell(4).text.split(',');
              const tableValue = row.getCell(5).text;

              let configRangeTable: ConfigRangeTable | undefined = undefined;

              if (tableValue.trim() !== '') {
                const tableColumn = tableValue.split('|')[0];
                const tableData = tableValue.split('|')[1];
                configRangeTable = {
                  column: tableColumn,
                  data: tableData,
                };
              }

              const newRangeConfig: ConfigRange = {
                no: indexRange,
                beginCell: beginCellValue,
                endCell: endCellValue,
                columns: columnsValue,
                table: configRangeTable,
              };

              sheetConfig.ranges.push(newRangeConfig);
            }
          }
        }
      }
    });

    if (sheetConfig) {
      configWorkbook.sheet.push(sheetConfig);
    }

    return configWorkbook;
  }

  // Process data
  private processData(configWorkbook: ConfigWorkbook, data: any[]): any {}
}
