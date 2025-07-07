import { OrderRepository } from "../infrastructure/order.repository";

export const getAllOrders = async (params: {
  page: number;
  limit: number;
  query?: string;
}) => {
  const orders = await OrderRepository.getAll(params);
  return orders;
};
