import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { TrendingUp } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminPackagePanel from "../../components/admin/panels/AdminPackagePanel";
import AdminUserPanel from "../../components/admin/panels/AdminUserPanel";
import AdminInvoicePanel from "../../components/admin/panels/AdminInvoicePanel";
import AdminRevenuePanel from "../../components/admin/panels/AdminRevenuePanel"; 
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusModal from "../../components/common/StatusModal";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("paket");
  const [invoiceCount, setInvoiceCount] = useState(0);

  const [statusModal, setStatusModal] = useState({
    show: false,
    title: "",
    msg: "",
    type: "success",
  });

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    msg: "",
    variant: "primary",
    actionCallback: null,
  });

  const [loadingAction, setLoadingAction] = useState(false);

  const showStatus = (title, msg, type = "success") => {
    setStatusModal({ show: true, title, msg, type });
  };

  const showConfirm = (
    title,
    msg,
    variant = "primary",
    onConfirmAction = null
  ) => {
    setConfirmModal({
      show: true,
      title,
      msg,
      variant,
      actionCallback: onConfirmAction,
    });
  };

  const handleExecuteConfirm = async () => {
    if (confirmModal.actionCallback) {
      setLoadingAction(true);
      try {
        await confirmModal.actionCallback();
      } catch (error) {
        showStatus(
          "Gagal",
          error.message || "Terjadi kesalahan sistem.",
          "error"
        );
      } finally {
        setLoadingAction(false);
        setConfirmModal((prev) => ({ ...prev, show: false }));
      }
    } else {
      setConfirmModal((prev) => ({ ...prev, show: false }));
    }
  };

  return (
    <Row className="g-4">
      <Col lg={3}>
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          invoiceCount={invoiceCount}
        />
      </Col>

      <Col lg={9}>
        {activeTab === "paket" && (
          <AdminPackagePanel showInfo={showStatus} showConfirm={showConfirm} />
        )}

        {activeTab === "guru" && (
          <AdminUserPanel showInfo={showStatus} showConfirm={showConfirm} />
        )}

        {activeTab === "invoice" && (
          <AdminInvoicePanel
            showInfo={showStatus}
            showConfirm={showConfirm}
            onInvoiceUpdate={(data) =>
              setInvoiceCount(
                data.filter((i) => i.status === "waiting_confirmation").length
              )
            }
          />
        )}

        {activeTab === "laporan" && <AdminRevenuePanel />}
      </Col>

      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.msg}
        variant={confirmModal.variant}
        loading={loadingAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        onConfirm={handleExecuteConfirm}
      />

      <StatusModal
        show={statusModal.show}
        title={statusModal.title}
        message={statusModal.msg}
        type={statusModal.type}
        onHide={() => setStatusModal((prev) => ({ ...prev, show: false }))}
      />
    </Row>
  );
}
