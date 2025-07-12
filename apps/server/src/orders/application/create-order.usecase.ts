import {
  OrderRepository,
  type CreateOrderParams,
} from "../infrastructure/order.repository";

export const createOrder = async (params: CreateOrderParams) => {
  if (!params.userId) throw new Error("userId is required to create an order");
  const order = await OrderRepository.create(params);
  return order;
};
