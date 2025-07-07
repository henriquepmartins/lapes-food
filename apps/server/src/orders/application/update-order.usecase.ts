import { OrderType } from "../domain/order.type";

export const updateOrder = async (
  id: string,
  status: "active" | "completed" | "cancelled"
) => {
  const order = await OrderType.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};
