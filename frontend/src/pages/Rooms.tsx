import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { roomsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageCircle, Users, LogOut } from "lucide-react";

interface Room {
  id: string;
  name: string;
  created_at: string;
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const roomsData = await roomsAPI.getRooms();
      const formattedRooms = roomsData.map((r: any) => ({
        id: r.id, // number is fine, or r.id.toString() if you prefer string
        name: r.name,
        created_at: r.created_at, // make sure this is a valid ISO date string
      }));
      setRooms(formattedRooms);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setCreating(true);
    try {
      await roomsAPI.createRoom(newRoomName);
      setNewRoomName("");
      setDialogOpen(false);
      await loadRooms();
      toast({
        title: "Room created!",
        description: `Successfully created "${newRoomName}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = (roomId: string, roomName: string) => {
    navigate(`/chat/${roomId}`, { state: { roomName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Live Chat Rooms</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user?.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <form onSubmit={createRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      placeholder="Enter room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary"
                    disabled={creating || !newRoomName.trim()}
                  >
                    {creating ? "Creating..." : "Create Room"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={logout}
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Rooms Grid */}
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
              <Card
                key={room.id}
                className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => joinRoom(room.id, room.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 text-lg">{room.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created {room.created_at ? new Date(room.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                  <Button
                    className="w-full mt-4 bg-secondary hover:bg-secondary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinRoom(room.id, room.name);
                    }}
                  >
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No rooms yet</h3>
            <p className="text-muted-foreground mb-6">Create your first room to start chatting</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Room
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
