import { OrderRepository } from "../infrastructure/order.repository";

export const deleteOrder = async (id: string) => {
  const order = await OrderRepository.delete(id);
  return order;
};
