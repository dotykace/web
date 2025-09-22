import RoomParticipants from "@/components/admin/RoomParticipants";

export default function ProgressTable({ room, headerButtons }) {
  const thBaseClass = "text-center px-2 py-3 text-sm font-semibold text-gray-800";
  const statusItems = [
    { label: 'Dokončené', color: 'bg-green-500' },
    { label: 'Aktuálne', color: 'bg-blue-500' },
    { label: 'Povolené', color: 'bg-yellow-500' },
    { label: 'Zamknuté', color: 'bg-gray-400' },
  ];

  const TableLabel = (
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
  )

  const TableHeader = (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2">
    <tr>
      <th className={"text-left min-w-[120px]"+thBaseClass}>Hráč</th>
      {room.isStarted? headerButtons()
        :([0, 1, 2, 3, 4].map((num) => (
        <th key={num} className={thBaseClass+" w-12"}>
          {num}
        </th>
      )))}
      <th className={thBaseClass+" min-w-[100px]"}>
        Akcie
      </th>
    </tr>
    </thead>
  )

  const middleIndex = Math.ceil(room.participants.length / 2);
  const firstHalf = room.participants.slice(0, middleIndex);
  const secondHalf = room.participants.slice(middleIndex);

  return (
    <div className="space-y-4">
      {/*Table Label*/}
      {TableLabel}

      {/*Table*/}
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="flex gap-2 items-start">
            {/* First Table */}
            <table className="table-auto border border-gray-300 w-1/2 flex-grow-0">
              {TableHeader}
              <tbody className="divide-y divide-gray-100">
              <RoomParticipants participants={firstHalf} room={room}/>
              </tbody>
            </table>
            <table className="table-auto border border-gray-300 w-1/2 flex-grow-0">
              {TableHeader}
              <tbody className="divide-y divide-gray-100">
              <RoomParticipants participants={secondHalf} room={room}/>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}