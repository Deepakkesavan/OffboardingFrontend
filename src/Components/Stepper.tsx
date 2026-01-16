import React, { useState } from "react";
import "./Styles/stepper.css";
import DynamicForm from "./DynamicForm";

const steps = ["Employee Details", "Reporting Manager Approval","Finance/Accounce Approval","Administration", "HR Approval"];

const fields = [
  { name: "EmployeeName", label: "Employee Name", type: "text", required: true },
  { name: "EmployeeCode", label: "Employee Code", type: "text", required: true },
  { name: "Designation", label: "Designation", type: "text", required: true },
  { name: "Project", label: "Project", type: "text", required: true },
  { name: "DateOfJoining", label: "Date of Joining", type: "date", required: true },
  { name: "Location", label: "Location", type: "text", required: true },
  { name: "ResignationSubmittedDate", label: "Resignation Submitted Date", type: "date", required: true },
  { name: "LastWorkingDay", label: "Last Working Day", type: "date", required: true },
  { name: "PanCardNumber", label: "PAN Card Number", type: "text", required: true },
  { name: "bankAccountNumber", label: "Bank Account Number", type: "text", required: true },
  { name: "EmployeeAddress", label: "Employee Address", type: "text", required: true },
  { name: "ContactNumberResidence", label: "Contact Number (Residence)", type: "tel", required: true },
  { name: "MobileNumber", label: "Mobile Number", type: "tel", required: true },
  { name: "EmployeeEmail", label: "employee Email", type: "email", required: true },
  { name: "EmploymentStatus", label: "Employment Status", type: "text", required: true }
];

const mapToApi = {
  EmployeeName: "EmployeeName",
  EmployeeCode: "EmployeeCode",
  Designation: "Designation",
  Project: "Project",
  DateOfJoining: "DateOfJoining",
  Location: "Location",
  ResignationSubmittedDate: "ResignationSubmittedDate",
  LastWorkingDay: "LastWorkingDay",
  PanCardNumber: "PanCardNumber",
  bankAccountNumber: "bankAccountNumber",
  EmployeeAddress: "EmployeeAddress",
  ContactNumberResidence: "ContactNumberResidence",
  MobileNumber: "MobileNumber",
  EmployeeEmail: "EmployeeEmail",
  EmploymentStatus: "EmploymentStatus"
};

const ReportingManagerfields = [
  { name: "DocumentName", label: "Document Name", type: "text", required: true }
];
const ReportingManagermapToApi = {
  DocumentName: "DocumentName"
};

const ItDepartmentfields = [
  { name: "LoginIdToBeDisabledFrom", label: "Login Id to be disabled from", type: "text", required: true },
  { name: "MailIdToBeDisabledFrom", label: "Mail Id To Be Disabled From", type: "text", required: true },
  { name: "VDIAccess", label: "VDI Access", type: "text", required: true },
  { name: "BioMetricODC", label: "BioMetricODC", type: "text", required: true }
]

const ItDepartmentmapToApi = {
  LoginIdToBeDisabledFrom: "LoginIdToBeDisabledFrom",
  MailIdToBeDisabledFrom: "MailIdToBeDisabledFrom",
  Vdiaccess: "VDIAccess",
  BioMetricOdc: "BioMetricODC"
}

const AdministrationFields = [
  { name: "IdentityCardorAccesscard", label: "Identity Card/ Access card", type: "text", required: true },
  { name: "Laptopwithallaccessories", label: "Laptop with all accessories", type: "text", required: true },
  { name: "OfficeorDeskKeys", label: "Office/Desk keys", type: "text", required: true },
  { name: "BusinessCards", label: "Business Cards", type: "text", required: true },
  { name: "Companydocuments", label: "Company documents", type: "text", required: true },
  { name: "CompanyBookorManuals", label: "Company book / Manuals", type: "text", required: true }
]
const AdministrationmapToApi = {
  IdentityCardorAccesscard: "IdentityCardorAccesscard",
  Laptopwithallaccessories: "Laptopwithallaccessories",
  OfficeorDeskKeys: "OfficeorDeskKeys",
  BusinessCards: "BusinessCards",
  Companydocuments: "Companydocuments",
  CompanyBookorManuals: "CompanyBookorManuals"
}
const HrApprovalFields = [
  { name: "NoticePayStatus", label: "Resignation Letter Attached", type: "text", required: true },
  { name: "NoticePayDaysPayable", label: "Notice PayDays Payable", type: "text", required: true },
  { name: "NoticePayDaysRecoverable", label: "Notice PayDays Recoverable", type: "text", required: true },
  { name: "MediclaimOrMealCardStatus", label: "Mediclaim Or MealCard Status", type: "text", required: true },
  { name: "IncomeTaxProofStatus", label: "Income Tax Proof Status", type: "text", required: true },
  { name: "ExitInterviewFormAttached", label: "Exit Interview Form Attached", type: "text", required: true },
  { name: "ResignationLetterAttached", label: "Resignation Letter Attached", type: "text", required: true }

]
const HrApprovalmapToApi = {
  NoticePayStatus: "NoticePayStatus",
  NoticePayDaysPayable: "NoticePayDaysPayable",
  NoticePayDaysRecoverable: "NoticePayDaysRecoverable",
  MediclaimOrMealCardStatus: "MediclaimOrMealCardStatus",
  IncomeTaxProofStatus: "IncomeTaxProofStatus",
  ExitInterviewFormAttached: "ExitInterviewFormAttached",
  ResignationLetterAttached: "ResignationLetterAttached"

}

