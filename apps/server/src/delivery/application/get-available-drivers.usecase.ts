import { DeliveryRepository } from "../infrastructure/delivery.repository";

export const getAvailableDrivers = async () => {
  return DeliveryRepository.getAvailableDrivers();
};
