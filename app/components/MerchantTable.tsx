import { MerchantStat } from '../lib/analyzer';

interface MerchantTableProps {
  merchants: MerchantStat[];
}

export default function MerchantTable({ merchants }: MerchantTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Top Merchants</h3>
        <p className="text-sm text-gray-500 mt-1">Where you spend the most</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visits
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg/Visit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {merchants.slice(0, 10).map((merchant, index) => (
              <tr key={merchant.merchant} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-medium flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {merchant.merchant}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  Rs.{merchant.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {merchant.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  Rs.{merchant.average.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
