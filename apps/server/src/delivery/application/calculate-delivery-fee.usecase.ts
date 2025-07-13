import { DeliveryRepository } from "../infrastructure/delivery.repository";

export const calculateDeliveryFee = async (
  originCep: string,
  destinationCep: string
) => {
  return DeliveryRepository.calculateDeliveryFee(originCep, destinationCep);
};
