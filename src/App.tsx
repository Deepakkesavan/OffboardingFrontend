import './App.css';
import DynamicForm from './Components/DynamicForm';
import Sidebar from './Components/sidebar';
import Stepper from "./Components/Stepper"

const fields = [
  { name: "id", label: "Employee Id", type: "number", required: true },
  { name: "name", label: "Employee Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "reason", label: "Reason for Exit", type: "text", required: true },
  { name: "lwd", label: "Last Working Day", type: "date", required: true }
];

const mapToApi = {
  id: "EmployeeId",
  name: "employeeName",
  email: "employeeEmail",
  reason: "reasonForExit",
  lwd: "lastWorkingDay"
};
function App() {

  return (
    <>
    <Sidebar></Sidebar>
    <Stepper></Stepper>
    {/* <div style={{ padding: "20px" }}>
      <h2>Employee Offboarding Form</h2>

      <DynamicForm 
        fields={fields}
        apiMap={mapToApi}
        apiUrl="http://localhost:5116/api/EmployeeOffboarding"
      />
    </div> */}
    </>
    
  )
}

export default App