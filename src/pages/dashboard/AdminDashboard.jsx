import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminPackagePanel from "../../components/admin/panels/AdminPackagePanel";
import AdminUserPanel from "../../components/admin/panels/AdminUserPanel";
import AdminInvoicePanel from "../../components/admin/panels/AdminInvoicePanel";
import {
  ConfirmModal,
  InfoModal,
} from "../../components/admin/modals/DashboardModals";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("paket"); // 'paket' | 'guru' | 'invoice'
  const [invoiceCount, setInvoiceCount] = useState(0);

  // State untuk Modals (Lifted Up State)
  const [infoModal, setInfoModal] = useState({
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

  // --- Helper Functions untuk Modals ---
  const showInfo = (title, msg, type = "success") => {
    setInfoModal({ show: true, title, msg, type });
  };

  /**
   * onConfirmAction: fungsi async yang akan dijalankan jika user klik "Ya"
   */
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
        setConfirmModal({ ...confirmModal, show: false });
      }
    } else {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  return (
    <Row className="g-4">
      {/* SIDEBAR */}
      <Col lg={3}>
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          invoiceCount={invoiceCount}
        />
      </Col>

      {/* MAIN CONTENT PANELS */}
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

      {/* GLOBAL MODALS */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        msg={confirmModal.msg}
        variant={confirmModal.variant}
        loading={loadingAction}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={handleExecuteConfirm}
      />

      <InfoModal
        show={infoModal.show}
        title={infoModal.title}
        msg={infoModal.msg}
        type={infoModal.type}
        onClose={() => setInfoModal({ ...infoModal, show: false })}
      />
    </Row>
  );
}