const StepperComponent: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [form2Submitted, setForm2Submitted] = useState(false);
  const [form3Submitted, setForm3Submitted] = useState(false);
  const [form4Submitted, setForm4Submitted] = useState(false);
  const [form5Submitted, setForm5Submitted] = useState(false);
  const isStepOptional = (_step: number) => false;

  const isStepSkipped = (step: number) => skippedSteps.has(step);

  const handleNext = () => {
    if (activeStep === 0 && !formSubmitted) {
      // Don't proceed if form not submitted
      return;
    }

    if (activeStep === 1 && !form2Submitted) {
      return;
    }

    if (activeStep === 2 && !form3Submitted) {
      return;
    }

    if (activeStep === 3 && !form4Submitted) {
      return;
    }
    if (activeStep === 4 && !form5Submitted) {
      return;
    }

    if (isStepSkipped(activeStep)) {
      const newSkipped = new Set(skippedSteps);
      newSkipped.delete(activeStep);
      setSkippedSteps(newSkipped);
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);


  const handleReset = () => {
    setActiveStep(0);
    setSkippedSteps(new Set());
    setFormSubmitted(false);
  };

  const handleFormSubmitSuccess = () => {
    setFormSubmitted(true);
    // Automatically move to next step after successful submission
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleForm2SubmitSuccess = () => {
    setForm2Submitted(true);
    setTimeout(() => {
      handleNext();
    }, 500);
  };
  const handleForm3SubmitSuccess = () => {
    setForm3Submitted(true);
    setTimeout(() => {
      handleNext();
    }, 500);
  };
  const handleForm4SubmitSuccess = () => {
    setForm4Submitted(true);
    setTimeout(() => {
      handleNext();
    }, 500);
  };
  const handleForm5SubmitSuccess = () => {
    setForm5Submitted(true);
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  return (
    <div className="stepper-wrapper">
      {/* TOP STEPPER INDICATOR */}
      <div className="stepper">
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep && !isStepSkipped(index);
          const optional = isStepOptional(index);

          return (
            <div key={label} className="step">
              <div
                className={`step-circle ${
                  isActive
                    ? "active"
                    : isCompleted
                    ? "completed"
                    : isStepSkipped(index)
                    ? "skipped"
                    : ""
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <div className="step-label">
                {label}
                {optional && <span className="optional">(Optional)</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP CONTENT */}
      {activeStep === steps.length ? (
        <div className="step-content">
          <p>All steps completed — you're finished!</p>
          <button onClick={handleReset}>Reset</button>
        </div>
      ) : (
        <div className="step-content">
          <p>Step {activeStep + 1}</p>

          {/* Show form only in first step */}
          {activeStep === 0 && (
            <DynamicForm
              fields={fields}
              apiMap={mapToApi}
              apiUrl="http://localhost:5116/api/EmployeeOffboarding"
              onSubmitSuccess={handleFormSubmitSuccess}
            />
          )}

          {activeStep === 1 && (
            <DynamicForm
              fields={ReportingManagerfields}
              apiMap={ReportingManagermapToApi}
              apiUrl="http://localhost:5116/api/ReportingManager"
              onSubmitSuccess={handleForm2SubmitSuccess}
            />
          )}

          {activeStep === 2 && (
            <DynamicForm
              fields={ItDepartmentfields}
              apiMap={ItDepartmentmapToApi}
              apiUrl="http://localhost:5116/api/ItDepartment"
              onSubmitSuccess={handleForm3SubmitSuccess}
            />
          )}

          {activeStep === 3 && (
            <DynamicForm
              fields={AdministrationFields}
              apiMap={AdministrationmapToApi}
              apiUrl="http://localhost:5116/api/Admin"
              onSubmitSuccess={handleForm4SubmitSuccess}
            />
          )}
          {activeStep === 4 && (
            <DynamicForm
              fields={HrApprovalFields}
              apiMap={HrApprovalmapToApi}
              apiUrl="http://localhost:5116/api/HrApproval"
              onSubmitSuccess={handleForm5SubmitSuccess}
            />
          )}

          <div className="controls">
            <button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </button>

            {isStepOptional(activeStep)}

            <button onClick={handleNext} disabled={activeStep === 0 && !formSubmitted}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepperComponent;