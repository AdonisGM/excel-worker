import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'node:fs';
import * as Excel from 'exceljs';
import {
  ConfigRange,
  ConfigRangeTable,
  ConfigSheet,
  ConfigWorkbook,
  DataRow,
  DataTable,
  DataTableLevel,
  DataValue,
} from './export.type';

@Injectable()
export class ExportService {
  constructor(private readonly logger: LoggerService) {}

  // Process export
  public async processExport(
    fileCode: string,
    data: DataValue[],
  ): Promise<string | void> {
    const startTime = { startTime: performance.now() };
    this.logger.log(`-------- Start export --------`);
    this.logger.log(`Processing export for file code: ${fileCode}`);
    this.logger.log(`Line date: ${data.length}`);

    const workbook = await this.readFileTemplate(fileCode);
    this.logger.log(
      `\t(1)  Read file template => Done ${this.logTime(startTime)}`,
    );

    // Get config file
    const configWorkbook = this.getConfigWorkbook(workbook);
    this.logger.log(
      `\t(2)  Get config data => Done ${this.logTime(startTime)}`,
    );

    // Get general data
    let generalData: DataValue | undefined = undefined;
    if (configWorkbook.isHasGeneralData) {
      generalData = data.shift();
    }
    this.logger.log(
      `\t(3)  Get general data => Done ${this.logTime(startTime)}`,
    );

    // Process data each sheet
    for (const [index, configSheet] of configWorkbook.sheet.entries()) {
      const processData = this.processData(configSheet, data);
      this.logger.log(
        `\t(4.sheet_${index + 1})  Process data => Done ${this.logTime(startTime)}`,
      );
    }

    this.logger.log(`-------- End export --------`);
    return '';
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
              const columnsValue =
                row.getCell(4).text.length === 0
                  ? []
                  : row.getCell(4).text.split(',');
              const tableValue = row.getCell(5).text;

              let configRangeTable: ConfigRangeTable | undefined;

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
                children: [],
              };

              const configRanges: ConfigRange[] = sheetConfig.ranges;
              this.getConfigWorkbookRecursive(configRanges, newRangeConfig, 0);
              // sheetConfig.ranges.push(newRangeConfig);
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

  // Process with tree structure
  private getConfigWorkbookRecursive(
    configRanges: ConfigRange[],
    configRange: ConfigRange,
    level: number,
  ): void {
    // Check if configRange is not empty
    if (configRanges.length === 0) {
      configRanges.push(configRange);
      return;
    }

    // Check no equal with level
    if (configRange.no === level) {
      configRanges.push(configRange);
      return;
    }

    // Check no not equal with level
    if (configRange.no !== level) {
      const lastConfigRange = configRanges[configRanges.length - 1];
      const children = lastConfigRange.children;
      if (!children) {
        lastConfigRange.children = [];
      }
      this.getConfigWorkbookRecursive(
        lastConfigRange.children,
        configRange,
        level + 1,
      );
    }
  }

  // Process data
  private processData(
    configSheet: ConfigSheet,
    data: DataValue[],
  ): DataTableLevel | void {
    // Init data
    const dataTableLevel: DataTableLevel = {
      level: 0,
      dataTables: [],
      setDataTable: new Set<string>(),
    };

    // Loop all data
    for (const dataItem of data) {
      this.processDataRecursive(
        dataTableLevel,
        0,
        configSheet.ranges,
        dataItem,
      );
    }

    return dataTableLevel;
  }

