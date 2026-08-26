import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { writeThrottle } from '../config/env.validation';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationsService } from './registrations.service';

/** Tighter limit than the global one: writes are the abuse-prone path. */
const WRITE_THROTTLE = {
  default: {
    limit: () => writeThrottle().limit,
    ttl: () => writeThrottle().ttl,
  },
};

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Throttle(WRITE_THROTTLE)
  @Post()
  create(@Body() dto: CreateRegistrationDto) {
    return this.registrations.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.registrations.findOne(id);
  }

  @Throttle(WRITE_THROTTLE)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRegistrationDto,
  ) {
    return this.registrations.update(id, dto);
  }

  /** Soft delete: flips status to CANCELLED and returns the updated row. */
  @Throttle(WRITE_THROTTLE)
  @Delete(':id')
  cancel(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.registrations.cancel(id);
  }
}
