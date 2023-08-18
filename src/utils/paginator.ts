/** @format */

import { Attributes, Model, ModelStatic, WhereOptions } from "sequelize";
import {
  IPaginatorOptions,
  PaginatorError,
  PaginatorErrorCodes,
} from "../types/interfaces";

/**
 * A class which assists in paginating a sequelize database.
 * @param {IPaginatorOptions} paginatorOptions The options which allow pagination.
 */
export default class Paginator<ModelType extends Model> {
  private _pageIndex: number;
  public readonly pageSize: number;
  public readonly model: ModelStatic<ModelType>;
  private _whereQuery?: WhereOptions<Attributes<ModelType>>;
  private _orderQuery?: [string, "ASC" | "DESC"][];
  private _maxPages!: number;
  public initialized = false;

  public get currentPage() {
    return this._pageIndex;
  }

  public get maxPages() {
    return this._maxPages;
  }

  public get whereQuery() {
    return this._whereQuery;
  }

  public set whereQuery(
    newWhereQuery: WhereOptions<Attributes<ModelType>> | undefined
  ) {
    this._whereQuery = newWhereQuery;
  }

  /**
   * Gets the results of the next page, and increments the page number.
   * @returns {Promise<ModelType[]>} The next page of results.
   */
  public async nextPage() {
    if (!this.initialized) {
      throw new PaginatorError(
        "Paginator not initialized.",
        PaginatorErrorCodes.NOT_INITIALIZED
      );
    }

    if (this._pageIndex + 1 >= this._maxPages) {
      throw new PaginatorError(
        "Already on last page.",
        PaginatorErrorCodes.MAX_PAGE
      );
    }
    this._pageIndex++;
    return await this._getPage();
  }
  /**
   * Gets the results of the previous page, and decrements the page number.
   * @returns {Promise<ModelType[]>} The preivous page of results.
   */
  public async previousPage() {
    if (!this.initialized) {
      throw new PaginatorError(
        "Paginator not initialized.",
        PaginatorErrorCodes.NOT_INITIALIZED
      );
    }

    if (this._pageIndex - 1 < 0) {
      throw new PaginatorError(
        "Already on first page.",
        PaginatorErrorCodes.MIN_PAGE
      );
    }
    this._pageIndex--;
    return await this._getPage();
  }

  /**
   * Gets the page of the specified index.
   * @param pageIndex The page index to set the paginator to.
   * @returns {Promise<ModelType[]>} The page of results.
   */
  public async goToPage(pageIndex: number) {
    if (!this.initialized) {
      throw new PaginatorError(
        "Paginator not initialized.",
        PaginatorErrorCodes.NOT_INITIALIZED
      );
    }

    if (pageIndex < 0 || pageIndex >= this._maxPages) {
      throw new PaginatorError(
        "Invalid page index.",
        PaginatorErrorCodes.INVALID_PAGE
      );
    }
    this._pageIndex = pageIndex;
    return await this._getPage();
  }

  /**
   * Gets the first page of results, setting the page index to 0.
   * @returns {Promise<ModelType[]>} The first page of results.
   */
  public async firstPage() {
    if (!this.initialized) {
      throw new PaginatorError(
        "Paginator not initialized.",
        PaginatorErrorCodes.NOT_INITIALIZED
      );
    }

    this._pageIndex = 0;
    return await this._getPage();
  }

  /**
   * Gets the last page of results, setting the page index to the last page.
   * @returns {Promise<ModelType[]>} The first page of results.
   */
  public async lastPage() {
    if (!this.initialized) {
      throw new PaginatorError(
        "Paginator not initialized.",
        PaginatorErrorCodes.NOT_INITIALIZED
      );
    }

    this._pageIndex = this._maxPages - 1;
    return await this._getPage();
  }

  /**
   * Gets the page of results at the current page index.
   * @returns {Promise<ModelType[]>} The page of results.
   * @private
   */
  private async _getPage() {
    if (!this.initialized) {
      throw new PaginatorError(
        "Paginator not initialized.",
        PaginatorErrorCodes.NOT_INITIALIZED
      );
    }

    const result = await this.model.findAll({
      where: this._whereQuery,
      limit: this.pageSize,
      offset: this._pageIndex * this.pageSize,
      order: this._orderQuery,
    });
    return result;
  }

  /**
   * Initializes the paginator, and gets the first page of results.
   * @returns {Promise<ModelType[]>} The first page of results.
   */
  public async init() {
    const result = await this.model.count({
      where: this._whereQuery,
    });
    this._maxPages = Math.ceil(result / this.pageSize);
    this.initialized = true;
    return await this.firstPage();
  }

  constructor(paginatorOptions: IPaginatorOptions<ModelType>) {
    this._pageIndex = paginatorOptions.pageIndex ?? 0;
    this.pageSize = paginatorOptions.pageSize;
    this.model = paginatorOptions.model;
    this._whereQuery = paginatorOptions.whereQuery;
    this._orderQuery = paginatorOptions.orderQuery;
  }
}
