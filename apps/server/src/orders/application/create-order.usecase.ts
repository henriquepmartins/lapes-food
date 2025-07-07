import {
  OrderRepository,
  type CreateOrderParams,
} from "../infrastructure/order.repository";

export const createOrder = async (params: CreateOrderParams) => {
  const order = await OrderRepository.create(params);
  return order;
};