  // Process data with tree structure
  private processDataRecursive(
    dataLevelTable: DataTableLevel,
    level: number,
    configRange: ConfigRange[],
    dataItem: DataValue,
  ): void {
    // Check data level table has multiple table config
    const configRangeTable = configRange[0].table;
    if (configRangeTable) {
      const tableColumn = configRangeTable.column;

      const dataKey = String(dataItem[tableColumn]);
      const isHasDataKey = dataLevelTable.setDataTable.has(dataKey);

      // Check data key is existing
      let selectedDataTable: DataTable | undefined;
      if (isHasDataKey) {
        selectedDataTable = dataLevelTable.dataTables.find(
          (e) => e.key === dataKey,
        )!;
      } else {
        // Create new data table
        selectedDataTable = {
          key: dataKey,
          setData: new Set<string>(),
          data: [],
        };

        // Add new data table to data level table
        dataLevelTable.dataTables.push(selectedDataTable);
        dataLevelTable.setDataTable.add(dataKey);
      }

      // Get config range table
      const selectedConfigRange = configRange.find(
        (e) => e.table?.data === dataKey,
      )!;

      const childDataLevelTable: DataTableLevel = {
        level: level + 1,
        dataTables: [],
        setDataTable: new Set<string>(),
      };

      // Create new data row
      const newDataRow: DataRow = {
        data: dataItem,
        dataLevelTable: childDataLevelTable,
      };

      // Process deep level
      if (selectedConfigRange.columns.length === 0) {
        // Add new data row to data table
        selectedDataTable.data.push(newDataRow);
      } else {
        // Generate key for data row
        const dataRowKey = selectedConfigRange.columns
          .map((column) => String(dataItem[column]))
          .join('--|--');

        if (!selectedDataTable.setData.has(dataRowKey)) {
          selectedDataTable.setData.add(dataRowKey);

          selectedDataTable.data.push(newDataRow);
        }

        const childConfigRange = selectedConfigRange.children;
        this.processDataRecursive(
          newDataRow.dataLevelTable!,
          level + 1,
          childConfigRange,
          dataItem,
        );
      }
    } else {
      // If you don't have table config => Only one range config
      const selectedConfigRange = configRange[0];
      const columns = selectedConfigRange.columns;

      // leaf node
      if (columns.length === 0) {
        let selectedDataTable: DataTable | undefined;

        if (dataLevelTable.dataTables.length === 0) {
          // Create new data table
          selectedDataTable = {
            key: 'default',
            setData: new Set<string>(),
            data: [],
          };

          // Create new data row
          const newDataRow: DataRow = {
            data: dataItem,
            dataLevelTable: {
              level: level + 1,
              dataTables: [],
              setDataTable: new Set<string>(),
            },
          };

          selectedDataTable.data.push(newDataRow);
          dataLevelTable.dataTables.push(selectedDataTable);
        } else {
          // Check data key is existing
          selectedDataTable = dataLevelTable.dataTables[0];

          // Create new data row
          const newDataRow: DataRow = {
            data: dataItem,
            dataLevelTable: {
              level: level + 1,
              dataTables: [],
              setDataTable: new Set<string>(),
            },
          };

          // Add new data row to data table
          selectedDataTable.data.push(newDataRow);
        }
      } else {
        // Generate key for data row
        const dataRowKey = selectedConfigRange.columns
          .map((column) => String(dataItem[column]))
          .join('--|--');

        if (selectedConfigRange.columns.length === 0) {
          // Create new DataTable
          const newDataTable: DataTable = {
            key: dataRowKey,
            setData: new Set<string>(),
            data: [],
          };

          // Create new data row
          const newDataRow: DataRow = {
            data: dataItem,
            dataLevelTable: {
              level: level + 1,
              dataTables: [],
              setDataTable: new Set<string>(),
            },
          };

          newDataTable.data.push(newDataRow);
          dataLevelTable.dataTables.push(newDataTable);
        } else {
          // Check data key is existing
          const selectedDataTable = dataLevelTable.dataTables[0];

          if (!selectedDataTable) {
            // Create new data table
            const newDataTable: DataTable = {
              key: dataRowKey,
              setData: new Set<string>(),
              data: [],
            };

            // Create new data row
            const newDataRow: DataRow = {
              data: dataItem,
              dataLevelTable: {
                level: level + 1,
                dataTables: [],
                setDataTable: new Set<string>(),
              },
            };

            newDataTable.data.push(newDataRow);
            newDataTable.setData.add(dataRowKey);
            dataLevelTable.dataTables.push(newDataTable);
          } else {
            const selectedDataTable = dataLevelTable.dataTables[0];

            if (!selectedDataTable.setData.has(dataRowKey)) {
              selectedDataTable.setData.add(dataRowKey);

              // Create new data row
              const newDataRow: DataRow = {
                data: dataItem,
                dataLevelTable: {
                  level: level + 1,
                  dataTables: [],
                  setDataTable: new Set<string>(),
                },
              };

              // Add new data row to data table
              selectedDataTable.data.push(newDataRow);
            }
          }
        }

        // Process deep level
        const selectedDataTable = dataLevelTable.dataTables[0];
        const childConfigRange = selectedConfigRange.children;
        if (childConfigRange.length > 0) {
          this.processDataRecursive(
            selectedDataTable.data[0].dataLevelTable!,
            level + 1,
            childConfigRange,
            dataItem,
          );
        }
      }
    }
  }

  private logTime(time: { startTime: number }): string {
    const currentTime = performance.now();

    const timeDiff = currentTime - time.startTime;
    time.startTime = currentTime;

    // Format time to "1,000.256ms"
    const formattedTime = timeDiff.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    return `${formattedTime}ms`;
  }
}
