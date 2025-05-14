import { Injectable } from '@nestjs/common';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { format } from 'date-fns';

/**
 * @description
 * This file defines a TypeScript type for a paginated entity.
 * The type includes a `page` property that contains pagination information such as the current page number, the limit of items per page, and the total number of items.
 */
export type PagingType<T> = {
  page: {
    page: number;
    limit: number;
    no: number;
  };
} & T;

/**
 * General utility service
 */
@Injectable()
export class UtilService {
  /**
   * Generate a UUIDv4
   *
   * @returns {string} - A UUIDv4 string
   *
   * @example
   * const uuid = utilService.generateUUIDv4();
   * console.log(uuid); // e.g., '123e4567-e89b-12d3-a456-426614174000'
   */
  generateUUIDv4(): string {
    return uuidv4();
  }

  /**
   * Generate a UUIDv7, which is a time-based UUID.
   *
   * @returns {string} - A UUIDv7 string
   *
   * @example
   * const uuid = utilService.generateUUIDv7();
   * console.log(uuid); // e.g., '123e4567-e89b-12d3-a456-426614174000'
   */
  generateUUIDv7(): string {
    return uuidv7();
  }

  /**
   * Convert a string with format "YYYY-MM-DD" to a Date object.
   *
   * @param {string} dateString - The date string to convert.
   *
   * @returns {Date} - The converted Date object or the original string if input is null or undefined.
   */
  convertStringToDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Convert a Date object to a string with format "YYYY-MM-DD".
   * @param {Date} date - The date to convert.
   * @param formatStr - The format string to use for conversion.
   *
   * @returns {string} - The converted date string or the original date if input is null or undefined.
   */
  convertDateToString(date: Date, formatStr: string): string {
    if (!date) return date;
    return format(date, formatStr);
  }

  /**
   * Convert list query to pagination object.
   *
   * @example
   * const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
   * const page = 1;
   * const limit = 10;
   * const paginatedList = utilService.convertToPagination(list, page, limit);
   *
   * console.log(paginatedList);
   * // Output:
   * // [
   * //   { page: { page: 1, limit: 10, no: 1 }, id: 1 },
   * //   { page: { page: 1, limit: 10, no: 2 }, id: 2 },
   * //   { page: { page: 1, limit: 10, no: 3 }, id: 3 },
   * // ]
   *
   * @param {<T>[]} list - The list to convert.
   * @param {number} page - The current page number.
   * @param {number} limit - The number of items per page.
   *
   * @returns {PagingType<<T>>[]} - The paginated list.
   */
  convertToPagination<T>(
    list: T[],
    page: number,
    limit: number,
  ): PagingType<T>[] {
    return list.map((item, index) => {
      return {
        page: {
          page: page,
          limit: limit,
          no: index + 1,
        },
        ...item,
      };
    });
  }

  /**
   * Convert a string, number to a string format cash
   *
   * @param {string | number} str - The string to convert.
   *
   * @returns {string} - The converted string or the original string if input is null or undefined.
   */
  convertToStringCash(str: string | number): string {
    let convertedString = '';
    if (typeof str === 'number') {
      convertedString = str.toString();
    }
    if (typeof str === 'string') {
      convertedString = str;
    }

    return convertedString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
