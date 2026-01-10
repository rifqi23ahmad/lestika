import React, { useState } from "react";
import PackageListView from "./components/PackageListView";
import QuestionDetailView from "./components/QuestionDetailView";

export default function QuestionBankTab({ user, showModal: showGlobalModal }) {
  const [activePackage, setActivePackage] = useState(null);

  if (activePackage) {
    return (
      <QuestionDetailView
        activePackage={activePackage}
        onBack={() => setActivePackage(null)}
        showToast={showGlobalModal}
      />
    );
  }

  return (
    <PackageListView
      user={user}
      onSelectPackage={setActivePackage}
      showToast={showGlobalModal}
    />
  );
}
