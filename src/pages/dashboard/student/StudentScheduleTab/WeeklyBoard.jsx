import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Check } from "lucide-react";

export default function WeeklyBoard({
  slots,
  user,
  setConfirmModal,
  formatTime,
  getDayNameFromDate,
}) {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  const grid = {};
  days.forEach((d) => (grid[d] = []));

  slots.forEach((slot) => {
    const day = getDayNameFromDate(slot.start_time);
    if (grid[day]) grid[day].push(slot);
  });

  const times = [
    ...new Set(
      slots.map(
        (s) =>
          `${formatTime(s.start_time)}-${formatTime(s.end_time)}`
      )
    ),
  ];

  return (
    <Card className="border-0 shadow-sm rounded-4 p-3 overflow-auto">
      <div
        className="d-grid"
        style={{
          gridTemplateColumns: `120px repeat(${days.length}, minmax(140px,1fr))`,
        }}
      >
        <div />
        {days.map((d) => (
          <div key={d} className="fw-bold text-center py-2">
            {d}
          </div>
        ))}

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="fw-bold py-3 border-end">{time}</div>
            {days.map((day) => {
              const slot = grid[day].find(
                (s) =>
                  `${formatTime(s.start_time)}-${formatTime(
                    s.end_time
                  )}` === time
              );

              if (!slot) return <div key={day} className="border" />;

              const isMine = slot.student_id === user.id;
              const isBooked = slot.status === "booked" && !isMine;

              return (
                <div key={day} className="border p-2 text-center">
                  {isMine ? (
                    <Badge bg="success">
                      <Check size={14} /> Kamu
                    </Badge>
                  ) : isBooked ? (
                    <Badge bg="secondary">Terisi</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        setConfirmModal({ show: true, slot })
                      }
                    >
                      Ambil
                    </Button>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}
