import { OrderRepository } from "../infrastructure/order.repository";

export const getAllOrders = async (params: {
  page: number;
  limit: number;
  query?: string;
  user: { id: string; role: string };
}) => {
  const orders = await OrderRepository.getAll(params);
  return orders;
};
