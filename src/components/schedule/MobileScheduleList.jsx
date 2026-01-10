import React from "react";
import { Card, Badge, Accordion } from "react-bootstrap";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function MobileScheduleList({
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
    <div className="d-md-none">
      <Accordion defaultActiveKey={DAYS[0]}>
        {DAYS.map((day, idx) => {
          const daySlots = groupedSlots[day];
          const hasSlots = daySlots.length > 0;

          return (
            <Accordion.Item
              eventKey={day}
              key={day}
              className="mb-2 border-0 shadow-sm rounded overflow-hidden"
            >
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 me-3">
                  <span
                    className={`fw-bold ${
                      hasSlots ? "text-primary" : "text-muted"
                    }`}
                  >
                    {day}
                  </span>
                  <Badge bg={hasSlots ? "primary" : "secondary"} pill>
                    {daySlots.length}
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body className="bg-light p-2">
                {hasSlots ? (
                  <div className="d-flex flex-column gap-2">
                    {daySlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className="border-0 shadow-sm"
                        onClick={() => onSlotClick(slot)}
                      >
                        <Card.Body className="p-3 d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex gap-2 align-items-center mb-1">
                              <Badge bg="light" text="dark" className="border">
                                {format(new Date(slot.start_time), "HH:mm")} -{" "}
                                {format(new Date(slot.end_time), "HH:mm")}
                              </Badge>
                              {getSlotVariant && (
                                <Badge
                                  bg={getSlotVariant(slot)}
                                  className="text-uppercase"
                                  style={{ fontSize: "0.6rem" }}
                                >
                                  Status
                                </Badge>
                              )}
                            </div>
                            {renderSlotContent ? (
                              renderSlotContent(slot)
                            ) : (
                              <div className="fw-bold text-dark">
                                {slot.subject}
                              </div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted small fst-italic">
                    Tidak ada jadwal
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}
