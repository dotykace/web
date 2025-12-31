import React from "react";
import RoomParticipants from "@/components/admin/RoomParticipants";
import { chapterList } from "@/components/admin/RenderRoom";
import type { DotykaceRoom, DotykaceParticipant } from "@/lib/dotykace-types";

export default function ProgressTable({
  room,
  headerButtons,
  participants,
}: {
  room: DotykaceRoom;
  headerButtons: () => React.ReactNode;
  participants: DotykaceParticipant[];
}) {
  const thBaseClass =
    "text-center px-3 py-3 text-sm font-semibold text-gray-700";
  const statusItems = [
    { label: "Dokončené", color: "bg-green-500" },
    { label: "Aktuálne", color: "bg-orange-500" },
    { label: "Povolené", color: "bg-amber-400" },
    { label: "Zamknuté", color: "bg-gray-300" },
  ];

  const TableLabel = (
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-bold text-gray-800">Pokrok hráčov:</h4>
      <div className="text-xs text-gray-500 flex items-center gap-5">
        {statusItems.map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
            <span className="font-medium">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );

  const TableHeader = (
    <thead className="bg-gradient-to-r from-gray-50 to-orange-50/50 border-b-2 border-gray-100">
      <tr>
        <th className={"text-left min-w-[120px] " + thBaseClass}>Hráč</th>
        {room.isStarted
          ? headerButtons()
          : chapterList.map((num) => (
              <th key={num} className={thBaseClass + " w-12"}>
                {num}
              </th>
            ))}
        <th className={thBaseClass + " min-w-[100px]"}>Akcie</th>
      </tr>
    </thead>
  );

  const middleIndex = Math.ceil(participants.length / 2);
  const firstHalf = participants.slice(0, middleIndex);
  const secondHalf = participants.slice(middleIndex);

  return (
    <div className="space-y-2">
      {/*Table Label*/}
      {TableLabel}

      {/*Table*/}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <div className="flex gap-3 items-start p-2">
            {/* First Table */}
            <table className="table-auto border border-gray-200 w-1/2 flex-grow-0 rounded-lg overflow-hidden">
              {TableHeader}
              <tbody className="divide-y divide-gray-100">
                <RoomParticipants participants={firstHalf} room={room} />
              </tbody>
            </table>
            <table className="table-auto border border-gray-200 w-1/2 flex-grow-0 rounded-lg overflow-hidden">
              {TableHeader}
              <tbody className="divide-y divide-gray-100">
                <RoomParticipants participants={secondHalf} room={room} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
