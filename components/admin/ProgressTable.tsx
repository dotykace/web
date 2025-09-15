import RoomParticipants from "@/components/admin/RoomParticipants";

export default function ProgressTable({ room }) {
  const thBaseClass = "text-center px-2 py-3 text-sm font-semibold text-gray-800";
  const statusItems = [
    { label: 'Dokončené', color: 'bg-green-500' },
    { label: 'Aktuálne', color: 'bg-blue-500' },
    { label: 'Povolené', color: 'bg-yellow-500' },
    { label: 'Zamknuté', color: 'bg-gray-400' },
  ];

  return (
    <div className="space-y-4">
      {/*Table Label*/}
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">Pokrok hráčov:</h4>
        <div className="text-xs text-gray-500 flex items-center gap-4">
          {statusItems.map(({ label, color }) => (
            <span key={label} className="inline-flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
              {label}
                  </span>
          ))}
        </div>
      </div>

      {/*Table*/}
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2">
            <tr>
              <th className={"text-left min-w-[120px]"+thBaseClass}>Hráč</th>
              {[0, 1, 2, 3, 4].map((num) => (
                <th key={num} className={thBaseClass+" w-12"}>
                  {num}
                </th>
              ))}
              <th className={thBaseClass+" min-w-[100px]"}>
                Akcie
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            <RoomParticipants participants={room.participants} room={room}/>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}