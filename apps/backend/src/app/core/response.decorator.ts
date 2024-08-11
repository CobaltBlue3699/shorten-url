import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiPropertyOptional,
  ApiResponseOptions,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';

import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseWrapper<T> {
  @ApiProperty({ description: 'Request status, 0 means everything is fine.', example: 0 })
  status: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: 'object' })
  data: T;
}

export class Pagination<T = any> {
  @ApiPropertyOptional({
    description: 'Current page number. Starts from 1.',
    example: 1,
  })
  pageNo: number;

  @ApiPropertyOptional({
    description: 'Number of items per page.',
    example: 10,
  })
  pageSize: number;

  data: T[];
}

export const ApiGlobalResponse = <DataDto extends Type<unknown>>(
  message: string,
  dataDto: DataDto,
  ...additionalResponses: ApiResponseOptions[]
) => {
  return applyDecorators(
    ApiOperation({ summary: message }),
    ApiExtraModels(ApiResponseWrapper, dataDto),
    ApiResponse({
      status: 200,
      description: message,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseWrapper) },
          {
            properties: {
              status: { type: 'number', example: 0 },
              message: { type: 'string', example: 'Success' },
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
    ...additionalResponses.map((res) => ApiResponse(res))
  );
};

export const ApiGlobalPaginationResponse = <DataDto extends Type<unknown>>(
  message: string,
  dataDto: DataDto,
  ...additionalResponses: ApiResponseOptions[]
) => {
  return applyDecorators(
    ApiOperation({ summary: message }),
    ApiExtraModels(Pagination, dataDto),
    ApiResponse({
      status: 200,
      description: message,
      schema: {
        allOf: [
          { $ref: getSchemaPath(Pagination) },
          {
            properties: {
              status: { type: 'number', example: 0 },
              message: { type: 'string', example: 'Success' },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
    ...additionalResponses.map((res) => ApiResponse(res))
  );
};
