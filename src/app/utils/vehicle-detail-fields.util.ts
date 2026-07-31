import { IVehicleDetails } from 'app/app.model';

export interface VehicleDetailField {
  label: string;
  value: string;
}

/**
 * Every non-empty Vehicle.cs field, for reference display only - only Make/Model/Year/Plate actually carry over
 * onto the work order (see DashboardPage_Redesign.md's "Vehicle→WorkOrder scope" decision); the rest has no
 * WorkOrder column (VIN/engine/tyres/etc.), so it's shown as read-only context, not editable.
 */
export function buildVehicleDetailFields(
  vehicle: IVehicleDetails,
  translate: (key: string) => string
): VehicleDetailField[] {
  const fields: [string, string | undefined | null][] = [
    [translate('fuelType'), vehicle.fuelType],
    [translate('vehicleColor'), vehicle.color],
    [translate('vehicleBodyType'), vehicle.chassis],
    [translate('vehicleCategory'), vehicle.vehicleType],
    [translate('vehicleVin'), vehicle.vin],
    [translate('vehicleEngineCode'), vehicle.engineCode],
    [translate('vehicleTransmission'), vehicle.transmission],
    [translate('vehiclePower'), vehicle.effect],
    [translate('vehicleHorsepower'), vehicle.horsepower],
    [translate('vehicleDrivetrain'), vehicle.driving],
    [translate('vehicleFrontTyre'), vehicle.frontWheelDimension],
    [translate('vehicleBackTyre'), vehicle.backWheelDimension],
    [translate('vehicleOilCapacityScraped'), vehicle.oilCapacity],
    [translate('vehicleOilSpec'), vehicle.oilSpecifications1],
    [translate('vehicleOilClassification'), vehicle.oilClassification1],
    [translate('vehicleOilSpecAlt'), vehicle.oilSpecifications2],
    [translate('vehicleOilClassificationAlt'), vehicle.oilClassification2],
  ];
  return fields
    .filter(([, value]) => !!value)
    .map(([label, value]) => ({ label, value: value as string }));
}
