const fields = [
    { name: "employeeId", label: "Employee ID", type: "text", required: true },
    { name: "employeeName", label: "Employee Name", type: "text", required: true },
    { name: "employeeCode", label: "Employee Code", type: "text", required: true },
    { name: "designation", label: "Designation", type: "text", required: true },
    { name: "project", label: "Project", type: "text", required: true },
    { name: "dateOfJoining", label: "Date of Joining", type: "date", required: true },
    { name: "location", label: "Location", type: "text", required: true },
    { name: "resignationSubmittedDate", label: "Resignation Submitted Date", type: "date", required: true },
    { name: "lastWorkingDay", label: "Last Working Day", type: "date", required: true },
    { name: "panCardNumber", label: "PAN Card Number", type: "text", required: true },
    { name: "bankAccountNumber", label: "Bank Account Number", type: "text", required: true },
    { name: "employeeAddress", label: "Employee Address", type: "text", required: true },
    { name: "contactNumberResidence", label: "Contact Number (Residence)", type: "tel", required: true },
    { name: "mobileNumber", label: "Mobile Number", type: "tel", required: true },
    { name: "employeeEmail", label: "employee Email", type: "email", required: true },
    { name: "employmentStatus", label: "Employment Status", type: "text", required: true }
  ];
  
  const mapToApi = {
    employeeId: "employeeId",
    employeeName: "employeeName",
    employeeCode: "employeeCode",
    designation: "designation",
    project: "project",
    dateOfJoining: "dateOfJoining",
    location: "location",
    resignationSubmittedDate: "resignationSubmittedDate",
    lastWorkingDay: "lastWorkingDay",
    panCardNumber: "panCardNumber",
    bankAccountNumber: "bankAccountNumber",
    employeeAddress: "employeeAddress",
    contactNumberResidence: "contactNumberResidence",
    mobileNumber: "mobileNumber",
    employeeEmail: "employeeEmail",
    employmentStatus: "employmentStatus"
  };
