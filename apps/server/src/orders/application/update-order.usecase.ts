import { OrderRepository } from "../infrastructure/order.repository";

export const updateOrder = async (
  id: string,
  status: "active" | "completed" | "cancelled"
) => {
  const existingOrder = await OrderRepository.getById(id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const updatedOrder = await OrderRepository.update(id, {
    ...existingOrder,
    status,
  });

  return updatedOrder;
};
