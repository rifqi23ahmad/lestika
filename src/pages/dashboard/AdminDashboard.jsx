import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminPackagePanel from "../../components/admin/panels/AdminPackagePanel";
import AdminUserPanel from "../../components/admin/panels/AdminUserPanel";
import AdminInvoicePanel from "../../components/admin/panels/AdminInvoicePanel";
import StatusModal from "../../components/common/StatusModal";
import ConfirmModal from "../../components/common/ConfirmModal";

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

  const showInfo = (title, msg, type = "success") => {
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
        showInfo(
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
          <AdminPackagePanel showInfo={showInfo} showConfirm={showConfirm} />
        )}

        {activeTab === "guru" && (
          <AdminUserPanel showInfo={showInfo} showConfirm={showConfirm} />
        )}

        {activeTab === "invoice" && (
          <AdminInvoicePanel
            showInfo={showInfo}
            showConfirm={showConfirm}
            onInvoiceUpdate={(data) =>
              setInvoiceCount(
                data.filter((i) => i.status === "waiting_confirmation").length
              )
            }
          />
        )}
      </Col>

      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.msg} 
        variant={confirmModal.variant}
        loading={loadingAction}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={handleExecuteConfirm}
      />

      <StatusModal
        show={statusModal.show}
        title={statusModal.title}
        message={statusModal.msg} 
        type={statusModal.type}
        onHide={() => setStatusModal({ ...statusModal, show: false })}
      />
    </Row>
  );
}
