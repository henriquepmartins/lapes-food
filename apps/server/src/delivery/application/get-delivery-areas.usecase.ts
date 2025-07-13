import { DeliveryRepository } from "../infrastructure/delivery.repository";

export const getDeliveryAreas = async () => {
  return DeliveryRepository.getDeliveryAreas();
};
