import React from "react";
import { Card, Badge } from "react-bootstrap";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function WeeklyScheduleBoard({
  slots,
  onSlotClick,
  getSlotVariant,
  renderSlotContent,
}) {
  const groupedSlots = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter((slot) => {
      const dayName = format(new Date(slot.start_time), "EEEE", { locale: id });
      return dayName === day;
    });
    return acc;
  }, {});

  return (
    <div className="d-none d-md-flex gap-3 overflow-auto pb-3">
      {DAYS.map((day) => (
        <div key={day} style={{ minWidth: "160px", flex: 1 }}>
          <div className="text-center fw-bold py-2 mb-3 bg-light rounded text-secondary text-uppercase small">
            {day}
          </div>
          <div className="d-flex flex-column gap-2">
            {groupedSlots[day].map((slot) => (
              <Card
                key={slot.id}
                className={`border-0 shadow-sm cursor-pointer transition-all`}
                style={{ cursor: "pointer", borderLeft: "4px solid" }}
                onClick={() => onSlotClick(slot)}
              >
                <Card.Body className="p-2">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <Badge bg="light" text="dark" className="border">
                      {format(new Date(slot.start_time), "HH:mm")}
                    </Badge>
                    {getSlotVariant && (
                      <div
                        className={`rounded-circle bg-${getSlotVariant(slot)}`}
                        style={{ width: 8, height: 8 }}
                      />
                    )}
                  </div>
                  {renderSlotContent ? (
                    renderSlotContent(slot)
                  ) : (
                    <div className="fw-bold small">{slot.subject}</div>
                  )}
                </Card.Body>
              </Card>
            ))}
            {groupedSlots[day].length === 0 && (
              <div className="text-center py-4 text-muted small opacity-50 bg-light rounded border border-dashed">
                Kosong
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
