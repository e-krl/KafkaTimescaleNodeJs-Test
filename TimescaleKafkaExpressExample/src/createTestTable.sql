-- Create table
CREATE TABLE cars_real_time (
  time TIMESTAMPTZ NOT NULL,
  car_id UUID NOT NULL,
  long DOUBLE PRECISION NULL,
  lat DOUBLE PRECISION NULL
);

-- Make it hypertable 
SELECT create_hypertable('cars_real_time', 'time');

-- Create index for faster use
CREATE INDEX ix_car_id_time ON cars_real_time (car_id, time DESC);


-- Set up potgre LISTEN and NOTIFY
CREATE OR REPLACE FUNCTION notify_cars_real_time()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('cars_real_time_channel', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_real_time_trigger
AFTER INSERT OR UPDATE OR DELETE ON cars_real_time
FOR EACH ROW
EXECUTE FUNCTION notify_cars_real_time();
