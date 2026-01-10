import React, { useMemo, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminPackagePanel from "../../components/admin/panels/AdminPackagePanel";
import AdminUserPanel from "../../components/admin/panels/AdminUserPanel";
import AdminInvoicePanel from "../../components/admin/panels/AdminInvoicePanel";
import AdminRevenuePanel from "../../components/admin/panels/AdminRevenuePanel";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusModal from "../../components/common/StatusModal";

const ADMIN_TAB_REGISTRY = {
  paket: true,
  guru: true,
  invoice: true,
  laporan: true,
};

const DEFAULT_TAB = "paket";

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return ADMIN_TAB_REGISTRY[t] ? t : DEFAULT_TAB;
  }, [searchParams]);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

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

  const showStatus = (title, msg, type = "success") =>
    setStatusModal({ show: true, title, msg, type });

  const showConfirm = (title, msg, variant, action) =>
    setConfirmModal({
      show: true,
      title,
      msg,
      variant,
      actionCallback: action,
    });

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
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={async () => {
          if (confirmModal.actionCallback) {
            setLoadingAction(true);
            await confirmModal.actionCallback();
            setLoadingAction(false);
            setConfirmModal({ ...confirmModal, show: false });
          }
        }}
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
