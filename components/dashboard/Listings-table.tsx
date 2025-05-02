"use client";

interface ListingsTableProps {
  data: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
  }>;
}

export function ListingsTable({ data = [] }: ListingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((listing) => (
            <tr key={listing.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {listing.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                MK{listing.price.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {listing.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}