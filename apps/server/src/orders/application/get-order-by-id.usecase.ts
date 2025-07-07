import { OrderRepository } from "../infrastructure/order.repository";

export const getOrderById = async (id: string) => {
  const order = await OrderRepository.getById(id);
  return order;
};
