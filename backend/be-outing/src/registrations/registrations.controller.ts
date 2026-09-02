import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { Throttle } from "@nestjs/throttler";
import { writeThrottle } from "../config/env.validation";
import { CreateRegistrationDto } from "./dto/create-registration.dto";
import { UpdateRegistrationDto } from "./dto/update-registration.dto";
import { RegistrationsService } from "./registrations.service";

const WRITE_THROTTLE = {
  default: {
    limit: () => writeThrottle().limit,
    ttl: () => writeThrottle().ttl,
  },
};

@Controller("registrations")
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Throttle(WRITE_THROTTLE)
  @Post()
  create(@Body() dto: CreateRegistrationDto) {
    return this.registrations.create(dto);
  }

  @Get()
  findAll() {
    return this.registrations.findAll();
  }

  @Get("find-by-registration-number")
  findByRegistrationNumber(
    @Query("name") name: string,
    @Query("phone") phone: string,
  ) {
    return this.registrations.findByRegistrationNumber(name, phone);
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    id: string,
  ) {
    return this.registrations.findOne(id);
  }

  @Throttle(WRITE_THROTTLE)
  @Patch("cancel-by-registration-number")
  cancelByRegistrationNumber(
    @Query("name") name: string,
    @Query("phone") phone: string,
  ) {
    return this.registrations.cancelByRegistrationNumber(name, phone);
  }

  @Throttle(WRITE_THROTTLE)
  @Patch("update-by-registration-number")
  updateByRegistrationNumber(
    @Query("name") name: string,
    @Query("phone") phone: string,
    @Body() dto: UpdateRegistrationDto,
  ) {
    return this.registrations.updateByRegistrationNumber(
      name,
      phone,
      dto,
    );
  }

  @Throttle(WRITE_THROTTLE)
  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    id: string,
    @Body() dto: UpdateRegistrationDto,
  ) {
    return this.registrations.update(id, dto);
  }

  @Throttle(WRITE_THROTTLE)
  @Delete(":id")
  cancel(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    id: string,
  ) {
    return this.registrations.cancel(id);
  }
}

