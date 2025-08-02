

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "../components/ui/button";


export default function VideoChat({ roomId, socket, userId, setShowVideo }) {
  const [peers, setPeers] = useState([]); // { peerId, stream }
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const peerConnections = useRef({}); // peerId -> RTCPeerConnection

  useEffect(() => {
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        socket.emit("join-video", { roomId, userId });
      } catch (e) {
        console.error("getUserMedia error:", e);
      }
    };
    initLocalStream();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      Object.values(peerConnections.current).forEach((pc) => pc.close());
    };
  }, [roomId, socket, userId]);

  useEffect(() => {
    if (!socket || !localStream) return;

    socket.on("user-joined-video", async ({ peerId }) => {
      if (peerId === userId) return;

      const pc = createPeerConnection(peerId);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("video-offer", {
          target: peerId,
          caller: userId,
          sdp: pc.localDescription,
        });
      } catch (e) {
        console.error("Offer error:", e);
      }
    });

    socket.on("video-offer", async ({ caller, sdp }) => {
      if (!peerConnections.current[caller]) {
        peerConnections.current[caller] = createPeerConnection(caller);
      }
      const pc = peerConnections.current[caller];
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("video-answer", {
          target: caller,
          caller: userId,
          sdp: pc.localDescription,
        });
      } catch (e) {
        console.error("Answer error:", e);
      }
    });

    socket.on("video-answer", async ({ caller, sdp }) => {
      const pc = peerConnections.current[caller];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } catch (e) {
          console.error("Set remote desc error:", e);
        }
      }
    });

    socket.on("ice-candidate", ({ from, candidate }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => {
          console.error("Add ICE candidate error:", e);
        });
      }
    });

    socket.on("user-left-video", ({ peerId }) => {
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
        delete peerConnections.current[peerId];
      }
      setPeers((prev) => prev.filter((p) => p.peerId !== peerId));
    });

    return () => {
      socket.off("user-joined-video");
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("ice-candidate");
      socket.off("user-left-video");
    };
  }, [socket, localStream, userId]);

  function createPeerConnection(peerId) {
    if (peerConnections.current[peerId]) {
      return peerConnections.current[peerId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          target: peerId,
          from: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setPeers((prev) => {
        if (prev.find((p) => p.peerId === peerId)) return prev;
        return [...prev, { peerId, stream: remoteStream }];
      });
    };

    peerConnections.current[peerId] = pc;
    return pc;
  }

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsVideoOff(!isVideoOff);
  };

  const leaveCall = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};

    socket.emit("leave-video", { roomId, userId });

    setPeers([]);
    setLocalStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setShowVideo(false);
  };

  function RemoteVideo({ peerId, stream }) {
    const ref = useRef();
    useEffect(() => {
      if (ref.current) ref.current.srcObject = stream;
    }, [stream]);
    return (
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          Peer {peerId.substring(0, 5)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto">
        {/* Local video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}

          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-2xl text-white">You</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Remote videos */}
        {peers.map(({ peerId, stream }) => (
          <RemoteVideo key={peerId} peerId={peerId} stream={stream} />
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className={`flex items-center justify-center rounded-full ${
            isMuted ? "bg-red-600 text-white" : "bg-gray-700 text-white"
          }`}
          onClick={toggleMute}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`flex items-center justify-center rounded-full ${
            isVideoOff ? "bg-red-600 text-white" : "bg-gray-700 text-white"
          }`}
          onClick={toggleVideo}
        >
          {isVideoOff ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="flex items-center justify-center rounded-full bg-red-600 text-white"
          onClick={leaveCall}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}