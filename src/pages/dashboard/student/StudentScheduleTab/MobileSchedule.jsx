import React, { useMemo, useState } from "react";
import { Card, Button, Badge, Dropdown } from "react-bootstrap";
import { ChevronDown, Check } from "lucide-react";

export default function MobileSchedule({
  groupSlotsByDayName,
  user,
  setConfirmModal,
  formatTime,
}) {
  const grouped = groupSlotsByDayName();

  const daysOrder = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  const todayName = useMemo(() => {
    const d = new Date();
    return daysOrder[d.getDay() === 0 ? 6 : d.getDay() - 1];
  }, []);

  const availableDays = daysOrder.filter(
    (day) => grouped[day] && grouped[day].length > 0
  );

  const [selectedDay, setSelectedDay] = useState(
    availableDays.includes(todayName) ? todayName : availableDays[0]
  );

  const slots = grouped[selectedDay] || [];

  return (
    <div className="d-flex flex-column gap-3">
      {/* DAY SELECTOR (CUSTOM DROPDOWN) */}
      <Dropdown>
        <Dropdown.Toggle
          variant="light"
          className="w-100 d-flex justify-content-between align-items-center rounded-pill shadow-sm border fw-semibold px-4 py-2"
        >
          <span>
            {selectedDay}
            {selectedDay === todayName && (
              <small className="text-primary ms-1">(Hari ini)</small>
            )}
          </span>
          <ChevronDown size={18} />
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100 shadow-sm border-0 rounded-4 mt-1">
          {availableDays.map((day) => (
            <Dropdown.Item
              key={day}
              active={day === selectedDay}
              onClick={() => setSelectedDay(day)}
              className="d-flex justify-content-between align-items-center"
            >
              <span>
                {day}
                {day === todayName && (
                  <small className="text-primary ms-1">(Hari ini)</small>
                )}
              </span>
              {day === selectedDay && <Check size={16} />}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* SLOT LIST */}
      {slots.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-4">
          <small className="text-muted">
            Tidak ada jadwal di hari ini.
          </small>
        </Card>
      ) : (
        slots.map((slot) => {
          const isMine = slot.student_id === user.id;
          const isBooked = slot.status === "booked" && !isMine;

          return (
            <Card
              key={slot.id}
              className={`border-0 shadow-sm ${
                isMine ? "bg-success bg-opacity-10" : ""
              }`}
            >
              <Card.Body>
                <div className="fw-bold mb-1">
                  {formatTime(slot.start_time)} –{" "}
                  {formatTime(slot.end_time)}
                </div>

                <div className="text-muted small mb-2">
                  {slot.subject}
                </div>

                {isMine ? (
                  <Badge bg="success" className="px-3 py-2">
                    <Check size={14} className="me-1" />
                    Jadwal Kamu
                  </Badge>
                ) : isBooked ? (
                  <Badge bg="secondary" className="px-3 py-2">
                    Terisi
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    className="w-100 rounded-pill"
                    onClick={() =>
                      setConfirmModal({ show: true, slot })
                    }
                  >
                    Ambil Jadwal
                  </Button>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}
    </div>
  );
}
