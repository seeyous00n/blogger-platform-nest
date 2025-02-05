import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.datasource.query(`DELETE FROM "user"`);
    await this.datasource.query(`DELETE FROM "session"`);
    await this.datasource.query(`DELETE FROM "blog"`);
    await this.datasource.query(`DELETE FROM "post"`);
    await this.datasource.query(`DELETE FROM "comment"`);
    await this.datasource.query(`DELETE FROM "like"`);
  }
}
