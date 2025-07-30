// Author: AdonisGM - Nguyen Manh Tung
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'node:fs';
import * as Excel from 'exceljs';
import {
  CMergeCell,
  ConfigRange,
  ConfigRangeTable,
  ConfigSheet,
  ConfigWorkbook,
  DataRow,
  DataTable,
  DataTableLevel,
  DataValue,
} from './export.type';
import { UtilService } from '../util/util.service';

@Injectable()
export class ExportService {
  private readonly LIMIT_INSERT_EMPTY_ROW: number = 100000;

  /**
   * Constructor for ExportService
   * @param logger
   * @param utilService
   */
  constructor(
    private readonly logger: LoggerService,
    private readonly utilService: UtilService,
  ) {}

  /**
   * Process export data to Excel file.
   * Run asynchronously to ensure all steps are completed before returning the file path.
   *
   * @param { string } referId - The reference ID for the export process, used for logging and tracking.
   * @param { string } fileCode - The code of the file template to use for export.
   * @param { DataValue[][] } data - The data to export, structured as an array of arrays of DataValue objects.
   *
   * @return { Promise<string | void> } - A promise that resolves to the file path of the exported Excel file.
   */
  public async processExport(
    referId: string,
    fileCode: string,
    data: DataValue[][],
  ): Promise<string | void> {
    const startTime = { startTime: performance.now() };
    const beginTime = performance.now();

    this.logger.log(`-------- Start export --------`);
    this.logger.log(
      `\tProcessing export for file code: ${fileCode} - ${referId}`,
    );
    this.logger.log(
      `\tLine data: ${data.map((e) => e.length).reduce((a, b) => a + b)}`,
    );
    this.logger.log(
      `\tSize: ${(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(2)}KB`,
    );
    this.logger.log(`\tStart time: ${new Date().toLocaleString()}`);

    const workbook = (await this.readFileTemplate(
      fileCode,
    )) as Excel.Workbook | null;
    if (!workbook) {
      this.logger.error(`Error reading file template`);
      throw new Error('Error reading file template');
    }
    this.logStep(`(1)  Read file template`, this.logTime(startTime));

    // Get config file
    const configWorkbook = this.getConfigWorkbook(workbook);
    this.logStep(`(2)  Get config data`, this.logTime(startTime));

    // Process data each sheet
    for (const [index, configSheet] of configWorkbook.sheet.entries()) {
      this.logStep(
        `(3)  Process sheet index - ${index + 1}`,
        this.logTime(startTime),
      );
      // Get general data
      let generalData: DataValue | undefined = undefined;
      if (configWorkbook.isHasGeneralData) {
        generalData = data[index].shift();
      }
      this.logStep(`(3.1)  Get general data`, this.logTime(startTime));

      // Process main data
      const processData = this.processData(configSheet, data[index]);
      this.logStep(`(3.2)  Process data`, this.logTime(startTime));

      // Get worksheet
      const worksheet = workbook.worksheets[index];
      const fileSheetTemplate = `${worksheet.name}-template`;
      const worksheetTemplate = workbook.getWorksheet(fileSheetTemplate);
      if (!worksheetTemplate) {
        this.logger.error(
          `Error: No template found for sheet ${worksheet.name}`,
        );
        throw new Error(`No template found for sheet ${worksheet.name}`);
      }

      // Get list merge cells in sheet
      const mergeCells = this.getListMergeCells(worksheetTemplate);
      this.logStep(`(3.3)  Get list merge cells`, this.logTime(startTime));

      // Calculate total table height
      const totalTableHeight = this.calculateTotalTableHeight(
        worksheetTemplate,
        configSheet.ranges,
        undefined,
        processData,
      );
      this.logStep(
        `(3.4)  Calculate total table height`,
        this.logTime(startTime),
      );

      // Insert empty rows
      this.insertEmptyRows(worksheet, totalTableHeight, configSheet);
      this.logStep(`(3.5)  Insert empty rows`, this.logTime(startTime));

      // Generate file excel - general data
      if (generalData) {
        this.generateExcelFileGeneral(worksheet, generalData);
      }
      this.logStep(`(3.6)  Generate general excel`, this.logTime(startTime));

      // Generate file excel - main data
      this.generateExcelFile(
        worksheet,
        worksheetTemplate,
        processData,
        configSheet,
        totalTableHeight,
        mergeCells,
      );
      this.logStep(`(3.7)  Generate main excel`, this.logTime(startTime));

      // Generate file excel - main data
      this.removeTemplateSheet(workbook, worksheetTemplate);
      this.logStep(`(3.8)  Remove template sheet`, this.logTime(startTime));
    }

    // Remove sheet config
    this.removeSheetConfig(workbook);
    this.logStep(`(4)  Remove sheet config`, this.logTime(startTime));

    // Save file
    const filePath = `results/${fileCode}_${this.utilService.generateUUIDv7()}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer({
      useSharedStrings: false,
    });
    fs.writeFileSync(filePath, Buffer.from(buffer));
    this.logStep(`(5)  Save file`, this.logTime(startTime));

    this.logger.log(`\tResult => Path file: ${filePath}`);
    this.logger.log(
      `\tResult => Total time: ${(performance.now() - beginTime).toFixed(3)} ms`,
    );

    this.logger.log(`-------- End export --------`);
    return filePath;
  }

  /**
   * Read file template from the specified file code.
   * This method reads an Excel file from the 'templates' directory.
   * @param {string} fileCode - The code of the file template to read.
   * @return {Promise<Excel.Workbook>} - A promise that resolves to an Excel workbook object.
   * @private
   */
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

  /**
   * Read config for export algorithm from the 'config' worksheet.
   *
   * @param {Excel.Workbook} workbook - The Excel workbook object.
   * @return {ConfigWorkbook} - The configuration object containing general settings and sheet configurations.
   * @private
   */
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
              } else {
                configRangeTable = {
                  column: undefined,
                  data: undefined,
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

  /**
   * Using when process config file excel has tree structure.
   *
   * @param {ConfigRange[]} configRanges - The list of config ranges to add the new config range to.
   * @param {ConfigRange} configRange - The new config range to add.
   * @param {number} level - The current level in the tree structure.
   * @private
   */
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

  /**
   * Process data from array to tree structure.
   *
   * @param {ConfigSheet} configSheet - The configuration for the sheet.
   * @param {DataValue[]} data - The data to process, structured as an array of DataValue objects.   *
   * @return {DataTableLevel} - The processed data structured as a DataTableLevel object.
   * @private
   */
  private processData(
    configSheet: ConfigSheet,
    data: DataValue[],
  ): DataTableLevel {
    // Init data
    const dataTableLevel: DataTableLevel = {
      level: 0,
      dataTables: [],
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

  /**
   * Process data recursively to build a tree structure.
   *
   * @param {DataTableLevel} dataLevelTable - The current level of data table being processed.
   * @param {number} level - The current level in the tree structure.
   * @param {ConfigRange[]} configRanges - The configuration ranges for the current level.
   * @param {DataValue} dataItem - The current data item being processed.
   * @private
   */
  private processDataRecursive(
    dataLevelTable: DataTableLevel,
    level: number,
    configRanges: ConfigRange[],
    dataItem: DataValue,
  ): void {
    // check range has index table excel
    const configRange = configRanges[0];
    if (configRange.table.column) {
      const column = configRange.table.column;
      const columnData = dataItem[column];
      const dataTableKey = configRanges.find(
        (e) => e.table.data === columnData,
      )!.table.data;

      // Find dataTable with same dataTableKey
      let selectedDataTable = dataLevelTable.dataTables.find((e) => {
        return e.key === dataTableKey;
      });

      // if not exist dataTable => create new
      if (!selectedDataTable) {
        selectedDataTable = {
          key: dataTableKey,
          setData: new Set<string>(),
          data: [],
        } as DataTable;

        dataLevelTable.dataTables.push(selectedDataTable);
      }

      // Find current range config
      const selectedConfigRange = configRanges.find((e) => {
        return e.table.data === dataTableKey;
      })!;

      const columns = selectedConfigRange.columns;

      // Check and process with no group column => leaf data
      if (columns.length === 0) {
        const newDataRow = {
          dataLevelTable: {
            level: level,
            dataTables: [],
          },
          key: undefined,
          data: dataItem,
        } as DataRow;

        selectedDataTable.data.push(newDataRow);
      } else {
        // get key from itemData and currentRangeConfig
        const keyDataRow = columns
          .map((e) => String(dataItem[e]))
          .join('--|--');

        if (!selectedDataTable.setData.has(keyDataRow)) {
          selectedDataTable.setData.add(keyDataRow);

          // Create new rowData
          const newDataRow = {
            dataLevelTable: {
              level: level,
              dataTables: [],
            },
            key: keyDataRow,
            data: dataItem,
          } as DataRow;

          selectedDataTable.data.push(newDataRow);
        }

        // prepare param for recursive call
        const rLevelDataTable = selectedDataTable.data.find(
          (e) => e.key === keyDataRow,
        )!.dataLevelTable;

        // recursive call
        this.processDataRecursive(
          rLevelDataTable,
          level + 1,
          selectedConfigRange.children,
          dataItem,
        );
      }
    } else {
      // if current range config don't had index table excel => have only once element in ArrayList
      const columns = configRanges[0].columns;

      // Check and process with no group column => leaf data
      if (columns.length === 0) {
        const dataTables = dataLevelTable.dataTables;

        // check if empty list, add new data table
        if (dataTables.length === 0) {
          const newDataTable = {
            key: 'dataTable_0',
            setData: new Set<string>(),
            data: [],
          } as DataTable;
          const newDataRow = {
            dataLevelTable: {
              level: level,
              dataTables: [],
            },
            key: undefined,
            data: dataItem,
          } as DataRow;

          newDataTable.data.push(newDataRow);

          dataLevelTable.dataTables.push(newDataTable);
        } else {
          // get exist data table and add new row data
          const selectedDataTable = dataTables[0];

          const newDataRow = {
            dataLevelTable: {
              level: level,
              dataTables: [],
            },
            key: undefined,
            data: dataItem,
          } as DataRow;

          selectedDataTable.data.push(newDataRow);
        }
      } else {
        const dataTables = dataLevelTable.dataTables;

        // get key from itemData and currentRangeConfig
        const keyDataRow = columns
          .map((e) => String(dataItem[e]))
          .join('--|--');

        // check if empty list, add new data table
        if (dataTables.length === 0) {
          const newDataTable = {
            key: 'dataTable_0',
            setData: new Set<string>(),
            data: [],
          } as DataTable;
          const newDataRow = {
            dataLevelTable: {
              level: level,
              dataTables: [],
            },
            key: keyDataRow,
            data: dataItem,
          } as DataRow;

          newDataTable.data.push(newDataRow);
          newDataTable.setData.add(keyDataRow);

          dataLevelTable.dataTables.push(newDataTable);
        } else {
          // get exist data table and add new row data
          const selectedDataTable = dataTables[0];

          if (!selectedDataTable.setData.has(keyDataRow)) {
            selectedDataTable.setData.add(keyDataRow);

            const newDataRow = {
              dataLevelTable: {
                level: level,
                dataTables: [],
              },
              key: keyDataRow,
              data: dataItem,
            } as DataRow;

            selectedDataTable.data.push(newDataRow);
          }
        }

        // prepare param for recursive call
        const rLevelDataTable = dataTables[0].data.find(
          (e) => e.key === keyDataRow,
        )!.dataLevelTable;

        // recursive call
        this.processDataRecursive(
          rLevelDataTable,
          level + 1,
          configRanges[0].children,
          dataItem,
        );
      }
    }
  }

  /**
   * Find all cell in worksheet and replace single text with data.
   *
   * @param {Excel.Worksheet} worksheet - The worksheet to process.
   * @param {DataValue} generalData - The data to replace in the worksheet.
   * @private
   */
  private generateExcelFileGeneral(
    worksheet: Excel.Worksheet,
    generalData: DataValue,
  ): void {
    const rowCount = worksheet.rowCount;

    // Loop through each cell in the row
    for (let i = 1; i <= rowCount; i++) {
      const selectedRow = worksheet.getRow(i);
      const cellNumber = selectedRow.cellCount;

      for (let j = 1; j <= cellNumber; j++) {
        const selectedCell = selectedRow.getCell(j);

        // Generate data
        this.replaceText(selectedCell, generalData, 'general');
      }
    }
  }

  /**
   * Generate Excel file based on the provided worksheet, template, and data.
   *
   * @param {Excel.Worksheet} worksheet - The worksheet to generate the Excel file in.
   * @param {Excel.Worksheet} worksheetTemplate - The template worksheet to copy from.
   * @param {DataTableLevel} processData - The processed data to fill in the worksheet.
   * @param {ConfigSheet} configSheet - The configuration for the sheet.
   * @param {number} totalTableHeight - The total height of the table generated before this step.
   * @param {Map<string, CMergeCell>} mergeCells - A map of merge cells to apply in the worksheet.
   * @private
   */
  private generateExcelFile(
    worksheet: Excel.Worksheet,
    worksheetTemplate: Excel.Worksheet,
    processData: DataTableLevel,
    configSheet: ConfigSheet,
    totalTableHeight: number,
    mergeCells: Map<string, CMergeCell>,
  ): void {
    if (totalTableHeight <= 0) {
      return;
    }

    const startRow = Number(
      worksheet.getCell(configSheet.ranges[0].beginCell).row,
    );

    this.generateExcelFileRecursive(
      startRow,
      worksheet,
      worksheetTemplate,
      configSheet.ranges,
      processData.dataTables,
      0,
      mergeCells,
    );
  }

  private generateExcelFileRecursive(
    startRow: number,
    worksheet: Excel.Worksheet,
    worksheetTemplate: Excel.Worksheet,
    configRanges: ConfigRange[],
    dataTables: DataTable[],
    level: number,
    mergeCells: Map<string, CMergeCell>,
  ): number {
    let totalAppendRow = 0;

    // Loop all data tables
    for (const [indexConfigRange, configRange] of configRanges.entries()) {
      let selectedDataTable: DataTable | undefined;
      if (configRange.table.column) {
        // Find data table for this config range
        selectedDataTable = dataTables.find(
          (e) => e.key === configRange.table.data,
        );
      } else {
        selectedDataTable = dataTables[0];
      }

      // Check data table not found
      if (selectedDataTable != null) {
        // loop all rowData in dataTable
        for (const dataRow of selectedDataTable.data) {
          // generate for highest row (leaf)
          if (configRange.children.length === 0) {
            const beginRowTemplate = Number(
              worksheet.getCell(configRange.beginCell).row,
            );
            const endRowTemplate = Number(
              worksheet.getCell(configRange.endCell).row,
            );

            const highRow = endRowTemplate - beginRowTemplate + 1;

            this.copyRows(
              worksheet,
              worksheetTemplate,
              beginRowTemplate,
              endRowTemplate,
              startRow + totalAppendRow,
              mergeCells,
            );

            // Fill data
            this.replaceTextRange(
              worksheet,
              startRow + totalAppendRow,
              startRow + totalAppendRow + highRow,
              dataRow.data,
              'table',
            );

            // Increase start row for next data row
            totalAppendRow += highRow;
          }

          // generate for sub data row (branch)
          if (configRange.children.length !== 0) {
            let beginRowNumber: number | undefined;
            let endRowNumber: number | undefined;

            // generate begin to begin child
            {
              const beginRowTemplate = Number(
                worksheet.getCell(configRange.beginCell).row,
              );
              const beginRowChildTemplate = Number(
                worksheet.getCell(configRange.children[0].beginCell).row,
              );

              const highRow = beginRowChildTemplate - beginRowTemplate;

              beginRowNumber = startRow + totalAppendRow;

              if (highRow > 0) {
                this.copyRows(
                  worksheet,
                  worksheetTemplate,
                  beginRowTemplate,
                  beginRowChildTemplate - 1,
                  startRow + totalAppendRow,
                  mergeCells,
                );

                totalAppendRow += highRow;
              }
            }

            // recursive - generate child row
            {
              const childRowNum = this.generateExcelFileRecursive(
                startRow + totalAppendRow,
                worksheet,
                worksheetTemplate,
                configRange.children,
                dataRow.dataLevelTable.dataTables,
                level + 1,
                mergeCells,
              );

              totalAppendRow += childRowNum;
            }

            // generate end last child to end row
            {
              const endRowTemplate = Number(
                worksheet.getCell(configRange.endCell).row,
              );
              const endRowChildTemplate = Number(
                worksheet.getCell(
                  configRange.children[configRange.children.length - 1].endCell,
                ).row,
              );

              const highRow = endRowTemplate - endRowChildTemplate;

              endRowNumber = startRow + totalAppendRow + highRow;

              if (highRow > 0) {
                this.copyRows(
                  worksheet,
                  worksheetTemplate,
                  endRowChildTemplate + 1,
                  endRowTemplate,
                  startRow + totalAppendRow,
                  mergeCells,
                );

                totalAppendRow += highRow;
              }
            }

            // fill data ...
            if (beginRowNumber && endRowNumber) {
              this.replaceTextRange(
                worksheet,
                beginRowNumber,
                endRowNumber,
                dataRow.data,
                'table',
              );
            }
          }
        }
      }

      // generate space between two datatable - skip last dataTable
      if (indexConfigRange < configRanges.length - 1) {
        const nextRangeConfig = configRanges[indexConfigRange + 1];

        const endRowRangeTemplate = Number(
          worksheet.getCell(configRange.endCell).row,
        );
        const startNextRowRangeTemplate = Number(
          worksheet.getCell(nextRangeConfig.beginCell).row,
        );

        const highRow = startNextRowRangeTemplate - endRowRangeTemplate - 1;

        if (highRow > 0) {
          this.copyRows(
            worksheet,
            worksheetTemplate,
            endRowRangeTemplate + 1,
            startNextRowRangeTemplate - 1,
            startRow + totalAppendRow,
            mergeCells,
          );

          totalAppendRow += highRow;
        }
      }
    }

    return totalAppendRow;
  }

  /**
   * Log time for a specific step in the export process.
   *
   * @param {{startTime: number}} time - An object containing the start time of the step.
   * @private
   */
  private logTime(time: { startTime: number }): string {
    const currentTime = performance.now();

    const timeDiff = currentTime - time.startTime;
    time.startTime = currentTime;

    // Format time to "1,000.256ms"
    const formattedTime = timeDiff.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    return `${formattedTime} ms`;
  }

  /**
   * Replace text in a range of cells in the worksheet.
   *
   * @param {Excel.Worksheet} worksheet - The worksheet to process.
   * @param {number} startRow - The starting row number for the range.
   * @param {number} endRow - The ending row number for the range.
   * @param {DataValue} data - The data to replace in the cells.
   * @param {'general' | 'table' | 'merge'} template - The type of template to use for replacement.
   * @private
   */
  private replaceTextRange(
    worksheet: Excel.Worksheet,
    startRow: number,
    endRow: number,
    data: DataValue,
    template: 'general' | 'table' | 'merge',
  ): void {
    for (let i = startRow; i <= endRow; i++) {
      const selectedRow = worksheet.getRow(i);
      const cellNumber = selectedRow.cellCount;

      for (let j = 1; j <= cellNumber; j++) {
        const selectedCell = selectedRow.getCell(j);

        // Generate data
        this.replaceText(selectedCell, data, template);
      }
    }
  }

  /**
   * Replace text in a single cell based on the provided data and template type.
   *
   * @param {Excel.Cell} cell - The cell to process.
   * @param {DataValue} data - The data to replace in the cell.
   * @param {'general' | 'table' | 'merge'} template - The type of template to use for replacement.
   * @private
   */
  private replaceText(
    cell: Excel.Cell,
    data: DataValue,
    template: 'general' | 'table' | 'merge',
  ): void {
    const cellValue = cell.value;

    // Template string like <#general.NAME>
    if (typeof cellValue === 'string') {
      const regex = new RegExp(`<#${template}.[^>]+>`, 'g');
      const matches = cellValue.match(regex);

      if (matches) {
        for (const match of matches) {
          const key = match.replace(`<#${template}.`, '').replace('>', '');
          const value = data[key];

          if (value !== undefined) {
            cell.value = cellValue.replace(match, String(value));
          }
        }
      }
    }
  }

  /**
   * Remove the config sheet from the workbook. After processing, the config sheet is no longer needed.
   *
   * @param {Excel.Workbook} workbook - The workbook to remove.
   * @private
   */
  private removeSheetConfig(workbook: Excel.Workbook): void {
    workbook.removeWorksheet('config');
  }

  /**
   * Calculate the total height of the table based on the configuration ranges and data.
   * Using for insert empty rows before process file.
   *
   * @param {Excel.Worksheet} worksheet - The worksheet to calculate the height for.
   * @param {ConfigRange[]} configRanges - The configuration ranges for the table.
   * @param {ConfigRange | undefined} parentConfigRange - The parent configuration range, if any.
   * @param {DataTableLevel} dataTableLevel - The data table level containing the data.
   * @return {number} - The total height of the table in rows.
   * @private
   */
  private calculateTotalTableHeight(
    worksheet: Excel.Worksheet,
    configRanges: ConfigRange[],
    parentConfigRange: ConfigRange | undefined,
    dataTableLevel: DataTableLevel,
  ): number {
    let heightToTopParent = 0;
    let heightToBottomParent = 0;
    // Check has parent config range for calc height to parent
    if (parentConfigRange) {
      // Calculate height of parent top
      const parentFirstRow = Number(
        worksheet.getCell(parentConfigRange.beginCell).row,
      );
      const childFirstRow = Number(
        worksheet.getCell(configRanges[0].beginCell).row,
      );
      heightToTopParent = childFirstRow - parentFirstRow;

      // Calculate height of parent bottom
      const parentLastRow = Number(
        worksheet.getCell(parentConfigRange.endCell).row,
      );
      const childLastRow = Number(
        worksheet.getCell(configRanges[configRanges.length - 1].endCell).row,
      );
      heightToBottomParent = parentLastRow - childLastRow;
    }

    let totalHeightBetweenDataTable = 0;
    // Check space between each data table - skip last data table
    for (let i = 0; i < configRanges.length - 1; i++) {
      const currentConfigRange = configRanges[i];
      const nextConfigRange = configRanges[i + 1];

      const lastRowCurrentDataTable = Number(
        worksheet.getCell(currentConfigRange.endCell).row,
      );
      const firstRowNextDataTable = Number(
        worksheet.getCell(nextConfigRange.beginCell).row,
      );

      totalHeightBetweenDataTable +=
        firstRowNextDataTable - lastRowCurrentDataTable - 1;
    }

    let heightTotalChildClaimed = 0;
    // Calculate height of child claimed
    for (const configRange of configRanges) {
      const keyDateRange = configRange.table.data;
      let selectedDataTable: DataTable | undefined;

      // If key data is null => only one dataTable
      if (!keyDateRange) {
        selectedDataTable = dataTableLevel.dataTables[0];
      } else {
        selectedDataTable = dataTableLevel.dataTables.find((e) => {
          return e.key === keyDateRange;
        });
      }

      // If can't find dataTable => skip
      if (!selectedDataTable) {
        continue;
      }

      const dataRows = selectedDataTable.data;
      for (const dataRow of dataRows) {
        // Check has child range
        if (configRange.children.length === 0) {
          const firstConfigRow = Number(
            worksheet.getCell(configRange.beginCell).row,
          );
          const lastConfigRow = Number(
            worksheet.getCell(configRange.endCell).row,
          );
          const heightChild = lastConfigRow - firstConfigRow + 1;
          heightTotalChildClaimed += heightChild;
        } else {
          // Check has child range
          const childConfigRange = configRange.children;
          const childDataTableLevel = dataRow.dataLevelTable;

          if (childDataTableLevel) {
            const childHeight = this.calculateTotalTableHeight(
              worksheet,
              childConfigRange,
              configRange,
              childDataTableLevel,
            );
            heightTotalChildClaimed += childHeight;
          }
        }
      }
    }

    // Calculate total height
    return (
      heightToTopParent +
      heightToBottomParent +
      totalHeightBetweenDataTable +
      heightTotalChildClaimed
    );
  }

  /**
   * Copy a row from the template worksheet to the target worksheet.
   *
   * @param {Excel.Worksheet} worksheet - The target worksheet where the row will be copied.
   * @param {Excel.Worksheet} worksheetTemplate - The template worksheet from which the row will be copied.
   * @param {number} sourceRowNumber - The row number in the template worksheet to copy from.
   * @param {number} targetRowNumber - The row number in the target worksheet to copy to.
   * @private
   */
  private copyRow(
    worksheet: Excel.Worksheet,
    worksheetTemplate: Excel.Worksheet,
    sourceRowNumber: number,
    targetRowNumber: number,
  ) {
    const sourceRow = worksheetTemplate.getRow(sourceRowNumber);
    const targetRow = worksheet.getRow(targetRowNumber);

    targetRow.height = sourceRow.height;
    sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const targetCell = targetRow.getCell(colNumber);
      targetCell.value = cell.value;
      targetCell.style = { ...cell.style };
      if (cell.formula) {
        targetCell.value = { formula: cell.formula, result: cell.result };
      }
    });
    targetRow.commit();
  }

  /**
   * Copy rows from the template worksheet to the target worksheet.
   *
   * @param {Excel.Worksheet} worksheet - The target worksheet where the rows will be copied.
   * @param {Excel.Worksheet} worksheetTemplate - The template worksheet from which the rows will be copied.
   * @param {number} sourceStartRow - The starting row number in the template worksheet to copy from.
   * @param {number} sourceEndRow - The ending row number in the template worksheet to copy from.
   * @param {number} targetStartRow - The starting row number in the target worksheet to copy to.
   * @param {Map<string, CMergeCell>} mergeCells - A map of merge cells to apply in the target worksheet.
   * @private
   */
  private copyRows(
    worksheet: Excel.Worksheet,
    worksheetTemplate: Excel.Worksheet,
    sourceStartRow: number,
    sourceEndRow: number,
    targetStartRow: number,
    mergeCells: Map<string, CMergeCell>,
  ) {
    const rowCount = sourceEndRow - sourceStartRow + 1;
    for (let i = 0; i < rowCount; i++) {
      const sourceRowNum = sourceStartRow + i;
      const targetRowNum = targetStartRow + i;
      this.copyRow(worksheet, worksheetTemplate, sourceRowNum, targetRowNum);
    }

    // Get list merge cells in sheet
    const setMergeSell = new Set<string>();
    for (let rowIndex = sourceStartRow; rowIndex <= sourceEndRow; rowIndex++) {
      const row = worksheetTemplate.getRow(rowIndex);
      const maxCol = row.cellCount;
      for (let colIndex = 1; colIndex <= maxCol; colIndex++) {
        const cell = row.getCell(colIndex);

        const isMerged = cell.isMerged;
        if (isMerged) {
          const masterCell = cell.master.address;
          setMergeSell.add(masterCell);
        }
      }
    }

    // Process each merge cell
    for (const mergeKey of setMergeSell) {
      const mergeCell = mergeCells.get(mergeKey);

      if (mergeCell) {
        const mBeginRow = targetStartRow - sourceStartRow + mergeCell.top;
        const mEndRow = targetStartRow - sourceStartRow + mergeCell.bottom;
        const mBeginCol = mergeCell.left;
        const mEndCol = mergeCell.right;

        const master = worksheet.getCell(mBeginRow, mBeginCol);

        for (let rowIndex = mBeginRow; rowIndex <= mEndRow; rowIndex++) {
          const row = worksheet.getRow(rowIndex);
          for (let colIndex = mBeginCol; colIndex <= mEndCol; colIndex++) {
            const cell = row.getCell(colIndex);

            if (cell.address === master.address) {
              continue;
            }
            cell.merge(master);
          }
        }
      }
    }
  }

  /**
   * Get a list of merge cells from the worksheet template.
   *
   * @param {Excel.Worksheet} worksheetTemplate - The worksheet template to extract merge cells from.
   * @private
   */
  private getListMergeCells(
    worksheetTemplate: Excel.Worksheet,
  ): Map<string, CMergeCell> {
    // Get list merge cells in sheet

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const merges = (worksheetTemplate as any)._merges;
    const listMergeCells = new Map<string, CMergeCell>();

    for (const mergesKey in merges) {
      const newCMergeCell: CMergeCell = {
        // eslint-disable-next-line
        top: merges[mergesKey].top,
        // eslint-disable-next-line
        left: merges[mergesKey].left,
        // eslint-disable-next-line
        bottom: merges[mergesKey].bottom,
        // eslint-disable-next-line
        right: merges[mergesKey].right,
        sheetName: undefined,
      };

      listMergeCells.set(mergesKey, newCMergeCell);
    }

    return listMergeCells;
  }

  /**
   * Insert empty rows into the worksheet before copy rows from the template.
   *
   * @param {Excel.Worksheet} worksheet - The worksheet to insert empty rows into.
   * @param {number} height - The total height of the table to be inserted.
   * @param {ConfigSheet} configSheet - The configuration for the sheet, which contains the ranges to insert empty rows.
   * @private
   */
  private insertEmptyRows(
    worksheet: Excel.Worksheet,
    height: number,
    configSheet: ConfigSheet,
  ): void {
    const arrSteps: number[] = [];

    if (height > this.LIMIT_INSERT_EMPTY_ROW) {
      const step = Math.floor(height / this.LIMIT_INSERT_EMPTY_ROW);
      for (let i = 0; i < step; i++) {
        arrSteps.push(this.LIMIT_INSERT_EMPTY_ROW);
      }

      const lastStep = height - step * this.LIMIT_INSERT_EMPTY_ROW;
      if (lastStep > 0) {
        arrSteps.push(lastStep);
      }
    } else {
      arrSteps.push(height);
    }

    // Insert empty rows
    if (arrSteps.length > 0) {
      const startRow = Number(
        worksheet.getCell(configSheet.ranges[0].beginCell).row,
      );
      for (const step of arrSteps) {
        worksheet.insertRows(startRow + 1, new Array(step), 'empty');
      }
    }
  }

  /**
   * Remove the template worksheet from the workbook after processing.
   *
   * @param {Excel.Workbook} workbook - The workbook from which to remove the template worksheet.
   * @param {Excel.Worksheet} worksheetTemplate - The template worksheet to be removed.
   * @private
   */
  private removeTemplateSheet(
    workbook: Excel.Workbook,
    worksheetTemplate: Excel.Worksheet,
  ) {
    workbook.removeWorksheet(worksheetTemplate.name);
  }

  /**
   * Log a step in the export process with a message and the time taken for that step.
   *
   * @param {string} message - The message describing the step.
   * @param {string} time - The time taken for the step, formatted as a string.
   * @private
   */
  private logStep(message: string, time: string) {
    const s1 = message.padEnd(50, '.');
    const s2 = time.padStart(15, ' ');
    this.logger.log(`${s1} => ${s2}`);
  }

  /**
   * Using for TEST purpose only. o(*￣︶￣*)o
   * Save the temporary file to the result folder.
   *
   * @param {Excel.Worksheet} worksheet - The worksheet to save as a temporary file.
   * @private
   */
  private saveTempFile(worksheet: Excel.Worksheet) {
    const filePath = `results/temp_${this.utilService.generateUUIDv7()}.xlsx`;
    worksheet.workbook.xlsx.writeFile(filePath);
  }
}
