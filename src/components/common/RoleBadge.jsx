import React from "react";
import { Badge } from "react-bootstrap";

const ROLE_COLORS = {
  admin: "danger",
  guru: "success",
  siswa: "secondary",
};

export default function RoleBadge({ role }) {
  const bg = ROLE_COLORS[role] || "secondary";
  
  return (
    <Badge bg={bg} className="text-uppercase">
      {role}
    </Badge>
  );
}