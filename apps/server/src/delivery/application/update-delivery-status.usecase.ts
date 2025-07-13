import { DeliveryRepository } from "../infrastructure/delivery.repository";

export const updateDeliveryStatus = async (
  deliveryId: string,
  status: "pending" | "in_progress" | "delivered" | "cancelled"
) => {
  return DeliveryRepository.updateDeliveryStatus(deliveryId, status);
};
