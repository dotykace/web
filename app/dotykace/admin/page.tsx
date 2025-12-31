"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  DotykaceRoom,
  ChapterPermissions,
  DotykaceParticipant,
} from "@/lib/dotykace-types";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import CreateRoom from "@/components/admin/CreateRoom";
import RenderRoom from "@/components/admin/RenderRoom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getParticipantsOnce } from "@/hooks/use-participants";
import { readFromStorage, removeFromStorage } from "@/scripts/local-storage";

export default function AdminPage() {
  const [rooms, setRooms] = useState<DotykaceRoom[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const processedRooms = useRef(new Set<string>());
  const router = useRouter();

  const [selectedRoom, setSelectedRoom] = useState<DotykaceRoom | null>(null);

  useEffect(() => {
    const storedAdminId = readFromStorage("adminId");
    if (!storedAdminId) {
      router.push("/");
      return;
    }
    setAdminId(storedAdminId);

    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("adminId", "==", storedAdminId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => ({
        docId: doc.id,
        id: doc.data().id || doc.id,
        ...doc.data(),
      })) as DotykaceRoom[];
      setRooms(roomsData);
    });

    return () => unsubscribe();
  }, [router]);
  const ensurePlayerPermissions = async (room: DotykaceRoom) => {
    if (
      !room.globalUnlockedChapters ||
      room.globalUnlockedChapters.length === 0
    )
      return;
    if (!room.docId) return;

    const participants = await getParticipantsOnce(room);
    const roomStateKey = `${room.docId}-${
      participants.length || 0
    }-${room.globalUnlockedChapters.join(",")}`;

    if (processedRooms.current.has(roomStateKey)) return;

    const currentPermissions = room.chapterPermissions || {};
    let needsUpdate = false;
    const updatedPermissions: ChapterPermissions = { ...currentPermissions };

    participants.forEach((participant: DotykaceParticipant) => {
      const playerPermissions = updatedPermissions[participant.id] || {
        allowedChapters: [],
        playerName: participant.name,
      };

      room.globalUnlockedChapters!.forEach((chapter) => {
        if (!playerPermissions.allowedChapters.includes(chapter)) {
          playerPermissions.allowedChapters.push(chapter);
          needsUpdate = true;
        }
      });

      playerPermissions.allowedChapters.sort((a, b) => a - b);
      updatedPermissions[participant.id] = playerPermissions;
    });

    if (needsUpdate) {
      try {
        processedRooms.current.add(roomStateKey);
        await updateDoc(doc(db, "rooms", room.docId), {
          chapterPermissions: updatedPermissions,
        });
      } catch (error) {
        console.error("❌ Error updating player permissions:", error);
        processedRooms.current.delete(roomStateKey);
      }
    }
  };

  useEffect(() => {
    if (processedRooms.current.size > 50) {
      const entries = Array.from(processedRooms.current);
      processedRooms.current.clear();
      entries.slice(-25).forEach((entry) => processedRooms.current.add(entry));
    }

    rooms.forEach((room) => {
      console.log("Checking permissions for room:", room.name);
      // todo reduce calls
      ensurePlayerPermissions(room);
    });
    if (!selectedRoom) {
      setSelectedRoom(rooms[0] || null);
    }
    if (selectedRoom) {
      const updatedRoom = rooms.find((room) => room.id === selectedRoom.id);
      if (updatedRoom) {
        setSelectedRoom(updatedRoom);
      } else {
        setSelectedRoom(rooms[0] || null);
      }
    }
  }, [rooms, selectedRoom]);

  const logout = () => {
    removeFromStorage("adminId");
    router.push("/");
  };

  const EmptyRoomList = () => {
    return (
      <Card className="card-elevated border-0">
        <CardContent className="text-center py-16 px-8">
          <div className="bg-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Žiadne miestnosti
          </h3>
          <p className="text-gray-500 leading-relaxed">
            Vytvorte svoju prvú miestnosť pre začatie interaktívneho zážitku
          </p>
        </CardContent>
      </Card>
    );
  };

  const RoomButton = ({ room }: { room: DotykaceRoom }) => {
    const isSelected = selectedRoom?.id === room.id;
    return (
      <SidebarMenuButton
        onClick={() => setSelectedRoom(room)}
        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
          isSelected
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/50"
            : "hover:bg-orange-50 text-gray-700"
        }`}
      >
        <span className="text-base font-medium">{room.name}</span>
      </SidebarMenuButton>
    );
  };
  const AppSidebar = () => {
    return (
      <Sidebar className="text-black border-r border-orange-100">
        <SidebarHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Admin Panel</p>
          </div>
          {/* Create Room */}
          <CreateRoom adminId={adminId} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
              Zoznam miestnosti
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {rooms.map((room) => (
                  <SidebarMenuItem key={room.id}>
                    <RoomButton room={room} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button 
            onClick={logout} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Odhlásiť sa
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-admin p-4">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "18rem",
          } as React.CSSProperties & Record<string, string>
        }
      >
        <AppSidebar />
        <div className="w-max flex-grow animate-fade-in">
          <SidebarTrigger />
          {selectedRoom ? (
            <RenderRoom room={selectedRoom} processedRooms={processedRooms} />
          ) : (
            <EmptyRoomList />
          )}
        </div>
      </SidebarProvider>
    </div>
  );
}
