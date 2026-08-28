import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { LocationsService } from "./locations.service";

@Controller("locations")
export class LocationsController {
  constructor(
    private readonly locations: LocationsService,
  ) {}

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locations.create(dto);
  }

  @Get()
  findAll() {
    return this.locations.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" }))
    id: string,
  ) {
    return this.locations.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locations.update(id, dto);
  }

  @Delete(":id")
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
  ) {
    return this.locations.remove(id);
  }
}
