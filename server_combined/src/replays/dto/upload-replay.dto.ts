import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
    IsArray, IsOptional, IsNotEmpty, IsNumber, IsString, Min, Max, MinLength,
} from 'class-validator';

const transformSectorTimes = (inputValue: unknown) => {
    if (inputValue === null || inputValue === undefined) return undefined;

    // Input array can be either a string to be split by comma's, or an actual array of strings (through Swagger UI)
    let inputArray: any[];
    if (typeof inputValue === 'string' && inputValue !== '') {
        // Split array by comma's
        inputArray = inputValue.replace('[', '').replace(']', '').split(',');
    } else if (Array.isArray(inputValue)) {
        inputArray = inputValue;
    } else {
        return undefined;
    }

    const numArray = inputArray.map((v) => Number(v));

    numArray.forEach((v, i) => {
        if (Number.isNaN(v)) {
            throw new BadRequestException(`Sector time '${inputArray[i]}' at index ${i} is not a valid number`);
        }
        if (!Number.isInteger(v)) {
            throw new BadRequestException(`Sector time '${inputArray[i]}' at index ${i} is not an integer`);
        }
    });

    return numArray;
};

export class UploadReplayDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    mapUId: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    endRaceTime: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(1)
    raceFinished: number;

    @IsNotEmpty()
    @IsString()
    pluginVersion: string;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => transformSectorTimes(value))
    sectorTimes?: number[];
}
