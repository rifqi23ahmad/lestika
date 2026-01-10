import React from "react";
import { Container, Row, Col, Card, Nav, Dropdown, Button } from "react-bootstrap";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";

// --- CUSTOM TOGGLE DROPDOWN ---
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="d-flex align-items-center justify-content-between w-100 px-4 py-3 bg-primary text-white shadow-sm cursor-pointer transition-all"
    style={{ 
      borderRadius: "12px", 
      cursor: "pointer",
      background: "linear-gradient(45deg, #0d6efd, #0a58ca)" 
    }}
  >
    {children}
  </div>
));

export default function DashboardLayout({ 
  title = "Dashboard",
  onBack,
  activeTab,
  onTabChange,
  tabsConfig, // Object registry tab (icon, label)
  headerRightContent = null, // Badge status dsb
  topContent = null, // Info Card (Siswa) atau Stats (Guru)
  children // Konten Tab yang aktif
}) {
  const isMobile = useIsMobile();
  
  // Ambil label & icon dari tab yang aktif
  const ActiveIcon = tabsConfig[activeTab]?.icon;
  const ActiveLabel = tabsConfig[activeTab]?.label || "Pilih Menu";

  return (
    <Container className="py-4 pb-5">
      
      {/* HEADER: Back Button & Title/Badge */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <Button
          variant="link"
          className="text-decoration-none text-muted p-0 d-flex align-items-center fw-bold"
          onClick={onBack}
        >
          <ArrowLeft size={18} className="me-2" />
          {title}
        </Button>

        {headerRightContent}
      </div>

      <Row className="g-4">
        {/* TOP CONTENT (Info Card Siswa, dsb) */}
        {topContent && (
          <Col xs={12}>
            {topContent}
          </Col>
        )}

        {/* MAIN NAVIGATION CARD */}
        <Col xs={12}>
          <Card className="shadow-sm border-0 rounded-4 overflow-hidden" style={{ minHeight: "60vh" }}>
            
            {/* NAVIGATION AREA */}
            <div className="border-bottom px-3 pt-3 bg-white">
              {isMobile ? (
                // --- MOBILE: DROPDOWN ---
                <div className="pb-3">
                  <label className="text-muted small fw-bold mb-2 ms-1">Menu:</label>
                  <Dropdown onSelect={onTabChange} className="w-100">
                    <Dropdown.Toggle as={CustomToggle} id="dashboard-menu-dropdown">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-white bg-opacity-25 p-1 rounded">
                           {ActiveIcon && <ActiveIcon size={20} />}
                        </div>
                        <span className="fw-bold">{ActiveLabel}</span>
                      </div>
                      <ChevronDown size={18} className="opacity-75" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="w-100 border-0 shadow-lg rounded-4 mt-2 overflow-hidden p-0">
                      {Object.entries(tabsConfig).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const isActive = activeTab === key;
                        return (
                          <Dropdown.Item 
                            key={key} 
                            eventKey={key}
                            active={isActive}
                            className={`d-flex align-items-center gap-3 py-3 px-4 ${
                              isActive 
                              ? 'bg-primary bg-opacity-10 text-primary fw-bold' 
                              : 'text-muted hover-bg-light'
                            }`}
                          >
                            <Icon size={18} className={isActive ? "text-primary" : "text-muted"} />
                            {cfg.label}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              ) : (
                // --- DESKTOP: TABS ---
                <Nav 
                  variant="tabs" 
                  activeKey={activeTab} 
                  onSelect={onTabChange}
                  className="border-bottom-0"
                >
                  {Object.entries(tabsConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <Nav.Item key={key}>
                        <Nav.Link 
                          eventKey={key}
                          className={`d-flex align-items-center gap-2 px-4 py-3 fw-semibold border-bottom-0 rounded-top-3 ${
                            activeTab === key ? "text-primary bg-light border border-bottom-0" : "text-muted"
                          }`}
                        >
                          <Icon size={18} />
                          {cfg.label}
                        </Nav.Link>
                      </Nav.Item>
                    );
                  })}
                </Nav>
              )}
            </div>

            {/* CONTENT AREA */}
            <div className="p-4 bg-light bg-opacity-50 h-100">
               {children}
            </div>

          </Card>
        </Col>
      </Row>
    </Container>
  );
}