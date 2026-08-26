import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: string = 'development';

  /**
   * Upper bound on PostgreSQL connections held by this process. Requests queue
   * in the app once it is reached, which is far cheaper than letting the
   * database refuse or drop connections under a burst of registrations.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  DATABASE_POOL_MAX: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  /** Comma-separated list of browser origins allowed to call this API. */
  @IsOptional()
  @IsString()
  CORS_ORIGINS: string = 'http://localhost:3000';

  /** Rate limit window in milliseconds. */
  @IsOptional()
  @IsInt()
  @Min(1000)
  THROTTLE_TTL: number = 60_000;

  /** Max requests per window, per client. */
  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number = 60;

  /** Rate limit window for write endpoints (POST/PATCH/DELETE), in milliseconds. */
  @IsOptional()
  @IsInt()
  @Min(1000)
  WRITE_THROTTLE_TTL: number = 60_000;

  /** Max write requests per window, per client. */
  @IsOptional()
  @IsInt()
  @Min(1)
  WRITE_THROTTLE_LIMIT: number = 30;
}

/**
 * Read at request time (not import time) so that values loaded into process.env
 * by ConfigModule are picked up by the @Throttle decorators.
 */
export function writeThrottle(): { limit: number; ttl: number } {
  const limit = Number(process.env.WRITE_THROTTLE_LIMIT);
  const ttl = Number(process.env.WRITE_THROTTLE_TTL);

  return {
    limit: Number.isFinite(limit) && limit > 0 ? limit : 30,
    ttl: Number.isFinite(ttl) && ttl > 0 ? ttl : 60_000,
  };
}

/**
 * Validates process env at boot so the app fails fast on misconfiguration.
 * Error messages deliberately report only property names and constraint names,
 * never the offending values, so secrets such as DATABASE_URL are not logged.
 */
export function validateEnv(
  raw: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, raw, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const summary = errors
      .map((error) => {
        const constraints = Object.keys(error.constraints ?? {}).join(', ');
        return `${error.property} (failed: ${constraints || 'unknown constraint'})`;
      })
      .join('; ');
    throw new Error(
      `Invalid environment configuration: ${summary}. See .env.example for the expected values.`,
    );
  }

  return validated;
}
