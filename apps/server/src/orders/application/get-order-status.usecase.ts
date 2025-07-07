import { OrderRepository } from "../infrastructure/order.repository";

export const getOrderStatuses = async () => {
  const statuses = OrderRepository.getOrderStatuses();
  return statuses;
};
