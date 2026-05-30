import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function InventoryChart({
  products
}) {

  return (

    <div className="
      bg-white
      p-6
      rounded-2xl
      shadow
      mt-8
    ">

      <h2 className="
        text-2xl
        font-bold
        mb-6
      ">
        Stock por Producto
      </h2>

      <div className="h-96">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart data={products}>

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="quantity" />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}